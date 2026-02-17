import { Canvas, useFrame, useGraph } from "@react-three/fiber";
import { Float, ContactShadows, Environment, useGLTF, useAnimations } from "@react-three/drei";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";

interface AvatarCanvasProps {
    emotion: string;
    vocalEnergy: number;
}

const HumanoidAvatar = ({ emotion, vocalEnergy }: AvatarCanvasProps) => {
    // Using a professional female therapeutic avatar from the RPM library
    const { scene } = useGLTF("https://models.readyplayer.me/6626f8d168ba0157980362f6.glb?morphTargets=ARKit,Oculus+Visemes");
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const { nodes } = useGraph(clone);

    const headMesh = useMemo(() => {
        return Object.values(nodes).find(
            (node) => node.type === "SkinnedMesh" && (node as any).morphTargetInfluences
        ) as THREE.SkinnedMesh;
    }, [nodes]);

    useEffect(() => {
        if (scene) {
            scene.traverse((obj) => {
                if (obj instanceof THREE.Mesh) {
                    obj.castShadow = true;
                    obj.receiveShadow = true;
                }
            });
        }
    }, [scene]);

    useFrame((state) => {
        if (!headMesh || !headMesh.morphTargetDictionary || !headMesh.morphTargetInfluences) return;

        const t = state.clock.getElapsedTime();
        const influences = headMesh.morphTargetInfluences;
        const dictionary = headMesh.morphTargetDictionary;

        // Reset all influences smoothly
        for (let i = 0; i < influences.length; i++) {
            influences[i] = THREE.MathUtils.lerp(influences[i], 0, 0.1);
        }

        // Map Emotions to ARKit Blend Shapes
        const setTarget = (name: string, value: number) => {
            const idx = dictionary[name];
            if (idx !== undefined) {
                influences[idx] = THREE.MathUtils.lerp(influences[idx], value, 0.15);
            }
        };

        switch (emotion) {
            case "Happy":
                setTarget("mouthSmile", 0.8);
                setTarget("eyeWideLeft", 0.3);
                setTarget("eyeWideRight", 0.3);
                break;
            case "Sad":
                setTarget("mouthFrown", 0.7);
                setTarget("browDownLeft", 0.6);
                setTarget("browDownRight", 0.6);
                break;
            case "Angry":
                setTarget("browDownLeft", 1);
                setTarget("browDownRight", 1);
                setTarget("mouthPucker", 0.5);
                break;
            case "Anxious":
                setTarget("browInnerUp", 0.8);
                setTarget("mouthPucker", 0.3);
                break;
            case "Surprised":
                setTarget("eyeWideLeft", 1);
                setTarget("eyeWideRight", 1);
                setTarget("mouthOpen", 0.4);
                break;
        }

        // Add breathing effect and vocal responsiveness
        const breathing = Math.sin(t * 1.5) * 0.05;
        headMesh.position.y = breathing + (vocalEnergy / 100) * 0.02;

        // Subtle head sway
        headMesh.rotation.y = Math.sin(t * 0.5) * 0.1;
    });

    return <primitive object={clone} position={[0, -2.8, 0]} scale={1.8} />;
};

export const AvatarCanvas = ({ emotion, vocalEnergy }: AvatarCanvasProps) => {
    return (
        <div className="w-full h-full">
            <Canvas shadows camera={{ position: [0, 0, 3], fov: 40 }}>
                <ambientLight intensity={0.8} />
                <spotLight position={[5, 5, 5]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
                <pointLight position={[-5, -5, -5]} intensity={0.5} color="#3b82f6" />

                <HumanoidAvatar emotion={emotion} vocalEnergy={vocalEnergy} />

                <ContactShadows
                    position={[0, -2.8, 0]}
                    opacity={0.5}
                    scale={10}
                    blur={2.5}
                    far={4}
                />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
};
