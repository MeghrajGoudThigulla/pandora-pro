"use client";

import { useEffect, useRef, useState } from "react";

export interface AudioInferenceResult {
    volume: number;
    pitch: number;
    status: string;
}

export const useAudioInference = () => {
    const [result, setResult] = useState<AudioInferenceResult>({
        volume: 0,
        pitch: 0,
        status: "Idle",
    });

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const stopTracking = () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        streamRef.current?.getTracks().forEach(t => t.stop());
        audioContextRef.current?.close();
        streamRef.current = null;
        audioContextRef.current = null;
        analyserRef.current = null;
        animationFrameRef.current = null;
        setResult({ volume: 0, pitch: 0, status: "Idle" });
    };

    const startTracking = async () => {
        try {
            if (streamRef.current) stopTracking();

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;
            source.connect(analyser);
            analyserRef.current = analyser;

            setResult(prev => ({ ...prev, status: "Listening" }));

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const update = () => {
                if (!analyserRef.current) return;

                analyserRef.current.getByteFrequencyData(dataArray);

                // Calculate volume
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const volume = sum / bufferLength;

                // Simple pitch estimation (peak frequency)
                let maxVal = -1;
                let maxIndex = -1;
                for (let i = 0; i < bufferLength; i++) {
                    if (dataArray[i] > maxVal) {
                        maxVal = dataArray[i];
                        maxIndex = i;
                    }
                }
                const pitch = (maxIndex * audioContext.sampleRate) / analyser.fftSize;

                setResult({
                    volume,
                    pitch,
                    status: "Live",
                });

                animationFrameRef.current = requestAnimationFrame(update);
            };

            update();
        } catch (err) {
            console.error("Audio access error:", err);
            setResult(prev => ({ ...prev, status: "Error" }));
        }
    };

    useEffect(() => {
        return () => stopTracking();
    }, []);

    return { ...result, startTracking, stopTracking };
};
