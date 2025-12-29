"use client"
import { useState, useEffect } from "react";
import { type HeatmapData } from "./components/HeatMap";
import Heatmap from "./components/HeatMap";
import EmotionButtons from "./components/EmotionButtons";

export default function HomePageClient() {
    const [message, setMessage] = useState("");
    const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);

    const fetchHeatmap = async () => {
        try {
            const res = await fetch("/api/heatmap");
            const json = await res.json();
            setHeatmapData(json);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchHeatmap();
        const interval = setInterval(fetchHeatmap, 60_000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (emotion: string) => {
        if (!heatmapData) return;
        const previousData = heatmapData;

        const currentHour = new Date().getUTCHours().toString();
        const newHeatmap = {
            ...heatmapData,
            hourly: {
                ...heatmapData.hourly,
                [currentHour]: {
                    ...heatmapData.hourly[currentHour],
                    [emotion]: (heatmapData.hourly[currentHour][emotion] ?? 0) + 1,
                },
            },
        };
        setHeatmapData(newHeatmap);

        setMessage("Thanks for sharing! Your vote helps map global emotions.");

        try {
            const res = await fetch("/api/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emotion }),
            });
            const result = await res.json();

            if (!result.ok) {
                setHeatmapData(previousData);
                setMessage(result.error === "ALREADY_VOTED"
                    ? "You already voted today!"
                    : "Something went wrong, try again.");
            }
        } catch (err) {
            console.error(err);
            setHeatmapData(previousData);
            setMessage("Network error, try again.");
        }
    };

    return (
        <main className="min-h-screen bg-black text-white">
            <header className="border-b border-white/10">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Feels Aggregate" className="h-8" />
                    </div>
                    <div className="text-sm text-white/50">
                        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>
            </header>

            {/* Voting Section - Reduced padding on mobile */}
            <div className="max-w-6xl mx-auto px-4">
                <section className="py-8 md:py-12 text-center space-y-6">
                    <div className="space-y-3">
                        <h1 className="text-3xl sm:text-4xl font-bold">
                            How do you feel right now?
                        </h1>
                        <p className="text-white/50 text-sm max-w-md mx-auto">
                            One anonymous vote. See how the world feels today.
                        </p>
                    </div>
                    <EmotionButtons onSubmit={handleSubmit} />
                    {/* {message && (
                        <p className="text-sm text-white/50 animate-fade-in max-w-md mx-auto">
                            {message}
                        </p>
                    )} */}
                </section>
            </div>

            {/* Heatmap Section - Tighter on mobile, no top border gap */}
            <section className="border-t border-white/10">
                <div className="w-full">
                    <div className="px-4 sm:px-0">
                        <div className="max-w-6xl mx-auto">
                            {/* Reduced internal top padding via negative margin trick + responsive control */}
                            <div className="-mt-2 sm:mt-0 pt-6 sm:pt-12 pb-8 sm:pb-12">
                                <Heatmap data={heatmapData} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer - Less aggressive margin */}
            <div className="max-w-6xl mx-auto px-4">
                <footer className="border-t border-white/10 py-8 mt-8 sm:mt-12 text-center text-sm text-white/30">
                    <p>Anonymous. No tracking. One vote per day.</p>
                </footer>
            </div>
        </main>
    );
}