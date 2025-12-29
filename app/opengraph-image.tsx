// app/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

// Optional but recommended
export const size = {
    width: 1200,
    height: 630,
};

// Cache for 5 minutes (OG crawlers are aggressive anyway)
export const revalidate = 300;

export default async function OpenGraphImage() {
    // 1️⃣ Fetch current app state
    const res = await fetch(
        "https://feelsaggregate.com/api/summary",
        { next: { revalidate: 300 } }
    );

    const data = await res.json();

    const {
        dominantEmotion, // "happy"
        emoji,           // "😊"
        percentage,      // 42
    } = data;

    // 2️⃣ Render image
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "linear-gradient(135deg, #020617, #0f172a)",
                    color: "white",
                    fontFamily: "Inter, system-ui",
                }}
            >
                <div style={{ fontSize: 32, opacity: 0.8 }}>
                    Feels Aggregate
                </div>

                <div style={{ fontSize: 120, marginTop: 20 }}>
                    {emoji}
                </div>

                <div style={{ fontSize: 64, fontWeight: 700 }}>
                    {percentage}% {dominantEmotion}
                </div>

                <div style={{ fontSize: 28, marginTop: 12, opacity: 0.7 }}>
                    The world right now
                </div>
            </div>
        ),
        size
    );
}
