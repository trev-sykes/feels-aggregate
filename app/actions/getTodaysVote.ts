"use server";
import { prisma } from "../lib/db";
import { createIdentityHash } from "../lib/identity";
import { getUtcDayAndHour } from "../lib/time";
import { headers } from "next/headers";
import { Emotion } from "../generated/prisma";

export type TodayVoteResult = { emotion: Emotion | null };

export async function getTodayVote(): Promise<TodayVoteResult> {
    const h = await headers();

    const ip = h.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1";
    const userAgent = h.get("user-agent") ?? "unknown";

    const { day } = getUtcDayAndHour();

    const identityHash = createIdentityHash(ip, userAgent, day);

    const vote = await prisma.emotionVote.findUnique({
        where: { identityHash_day: { identityHash, day } },
    });

    return { emotion: vote?.emotion ?? null };
}
