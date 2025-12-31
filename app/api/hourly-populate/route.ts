import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/db"
import { pickWeightedEmotion } from "@/app/lib/emotions"
import { pickHourlyVoteCount } from "@/app/lib/voteVolume"


const LOCK_ID = 424242

export async function GET() {
    const voteCount = pickHourlyVoteCount()

    const now = new Date()
    const day = now.toISOString().slice(0, 10)
    const hour = now.getHours()

    try {
        await prisma.$executeRawUnsafe(
            `SELECT pg_advisory_lock(${LOCK_ID});`
        )

        const alreadyPopulated = await prisma.emotionAggregate.findFirst({
            where: { day, hour },
        })

        if (alreadyPopulated) {
            return NextResponse.json({ skipped: true })
        }

        if (voteCount === 0) {
            return NextResponse.json({
                skipped: "no activity",
                day,
                hour,
            })
        }

        const counts: Record<string, number> = {}

        for (let i = 0; i < voteCount; i++) {
            const emotion = pickWeightedEmotion()
            counts[emotion] = (counts[emotion] ?? 0) + 1
        }

        await prisma.$transaction(
            Object.entries(counts).map(([emotion, count]) =>
                prisma.emotionAggregate.upsert({
                    where: {
                        day_hour_emotion: {
                            day,
                            hour,
                            emotion: emotion as any,
                        },
                    },
                    update: {
                        count: { increment: count },
                    },
                    create: {
                        day,
                        hour,
                        emotion: emotion as any,
                        count,
                    },
                })
            )
        )

        return NextResponse.json({
            success: true,
            day,
            hour,
            voteCount,
            counts,
        })
    } finally {
        await prisma.$executeRawUnsafe(
            `SELECT pg_advisory_unlock(${LOCK_ID});`
        )
    }
}
