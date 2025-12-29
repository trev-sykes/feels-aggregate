import { NextResponse } from "next/server";
import { getTodayVote } from "@/app/actions/getTodaysVote";

export async function GET() {
    const result = await getTodayVote();
    return NextResponse.json(result);
}
