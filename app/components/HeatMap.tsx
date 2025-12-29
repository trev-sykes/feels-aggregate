import { useEffect, useState } from "react";

export type HeatmapData = {
    day?: string;
    hourly: Record<string, Record<string, number>>;
};

const emotionConfig = {
    happy: { color: "#fbbf24", emoji: "😊", label: "Happy" },
    content: { color: "#60a5fa", emoji: "😌", label: "Content" },
    neutral: { color: "#9ca3af", emoji: "😐", label: "Neutral" },
    stressed: { color: "#fb923c", emoji: "😰", label: "Stressed" },
    sad: { color: "#a78bfa", emoji: "😢", label: "Sad" },
    angry: { color: "#f87171", emoji: "😠", label: "Angry" },
};

export default function Heatmap({ data }: { data: HeatmapData | null }) {
    const [hoveredHour, setHoveredHour] = useState<number | null>(null);

    if (!data) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    const emotions = Object.keys(emotionConfig);
    const hours = Object.keys(data.hourly).sort((a, b) => Number(a) - Number(b));

    const totalByEmotion = emotions
        .map((emotion) => ({
            emotion,
            total: hours.reduce(
                (sum, hour) => sum + (data.hourly[hour][emotion] ?? 0),
                0
            ),
        }))
        .sort((a, b) => b.total - a.total);

    const grandTotal = totalByEmotion.reduce((sum, e) => sum + e.total, 0);
    const dominant = totalByEmotion[0];
    const dominantConfig = emotionConfig[dominant.emotion as keyof typeof emotionConfig];
    const dominantPercent = Math.round((dominant.total / grandTotal) * 100);

    const currentHour = new Date().getUTCHours();

    return (
        <div className="space-y-12">
            {/* Header - Big emotional statement */}
            <div className="text-center space-y-4">
                <div className="text-7xl sm:text-8xl animate-pulse">{dominantConfig.emoji}</div>
                <h2 className="text-3xl sm:text-4xl font-bold">
                    The world feels{" "}
                    <span style={{ color: dominantConfig.color }}>
                        {dominant.emotion}
                    </span>
                </h2>
                <p className="text-white/50">
                    {dominantPercent}% of {grandTotal.toLocaleString()} people today
                </p>
            </div>

            {/* Emotion Flow - Horizontal timeline */}
            <div className="space-y-6">
                <h3 className="text-center text-lg text-white/70">
                    Today's emotional journey
                </h3>

                {/* The actual full-width timeline */}
                <div className="relative">
                    <div className="flex h-32 sm:h-40 rounded-lg overflow-hidden border border-white/10 shadow-xl">
                        {hours.map((hour) => {
                            const hourNum = Number(hour);
                            const isCurrent = hourNum === currentHour;
                            const isHovered = hoveredHour === hourNum;

                            const emotionData = emotions.map((emotion) => ({
                                emotion,
                                count: data.hourly[hour][emotion] ?? 0,
                            }));

                            const hourTotal = emotionData.reduce((sum, e) => sum + e.count, 0);

                            return (
                                <div
                                    key={hour}
                                    className="flex-1 relative flex flex-col-reverse group cursor-pointer"
                                    onMouseEnter={() => setHoveredHour(hourNum)}
                                    onMouseLeave={() => setHoveredHour(null)}
                                >
                                    {isCurrent && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full z-10">
                                            <div className="text-xs text-white/60 font-medium whitespace-nowrap mb-1">
                                                now
                                            </div>
                                            <div className="w-px h-3 bg-white/60 mx-auto" />
                                        </div>
                                    )}

                                    {/* Stacked bars */}
                                    {emotionData.map(({ emotion, count }) => {
                                        if (count === 0) return null;
                                        const config = emotionConfig[emotion as keyof typeof emotionConfig];
                                        const heightPercent = hourTotal > 0 ? (count / hourTotal) * 100 : 0;

                                        return (
                                            <div
                                                key={emotion}
                                                className="transition-all duration-300"
                                                style={{
                                                    height: `${heightPercent}%`,
                                                    backgroundColor: config.color,
                                                    opacity: isHovered ? 1 : 0.85,
                                                }}
                                            />
                                        );
                                    })}

                                    {/* Tooltip */}
                                    {isHovered && hourTotal > 0 && (
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/95 text-white px-3 py-2 rounded-lg text-xs z-20 pointer-events-none whitespace-nowrap">
                                            <div className="font-medium mb-1">{hour}:00</div>
                                            {emotionData
                                                .filter(e => e.count > 0)
                                                .sort((a, b) => b.count - a.count)
                                                .map(({ emotion, count }) => {
                                                    const config = emotionConfig[emotion as keyof typeof emotionConfig];
                                                    const percent = Math.round((count / hourTotal) * 100);
                                                    return (
                                                        <div key={emotion} className="flex items-center gap-1.5 text-[10px]">
                                                            <span>{config.emoji}</span>
                                                            <span className="capitalize">{emotion}</span>
                                                            <span className="text-white/60">{percent}%</span>
                                                        </div>
                                                    );
                                                })}
                                            <div className="text-white/50 text-[10px] mt-1 pt-1 border-t border-white/20">
                                                {hourTotal} total votes
                                            </div>
                                        </div>
                                    )}

                                    {hourTotal === 0 && (
                                        <div className="absolute inset-0 bg-white/5" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Hour labels below */}
                    <div className="flex justify-between mt-3 px-2 text-xs text-white/40">
                        <span>Midnight</span>
                        <span>Morning</span>
                        <span>Noon</span>
                        <span>Evening</span>
                    </div>
                </div>
            </div>
            {/* Legend - Top 3 emotions */}
            <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
                {totalByEmotion.slice(0, 3).map((item, index) => {
                    const config = emotionConfig[item.emotion as keyof typeof emotionConfig];
                    const percentage = Math.round((item.total / grandTotal) * 100);

                    return (
                        <div
                            key={item.emotion}
                            className="text-center space-y-2"
                        >
                            <div className="text-3xl">{config.emoji}</div>
                            <div className="text-sm font-medium capitalize">{item.emotion}</div>
                            <div className="text-2xl font-bold" style={{ color: config.color }}>
                                {percentage}%
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Subtle legend - all emotions */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-white/40">
                {emotions.map((emotion) => {
                    const config = emotionConfig[emotion as keyof typeof emotionConfig];
                    return (
                        <div key={emotion} className="flex items-center gap-1.5">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: config.color }}
                            />
                            <span className="capitalize">{emotion}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}