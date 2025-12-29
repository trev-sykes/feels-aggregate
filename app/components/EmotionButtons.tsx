"use client";

import { useState } from "react";
import { Emotion } from "../generated/prisma";

type Props = {
    onSubmit: (emotion: Emotion) => Promise<void>;
};

const EMOTIONS: Emotion[] = ["happy", "content", "neutral", "stressed", "sad", "angry"];

export default function EmotionButtons({ onSubmit }: Props) {
    const [submitting, setSubmitting] = useState(false);
    const [voted, setVoted] = useState(false);

    const handleClick = async (emotion: Emotion) => {
        if (voted) return;
        setSubmitting(true);
        try {
            await onSubmit(emotion);
            setVoted(true);
        } finally {
            setSubmitting(false);
        }
    };

    // EmotionButtons.tsx
    return (
        <div className="flex gap-2 flex-wrap justify-center">
            {EMOTIONS.map((emotion) => (
                <button
                    key={emotion}
                    onClick={() => handleClick(emotion)}
                    disabled={submitting || voted}
                    className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 flex-1 sm:flex-none text-center"
                >
                    {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                </button>
            ))}
        </div>
    );

}
