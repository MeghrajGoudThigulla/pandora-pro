"use client";

import { motion } from "framer-motion";
import { MorphicButton } from "@/components/ui/MorphicButton";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-slate-50 to-emerald-50">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex border border-white/20 bg-white/40 backdrop-blur-md p-12 rounded-3xl shadow-2xl"
            >
                <div className="flex flex-col gap-6">
                    <h1 className="text-6xl font-extrabold tracking-tight text-slate-900">
                        Meet <span className="text-emerald-600">Pandora Pro</span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
                        Experience the next generation of emotional awareness. Pandora Pro tracks your expressions, voice, and thoughts to provide deep, personalized companionship and coaching.
                    </p>
                    <div className="flex gap-4 mt-8">
                        <MorphicButton onClick={() => router.push('/auth')}>
                            Initialize Connection
                        </MorphicButton>
                        <MorphicButton variant="outline">
                            Learn More
                        </MorphicButton>
                    </div>
                </div>
            </motion.div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-200/20 rounded-full blur-[120px] -z-10"></div>
        </main>
    );
}
