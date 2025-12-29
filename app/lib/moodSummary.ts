import { prisma } from "../lib/db"; // Adjust if your path is different
import { Emotion } from "../generated/prisma";

export type MoodSummary = {
    emotion: Emotion;
    count: number;
};

export async function getMoodSummary(day?: string, hour?: number) {
    // Optional: default to today and current hour if not provided
    const now = new Date();
    const currentDay = day ?? now.toISOString().slice(0, 10); // YYYY-MM-DD
    const currentHour = hour ?? now.getUTCHours();

    // Aggregate counts from EmotionAggregate
    const aggregates = await prisma.emotionAggregate.findMany({
        where: {
            day: currentDay,
            hour: currentHour,
        },
        select: {
            emotion: true,
            count: true,
        },
    });

    // Fill in 0 for emotions that have no votes
    const summary: MoodSummary[] = Object.values(Emotion).map((emotion) => {
        const found = aggregates.find((a) => a.emotion === emotion);
        return {
            emotion,
            count: found ? found.count : 0,
        };
    });

    return summary;
}
