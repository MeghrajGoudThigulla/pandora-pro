import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Pandora Pro | Your AI-Powered Emotional Companion",
    description: "Advanced AI Therapist with real-time emotion tracking and high-fidelity interaction.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased overflow-hidden">
                <div className="blob top-[-100px] left-[-100px] opacity-40"></div>
                <div className="blob bottom-[-100px] right-[-100px] opacity-20"></div>
                {children}
            </body>
        </html>
    );
}
