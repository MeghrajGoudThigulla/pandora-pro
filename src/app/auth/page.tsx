"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { MorphicButton } from "@/components/ui/MorphicButton";
import { MorphicInput } from "@/components/ui/MorphicInput";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Chrome } from "lucide-react";

export default function AuthPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen w-full flex items-center justify-center p-6 bg-gradient-to-tr from-emerald-50 via-white to-sky-50">
            <GlassCard className="w-full max-w-4xl flex flex-col md:flex-row overflow-hidden min-h-[600px]">
                {/* Left Side: Brand & Vibe */}
                <div className="flex-1 bg-emerald-600 p-12 flex flex-col justify-between relative overflow-hidden text-white">
                    <div className="z-10">
                        <h2 className="text-4xl font-black mb-4">Pandora Pro</h2>
                        <p className="opacity-80 text-lg">Your journey to emotional clarity begins here.</p>
                    </div>

                    <div className="z-10 mt-auto bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-sm italic">
                        "The first step towards change is awareness. Pandora helps you bridge the gap between feeling and understanding."
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-[-20px] left-[-20px] w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl" />
                </div>

                {/* Right Side: Form */}
                <div className="flex-[1.2] p-12 flex flex-col justify-center gap-8 bg-white/80">
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Welcome Back</h3>
                        <p className="text-slate-500 text-sm">Sign in to continue your sessions.</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <MorphicInput label="Email Address" placeholder="alex@example.com" type="email" />
                        <MorphicInput label="Password" placeholder="••••••••" type="password" />
                        <div className="flex justify-end">
                            <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Forgot password?</button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <MorphicButton onClick={() => router.push('/dashboard')}>
                            Sign In
                        </MorphicButton>
                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold">Or continue with</span></div>
                        </div>
                        <MorphicButton variant="outline" className="flex items-center justify-center gap-2">
                            <Chrome size={18} />
                            Google
                        </MorphicButton>
                    </div>

                    <p className="text-center text-xs text-slate-400">
                        Don't have an account? <button className="font-bold text-emerald-600 hover:underline">Sign up for free</button>
                    </p>
                </div>
            </GlassCard>
        </main>
    );
}
