"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MorphicButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "outline";
    className?: string;
    type?: "button" | "submit" | "reset";
}

export const MorphicButton = ({
    children,
    onClick,
    variant = "primary",
    className = "",
    type = "button"
}: MorphicButtonProps) => {
    const variants = {
        primary: "bg-emerald-600 text-white shadow-lg shadow-emerald-200/50 hover:bg-emerald-700",
        secondary: "bg-white text-slate-800 shadow-md hover:bg-slate-50",
        outline: "border-2 border-emerald-100 text-emerald-700 bg-transparent hover:bg-emerald-50",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            type={type}
            className={`px-6 py-3 rounded-full font-bold transition-all ${variants[variant]} ${className}`}
        >
            {children}
        </motion.button>
    );
};
