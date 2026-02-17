"use client";

import { motion, HTMLMotionProps } from "framer-motion";

interface MorphicInputProps extends HTMLMotionProps<"input"> {
    label?: string;
}

export const MorphicInput = ({ label, ...props }: MorphicInputProps) => {
    return (
        <div className="flex flex-col gap-2 w-full">
            {label && <label className="text-sm font-semibold text-slate-500 ml-2">{label}</label>}
            <motion.input
                whileFocus={{ scale: 1.01 }}
                className={`px-6 py-4 bg-white/50 backdrop-blur-md border border-slate-200 rounded-2xl outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all text-slate-800 ${props.className || ""}`}
                {...props}
            />
        </div>
    );
};
