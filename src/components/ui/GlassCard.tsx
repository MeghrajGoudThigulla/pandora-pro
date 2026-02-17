"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export const GlassCard = ({ children, className = "", delay = 0 }: GlassCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay }}
            className={`bg-white/40 backdrop-blur-lg border border-white/20 rounded-3xl shadow-xl shadow-slate-200/50 ${className}`}
        >
            {children}
        </motion.div>
    );
};
