import { NextRequest, NextResponse } from "next/server";
import { submitEmotion } from "../../actions/submitEmotion";
import { Emotion } from "../../generated/prisma";

export async function POST(req: NextRequest) {
    const { emotion } = await req.json();

    if (!emotion) {
        return NextResponse.json({ ok: false, error: "MISSING_EMOTION" }, { status: 400 });
    }

    const result = await submitEmotion(emotion as Emotion);
    return NextResponse.json(result);
}
