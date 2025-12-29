"use client";

import { useState } from "react";
import { submitEmotion } from "./actions/submitEmotion";
import EmotionButtons from "./components/EmotionButtons";
import Heatmap from "./components/HeatMap";
export default function HomePageClient() {
    const [message, setMessage] = useState("");
    const handleSubmit = async (emotion: string) => {
        const result = await submitEmotion(emotion as any);
        if (result.ok) {
            setMessage(`Thanks! You voted for ${emotion} at hour ${result.hour}.`);
        } else {
            setMessage("You already voted today!");
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-white px-4 py-12 md:px-8">
            <div className="max-w-5xl mx-auto space-y-12">
                <section className="text-center space-y-8">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                        How are you feeling right now?
                    </h1>
                    <EmotionButtons onSubmit={handleSubmit} />
                    {message && (
                        <p className="text-lg text-emerald-400 animate-fade-in">
                            {message}
                        </p>
                    )}
                </section>

                <section className="space-y-8">
                    <Heatmap />
                </section>
            </div>
        </main>
    );
}
