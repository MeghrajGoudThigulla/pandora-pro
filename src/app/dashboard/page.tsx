"use client";

import { useEffect, useRef, useState, FormEvent, ChangeEvent } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { MorphicButton } from "@/components/ui/MorphicButton";
import { MorphicInput } from "@/components/ui/MorphicInput";
import { WebcamStream } from "@/components/ui/WebcamStream";
import { AvatarCanvas } from "@/components/AvatarCanvas";
import { useMultimodalInference } from "@/hooks/useMultimodalInference";
import { useAudioInference } from "@/hooks/useAudioInference";
import { useSpeech } from "@/hooks/useSpeech";
import { motion, AnimatePresence } from "framer-motion";
import { User, MessageSquare, Settings, Smile, Mic, Video, MicOff, Send, Volume2 } from "lucide-react";

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export default function DashboardPage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const inference = useMultimodalInference(videoRef);
    const audio = useAudioInference();
    const speech = useSpeech();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { id: Date.now().toString(), role: "user", content: input.trim() };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
                    context: {
                        emotion: inference.emotion,
                        age: inference.age,
                        isHesitating: inference.isHesitating,
                        vocalEnergy: audio.volume,
                    },
                }),
            });

            if (!res.ok) throw new Error("Chat request failed");

            const data = await res.json();
            const assistantMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: "assistant", content: data.content };
            setMessages(prev => [...prev, assistantMessage]);
            speech.speak(assistantMessage.content);
        } catch (err) {
            console.error("Chat error:", err);
            const errorMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: "assistant", content: "I'm having trouble connecting right now. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    const [showWebcam, setShowWebcam] = useState(true);
    const [isMicOn, setIsMicOn] = useState(false);

    const toggleMic = () => {
        if (!isMicOn) {
            audio.startTracking();
        } else {
            audio.stopTracking();
        }
        setIsMicOn(!isMicOn);
    };

    useEffect(() => {
        if (showWebcam && videoRef.current) {
            navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
                .then(stream => {
                    if (videoRef.current) videoRef.current.srcObject = stream;
                })
                .catch(err => console.error("Webcam error:", err));
        }
        return () => {
            if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
            }
        };
    }, [showWebcam]);

    return (
        <main className="h-screen w-screen bg-slate-50 overflow-hidden flex flex-col md:flex-row p-6 gap-6">
            {/* Navigation Sidebar */}
            <GlassCard className="w-20 hidden md:flex flex-col items-center py-8 gap-8">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 cursor-pointer">
                    <span className="text-white font-black text-xl">P</span>
                </div>
                <div className="flex-1 flex flex-col gap-6">
                    <NavItem icon={<MessageSquare size={24} />} active />
                    <NavItem icon={<Video size={24} />} />
                    <NavItem icon={<Mic size={24} />} />
                    <NavItem icon={<User size={24} />} />
                    <NavItem icon={<Settings size={24} />} />
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                </div>
            </GlassCard>

            {/* Main Content: Split Screen */}
            <div className="flex-1 flex flex-col md:flex-row gap-6">

                {/* Left Half: Avatar Viewport */}
                <GlassCard className="flex-[1.2] relative overflow-hidden flex flex-col items-center justify-center bg-gradient-to-b from-white/20 to-emerald-50/30">
                    <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10">
                        <div className="flex gap-3">
                            <div className="px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-white flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${inference.status === 'Live' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                <span className="text-xs font-bold text-slate-600">Pandora Live</span>
                            </div>

                            {isMicOn && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="px-4 py-2 bg-emerald-100/80 backdrop-blur-md border border-emerald-200 rounded-full flex items-center gap-2"
                                >
                                    <div className="flex gap-1 items-end h-3">
                                        <motion.div animate={{ height: [4, audio.volume * 0.5 + 4, 4] }} transition={{ repeat: Infinity }} className="w-1 bg-emerald-500 rounded-full" />
                                        <motion.div animate={{ height: [6, audio.volume + 6, 6] }} transition={{ repeat: Infinity, delay: 0.1 }} className="w-1 bg-emerald-500 rounded-full" />
                                        <motion.div animate={{ height: [4, audio.volume * 0.7 + 4, 4] }} transition={{ repeat: Infinity, delay: 0.2 }} className="w-1 bg-emerald-500 rounded-full" />
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-700 uppercase">Voice Sync active</span>
                                </motion.div>
                            )}

                            {speech.isPlaying && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="px-4 py-2 bg-blue-500 rounded-full shadow-lg flex items-center gap-2"
                                >
                                    <Volume2 size={12} className="text-white animate-pulse" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-tighter">Voice Output Streaming</span>
                                </motion.div>
                            )}
                        </div>

                        <div className="w-32 h-24 bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-white/20">
                            {showWebcam && (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover grayscale opacity-80"
                                />
                            )}
                        </div>
                    </div>

                    {/* 3D Avatar Area */}
                    <div className="w-full h-full flex items-center justify-center">
                        <AvatarCanvas
                            emotion={inference.emotion}
                            vocalEnergy={audio.volume}
                        />
                        <div className="absolute top-[65%] text-center flex flex-col gap-1 pointer-events-none">
                            <p className="text-emerald-700 font-bold tracking-widest uppercase text-[10px] opacity-60">Humanoid Engine V1</p>
                            <p className="text-slate-400 font-medium italic text-xs">Dynamic behavioral rendering...</p>
                        </div>
                    </div>

                    <GlassCard className="absolute bottom-10 px-8 py-3 flex items-center gap-4 bg-white/80">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Detected State</span>
                            <span className="text-lg font-bold text-emerald-700">{inference.emotion}</span>
                        </div>
                        <div className="w-[1px] h-8 bg-slate-200" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Cognitive Flow</span>
                            <span className="text-sm font-bold text-slate-600">
                                {inference.isHesitating ? 'Searching for words...' : 'Fluid'}
                            </span>
                        </div>
                        {isMicOn && (
                            <>
                                <div className="w-[1px] h-8 bg-slate-200" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Vocal Pitch</span>
                                    <span className="text-sm font-bold text-slate-600">{Math.round(audio.pitch)} Hz</span>
                                </div>
                            </>
                        )}
                    </GlassCard>
                </GlassCard>

                {/* Right Half: Chat Frame */}
                <GlassCard className="flex-1 flex flex-col bg-white">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Conversation</h2>
                            <p className="text-xs text-slate-400 font-medium tracking-wide">PANDORA CORE V2.0</p>
                        </div>
                        <div className="flex gap-2">
                            <div
                                onClick={toggleMic}
                                className={`p-2 rounded-xl transition-colors cursor-pointer ${isMicOn ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:bg-slate-50'}`}
                            >
                                {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                            </div>
                            <div
                                onClick={() => setShowWebcam(!showWebcam)}
                                className={`p-2 rounded-xl transition-colors cursor-pointer ${showWebcam ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:bg-slate-50'}`}
                            >
                                <Video size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                        {messages.length === 0 && (
                            <div className="bg-slate-50 self-start max-w-[85%] p-5 rounded-3xl rounded-tl-none border border-slate-100">
                                <p className="text-slate-700 text-sm leading-relaxed">
                                    I notice you're looking {inference.emotion.toLowerCase()} today. It's perfectly okay to feel that way. I'm here to listen.
                                </p>
                            </div>
                        )}

                        {messages.map((m: any) => (
                            <div
                                key={m.id}
                                className={`${m.role === 'user' ? 'bg-emerald-600 self-end rounded-tr-none shadow-lg shadow-emerald-200/50' : 'bg-white self-start rounded-tl-none border border-slate-100'} max-w-[85%] p-5 rounded-3xl`}
                            >
                                <p className={`${m.role === 'user' ? 'text-white' : 'text-slate-700'} text-sm leading-relaxed`}>
                                    {m.content}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <form
                        onSubmit={handleSubmit}
                        className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-4 items-center"
                    >
                        <MorphicInput
                            value={input}
                            onChange={handleInputChange}
                            placeholder="How are you feeling right now?"
                            className="flex-1"
                        />
                        <MorphicButton type="submit" className="h-[52px] w-[52px] rounded-2xl flex items-center justify-center p-0">
                            <Send size={20} />
                        </MorphicButton>
                    </form>
                </GlassCard>
            </div>
        </main>
    );
}

function NavItem({ icon, active = false }: { icon: React.ReactNode; active?: boolean }) {
    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-3 rounded-2xl transition-all ${active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-slate-400 hover:bg-slate-50'}`}
        >
            {icon}
        </motion.button>
    );
}
