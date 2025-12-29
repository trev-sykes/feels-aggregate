"use client"
import { useState, useEffect } from "react";
import { type HeatmapData } from "./components/HeatMap";
import Heatmap from "./components/HeatMap";
import EmotionButtons from "./components/EmotionButtons";

export default function HomePageClient() {
    const [message, setMessage] = useState("");
    const [voted, setVoted] = useState(false);
    const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);

    // Fetch initial heatmap
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
        // 1️⃣ Optimistically update heatmap
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

        // 2️⃣ Update UI
        setMessage("Thanks for sharing! Your vote helps map global emotions.");
        setVoted(true);

        // 3️⃣ Send API request
        try {
            const res = await fetch("/api/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emotion }),
            });
            const result = await res.json();

            if (!result.ok) {
                // If API fails, rollback optimistic update
                setHeatmapData(heatmapData); // revert
                setMessage(result.error === "ALREADY_VOTED"
                    ? "You already voted today!"
                    : "Something went wrong, try again.");
            }
        } catch (err) {
            console.error(err);
            setHeatmapData(previousData); // revert
            setMessage("Network error, try again.");
        }
    };
    return (
        <main className="min-h-screen bg-black text-white">
            {/* Header (optional - you had one before, add back if needed) */}
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
            {/* Constrained hero section */}
            <div className="max-w-6xl mx-auto px-4">
                <section className="py-12 text-center space-y-6">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                            How do you feel right now?
                        </h1>
                        <p className="text-white/50 text-sm">
                            One anonymous vote. See how the world feels today.
                        </p>
                    </div>
                    <EmotionButtons onSubmit={handleSubmit} />
                    {message && (
                        <p className="text-sm text-white/50 animate-fade-in">
                            {message}
                        </p>
                    )}
                </section>
            </div>

            {/* FULL-BLEED HEATMAP SECTION - This is the magic */}
            <section className="border-t border-white/10 py-12">
                <div className="w-full">
                    {/* Negative margin to break out on mobile, reset on sm+ */}
                    <div className="-mx-4 sm:mx-0">
                        {/* Re-add safe padding inside on mobile */}
                        <div className="px-4 sm:px-0">
                            {/* Center content on larger screens */}
                            <div className="max-w-6xl mx-auto">
                                <Heatmap data={heatmapData} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Constrained footer */}
            <div className="max-w-6xl mx-auto px-4">
                <footer className="border-t border-white/10 py-8 mt-20 text-center text-sm text-white/30">
                    <p>Anonymous. No tracking. One vote per day.</p>
                </footer>
            </div>
        </main>
    );
}