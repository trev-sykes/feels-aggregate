import { Emotion } from "../generated/prisma"

const EMOTION_WEIGHTS: Record<Emotion, number> = {
    happy: 30,
    content: 25,
    neutral: 20,
    stressed: 12,
    sad: 8,
    angry: 5,
}

export function pickWeightedEmotion(): Emotion {
    const entries = Object.entries(EMOTION_WEIGHTS)
    const total = entries.reduce((sum, [, w]) => sum + w, 0)

    let roll = Math.random() * total

    for (const [emotion, weight] of entries) {
        if (roll < weight) return emotion as Emotion
        roll -= weight
    }

    return "neutral"
}
