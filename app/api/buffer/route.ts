import { NextRequest, NextResponse } from "next/server";
import { simulateHourlyVotes } from "../../actions/buffer";

export async function POST(req: NextRequest) {
    const { votesPerHour } = await req.json(); // optional, default 1000
    await simulateHourlyVotes(votesPerHour ?? 30);

    return NextResponse.json({ ok: true, message: "Simulation complete" });
}
