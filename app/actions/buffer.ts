"use server";

import { prisma } from "../lib/db";
import { createIdentityHash } from "../lib/identity";
import { Emotion } from "../generated/prisma";

const EMOTIONS: Emotion[] = ["happy", "content", "neutral", "stressed", "sad", "angry"];

export async function simulateHourlyVotes(votesPerHour = 1000) {
    const day = new Date().toISOString().slice(0, 10);

    for (let hour = 0; hour < 24; hour++) {
        const batch = [];
        for (let i = 0; i < votesPerHour; i++) {
            const emotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
            const fakeIp = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
            const identityHash = createIdentityHash(fakeIp, "simulator", day);

            batch.push(
                prisma.emotionAggregate.upsert({
                    where: { day_hour_emotion: { day, hour, emotion } },
                    create: { day, hour, emotion, count: 1 },
                    update: { count: { increment: 1 } },
                })
            );
        }

        // Run batch in parallel per hour
        await Promise.all(batch);
    }

    return { ok: true };
}
