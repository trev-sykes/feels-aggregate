"use client";
import { useEffect, useState } from "react";

type HeatmapData = {
    day?: string;
    hourly: Record<string, Record<string, number>>;
};

const emotionConfig = {
    happy: { color: '#fbbf24', icon: '😊', gradient: 'from-yellow-400 to-amber-500' },
    content: { color: '#60a5fa', icon: '😌', gradient: 'from-blue-400 to-blue-600' },
    neutral: { color: '#9ca3af', icon: '😐', gradient: 'from-gray-400 to-gray-600' },
    stressed: { color: '#fb923c', icon: '😰', gradient: 'from-orange-400 to-orange-600' },
    sad: { color: '#a78bfa', icon: '😢', gradient: 'from-purple-400 to-purple-600' },
    angry: { color: '#f87171', icon: '😠', gradient: 'from-red-400 to-red-600' }
};

const getIntensity = (value: number, max: number) => (max === 0 ? 0 : value / max);


export default function Heatmap() {
    const [data, setData] = useState<HeatmapData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
    const [activeCell, setActiveCell] = useState<{ hour: string; emotion: string } | null>(null);
    const [currentHour, setCurrentHour] = useState<number>(new Date().getUTCHours());

    useEffect(() => {
        const updateHour = () => setCurrentHour(new Date().getUTCHours());

        updateHour(); // initial
        const interval = setInterval(updateHour, 60_000);

        return () => clearInterval(interval);
    }, []);

    const fetchHeatmap = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/heatmap");
            const json = await res.json();
            console.log(json);
            setData(json);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHeatmap();
        const interval = setInterval(fetchHeatmap, 60_000);
        return () => clearInterval(interval);
    }, []);

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                    <p className="text-gray-400">Loading emotion data...</p>
                </div>
            </div>
        );
    }

    const emotions = Object.keys(emotionConfig);
    const hours = Object.keys(data.hourly).sort((a, b) => Number(a) - Number(b));

    const maxValue = Math.max(
        ...hours.flatMap(hour => emotions.map(emotion => data.hourly[hour][emotion] ?? 0))
    );

    const totalByEmotion = emotions
        .map(emotion => ({
            emotion,
            total: hours.reduce((sum, hour) => sum + (data.hourly[hour][emotion] ?? 0), 0)
        }))
        .sort((a, b) => b.total - a.total);

    const grandTotal = totalByEmotion.reduce((sum, e) => sum + e.total, 0);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                    Emotion Timeline
                </h2>
                <p className="text-gray-400">
                    {data.day} • {grandTotal.toLocaleString()} total reports
                </p>
            </div>

            {/* Emotion Filter */}
            <div className="flex flex-wrap justify-center gap-2">
                <button
                    onClick={() => setSelectedEmotion(null)}
                    className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${selectedEmotion === null
                        ? 'bg-white text-slate-900 shadow-lg scale-105'
                        : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                        }`}
                >
                    All
                </button>
                {emotions.map(emotion => (
                    <button
                        key={emotion}
                        onClick={() => setSelectedEmotion(selectedEmotion === emotion ? null : emotion)}
                        className={`px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-1 ${selectedEmotion === emotion
                            ? 'shadow-lg scale-105'
                            : 'bg-slate-800 hover:bg-slate-700'
                            }`}
                        style={{
                            backgroundColor: selectedEmotion === emotion ? emotionConfig[emotion as keyof typeof emotionConfig].color : undefined,
                            color: selectedEmotion === emotion ? '#000' : undefined
                        }}
                    >
                        <span className="text-lg">{emotionConfig[emotion as keyof typeof emotionConfig].icon}</span>
                        <span className="capitalize">{emotion}</span>
                    </button>
                ))}
            </div>

            {/* Heatmap */}
            <div className="overflow-x-auto pb-4">
                <div className="flex gap-2 min-w-max px-4">
                    {hours.map(hour => {
                        const hourNum = Number(hour);
                        const displayEmotions = selectedEmotion ? [selectedEmotion] : emotions;
                        const isCurrentHour = hourNum === currentHour;


                        return (
                            <div key={hour} className="flex flex-col items-center gap-1">
                                <div className="text-xs font-medium text-gray-400">{hour.padStart(2, '0')}</div>

                                <div
                                    className={`w-10 h-48 rounded-lg overflow-hidden flex flex-col-reverse relative group transition-all duration-300
                                            ${isCurrentHour
                                            ? 'ring-2 ring-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)]'
                                            : 'hover:ring-2 hover:ring-blue-500/50'
                                        }
                                        `}
                                >
                                    {displayEmotions.map(emotion => {
                                        const value = data.hourly[hour][emotion] ?? 0;
                                        const intensity = getIntensity(value, maxValue);
                                        const config = emotionConfig[emotion as keyof typeof emotionConfig];

                                        return (
                                            <div
                                                key={`${hour}-${emotion}`}
                                                className="transition-all duration-500 cursor-pointer hover:brightness-110"
                                                style={{
                                                    height: `${(value / emotions.length / maxValue) * 100}%`,
                                                    backgroundColor: config.color,
                                                    opacity: 0.7 + intensity * 0.3,
                                                    boxShadow: `0 0 10px ${config.color}40`
                                                }}
                                                onClick={() => setActiveCell(activeCell?.hour === hour && activeCell?.emotion === emotion ? null : { hour, emotion })}
                                            />
                                        );
                                    })}

                                    {activeCell?.hour === hour && activeCell?.emotion && (
                                        <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                                            <span className="text-2xl">
                                                {emotionConfig[activeCell.emotion as keyof typeof emotionConfig].icon}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="text-[10px] text-gray-400 mt-1 text-center">
                                    {hourNum >= 5 && hourNum < 12 ? '🌅' :
                                        hourNum >= 12 && hourNum < 17 ? '☀️' :
                                            hourNum >= 17 && hourNum < 21 ? '🌆' : '🌙'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Emotion Rankings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {totalByEmotion.map((item, index) => {
                    const percentage = Math.round((item.total / grandTotal) * 100);
                    const config = emotionConfig[item.emotion as keyof typeof emotionConfig];

                    return (
                        <div
                            key={item.emotion}
                            className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-4 shadow-md border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:scale-105"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="text-2xl">{config.icon}</div>
                                    <div>
                                        <h3 className="text-lg font-bold capitalize">{item.emotion}</h3>
                                        <p className="text-gray-400 text-xs">Rank #{index + 1}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold" style={{ color: config.color }}>
                                        {item.total.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-400">{percentage}%</div>
                                </div>
                            </div>

                            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-gradient-to-r ${config.gradient} rounded-full transition-all duration-1000 ease-out`}
                                    style={{
                                        width: `${percentage}%`,
                                        boxShadow: `0 0 10px ${config.color}80`
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}