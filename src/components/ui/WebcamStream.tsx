"use client";

import { useEffect, useRef } from "react";

interface WebcamStreamProps {
    onStreamReady: (video: HTMLVideoElement) => void;
    className?: string;
}

export const WebcamStream = ({ onStreamReady, className = "" }: WebcamStreamProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const enableWebcam = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480 }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Webcam access denied:", err);
            }
        };

        enableWebcam();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`rounded-2xl shadow-inner bg-slate-100 ${className}`}
        />
    );
};
