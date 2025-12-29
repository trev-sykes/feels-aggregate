import { useState } from "react";

type Emotion = "happy" | "content" | "neutral" | "stressed" | "sad" | "angry";

type Props = {
    onSubmit: (emotion: Emotion) => Promise<void>;
};

const EMOTIONS: { emotion: Emotion; emoji: string }[] = [
    { emotion: "happy", emoji: "😊" },
    { emotion: "content", emoji: "😌" },
    { emotion: "neutral", emoji: "😐" },
    { emotion: "stressed", emoji: "😰" },
    { emotion: "sad", emoji: "😢" },
    { emotion: "angry", emoji: "😠" },
];

export default function EmotionButtons({ onSubmit }: Props) {
    const [submitting, setSubmitting] = useState(false);
    const [voted, setVoted] = useState(false);
    const [selected, setSelected] = useState<Emotion | null>(null);

    const handleClick = async (emotion: Emotion) => {
        if (voted || submitting) return;

        setSelected(emotion);
        setSubmitting(true);

        try {
            await onSubmit(emotion);
            setVoted(true);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 max-w-3xl mx-auto">
            {EMOTIONS.map(({ emotion, emoji }) => (
                <button
                    key={emotion}
                    onClick={() => handleClick(emotion)}
                    disabled={submitting || voted}
                    className={`
                        group relative overflow-hidden
                        px-2 py-2 sm:px-3 sm:py-4 rounded-lg
                        border transition-all duration-200
                        ${voted && selected === emotion
                            ? "border-white bg-white/10"
                            : voted
                                ? "border-white/10 bg-transparent opacity-30"
                                : "border-white/20 bg-transparent hover:border-white hover:bg-white/5"
                        }
                        disabled:cursor-not-allowed
                        active:scale-95
                    `}
                >
                    <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                        <span className="text-2xl sm:text-3xl">{emoji}</span>
                        <span className="text-[10px] sm:text-xs font-medium capitalize">
                            {emotion}
                        </span>
                    </div>
                </button>
            ))}
        </div>
    );

}