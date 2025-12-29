"use server";
import { prisma } from "../lib/db";
import { createIdentityHash } from "../lib/identity";
import { getUtcDayAndHour } from "../lib/time";
import { headers } from "next/headers";
import { Emotion } from "../generated/prisma";

type SubmitEmotionResult =
    | { ok: true; hour: number }
    | { ok: false; error: "ALREADY_VOTED" };

export async function submitEmotion(
    emotion: Emotion
): Promise<SubmitEmotionResult> {
    const h = await headers();

    const ip =
        h.get("x-forwarded-for")?.split(",")[0] ??
        "127.0.0.1";

    const userAgent = h.get("user-agent") ?? "unknown";

    const { day, hour } = getUtcDayAndHour();
    const fakeIp = "192.168.0." + Math.floor(Math.random() * 255);
    const identityHash = createIdentityHash(fakeIp, userAgent, day);

    try {
        await prisma.$transaction(async (tx) => {
            await tx.emotionVote.create({
                data: {
                    emotion,
                    day,
                    hour,
                    identityHash,
                },
            });

            await tx.emotionAggregate.upsert({
                where: {
                    day_hour_emotion: { day, hour, emotion },
                },
                create: {
                    day,
                    hour,
                    emotion,
                    count: 1,
                },
                update: {
                    count: { increment: 1 },
                },
            });
        });

        return { ok: true, hour };
    } catch (err) {
        // Unique constraint violation → already voted today
        return { ok: false, error: "ALREADY_VOTED" };
    }
}
