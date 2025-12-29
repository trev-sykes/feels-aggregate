import { NextResponse } from "next/server";
import { prisma } from "../../lib/db";
import { Emotion } from "../../generated/prisma";

export async function GET() {
    // Today in UTC
    const day = new Date().toISOString().slice(0, 10);

    // Fetch all aggregates for today
    const rows = await prisma.emotionAggregate.findMany({
        where: { day },
    });

    // Initialize empty 24h grid
    const hourly: Record<number, Record<Emotion, number>> = {};

    for (let hour = 0; hour < 24; hour++) {
        hourly[hour] = {
            happy: 0,
            content: 0,
            neutral: 0,
            stressed: 0,
            sad: 0,
            angry: 0,
        };
    }

    // Fill in actual counts
    for (const row of rows) {
        hourly[row.hour][row.emotion] = row.count;
    }

    return NextResponse.json({
        day,
        hourly,
    });
}
