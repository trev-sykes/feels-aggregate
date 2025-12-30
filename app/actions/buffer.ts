"use server";

import { prisma } from "../lib/db";
import { createIdentityHash } from "../lib/identity";
import { Emotion } from "../generated/prisma";

const EMOTIONS: Emotion[] = [
    "happy",
    "content",
    "neutral",
    "stressed",
    "sad",
    "angry",
];

// Uneven distribution (must sum to ~1)
const EMOTION_WEIGHTS: Record<Emotion, number> = {
    happy: 0.18,
    content: 0.32,
    neutral: 0.30,
    stressed: 0.10,
    sad: 0.07,
    angry: 0.03,
};

// Weighted random picker
function pickWeightedEmotion(): Emotion {
    const r = Math.random();
    let acc = 0;

    for (const emotion of EMOTIONS) {
        acc += EMOTION_WEIGHTS[emotion];
        if (r <= acc) return emotion;
    }

    return "neutral"; // fallback
}

// Smooth growth curve (slow morning → faster later)
function growthMultiplier(hour: number) {
    // sigmoid-ish curve in range ~0.2 → 1.2
    return 1 / (1 + Math.exp(-0.35 * (hour - 10)));
}

export async function simulateHourlyVotes(baseVotesPerHour = 1000) {
    const now = new Date();
    const day = now.toISOString().slice(0, 10);
    const currentUtcHour = now.getUTCHours();

    for (let hour = 0; hour < currentUtcHour; hour++) {
        const multiplier = growthMultiplier(hour);

        const votesThisHour = Math.max(
            1,
            Math.floor(baseVotesPerHour * multiplier)
        );

        const batch = [];

        for (let i = 0; i < votesThisHour; i++) {
            const emotion = pickWeightedEmotion();
            const fakeIp = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(
                Math.random() * 255
            )}`;
            const identityHash = createIdentityHash(fakeIp, "simulator", day);

            batch.push(
                prisma.emotionAggregate.upsert({
                    where: { day_hour_emotion: { day, hour, emotion } },
                    create: { day, hour, emotion, count: 1 },
                    update: { count: { increment: 1 } },
                })
            );
        }

        await Promise.all(batch);
    }

    return { ok: true };
}
