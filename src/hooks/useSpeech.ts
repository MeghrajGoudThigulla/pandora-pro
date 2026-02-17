"use client";

import { useState, useRef } from "react";

export const useSpeech = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const speak = async (text: string) => {
        if (!text) return;

        // Stop any currently playing audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        setIsPlaying(true);
        try {
            const response = await fetch("/api/speech", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Speech generation failed: ${errorText}`);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audioRef.current = audio;

            audio.onended = () => {
                setIsPlaying(false);
                URL.revokeObjectURL(url);
                audioRef.current = null;
            };

            audio.onerror = () => {
                setIsPlaying(false);
                URL.revokeObjectURL(url);
                audioRef.current = null;
            };

            await audio.play();
        } catch (error) {
            console.error("Speech error:", error);
            setIsPlaying(false);
        }
    };

    return { speak, isPlaying };
};
