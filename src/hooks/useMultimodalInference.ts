"use client";

import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

export interface InferenceResult {
    emotion: string;
    age: number | null;
    status: string;
    isHesitating: boolean;
}

export const useMultimodalInference = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
    const [result, setResult] = useState<InferenceResult>({
        emotion: "Attentive",
        age: null,
        status: "Initializing...",
        isHesitating: false,
    });
    const [isLoaded, setIsLoaded] = useState(false);
    const lastActiveRef = useRef<number>(Date.now());

    useEffect(() => {
        const loadModels = async () => {
            try {
                setResult(prev => ({ ...prev, status: "Loading AI models..." }));
                // Using models from a CDN for simplicity in initial setup
                const MODEL_URL = "/models";
                await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
                await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
                await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);

                setIsLoaded(true);
                setResult(prev => ({ ...prev, status: "Ready" }));
            } catch (error) {
                console.error("Error loading models:", error);
                setResult(prev => ({ ...prev, status: "Model error" }));
            }
        };

        loadModels();
    }, []);

    useEffect(() => {
        if (!isLoaded || !videoRef.current) return;

        let animationFrameId: number;

        const detect = async () => {
            if (videoRef.current && videoRef.current.readyState === 4) {
                try {
                    const detections = await faceapi
                        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                        .withFaceLandmarks()
                        .withFaceExpressions()
                        .withAgeAndGender();

                    if (detections) {
                        // Determine dominant emotion
                        const expressions = detections.expressions;
                        const dominantEmotion = Object.keys(expressions).reduce((a, b) =>
                            expressions[a as keyof typeof expressions] > expressions[b as keyof typeof expressions] ? a : b
                        );

                        // Check for hesitation/proactivity
                        const now = Date.now();
                        const timeSinceLastActive = (now - lastActiveRef.current) / 1000;
                        const isHesitating = timeSinceLastActive > 15;

                        // Simplify emotion name for UI
                        const emotionMap: { [key: string]: string } = {
                            neutral: "Neutral",
                            happy: "Happy",
                            sad: "Sad",
                            angry: "Angry",
                            fearful: "Anxious",
                            disgusted: "Overwhelmed",
                            surprised: "Surprised"
                        };

                        setResult({
                            emotion: emotionMap[dominantEmotion] || "Attentive",
                            age: Math.round(detections.age),
                            status: "Live",
                            isHesitating,
                        });
                    }
                } catch (error) {
                    console.warn("Inference cycle error:", error);
                }
            }
            animationFrameId = requestAnimationFrame(detect);
        };

        detect();

        return () => cancelAnimationFrame(animationFrameId);
    }, [isLoaded, videoRef]);

    return result;
};
