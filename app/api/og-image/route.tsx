import { ImageResponse } from "next/og";
import { getMoodSummary } from "@/app/lib/moodSummary";
import { readFile } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET(req: Request) {
    const url = new URL(req.url);
    const ts = url.searchParams.get("ts") || Date.now().toString();
    console.log("Generating OG image with timestamp:", ts);
    try {
        const moodSummary = await getMoodSummary();

        // Load logo from public folder
        let logoBase64 = '';
        try {
            const logoPath = join(process.cwd(), 'public', 'logo.png');
            const logoBuffer = await readFile(logoPath);
            logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
        } catch (err) {
            console.error('Failed to load logo:', err);
        }

        if (!moodSummary || moodSummary.length === 0) {
            return new ImageResponse(
                (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%",
                            height: "100%",
                            backgroundColor: "#000000",
                            color: "white",
                        }}
                    >
                        <div style={{ display: "flex", fontSize: 72, fontWeight: "bold" }}>
                            Feels Aggregate
                        </div>
                        <div style={{ display: "flex", fontSize: 36, marginTop: 30, color: "#888" }}>
                            No votes yet
                        </div>
                    </div>
                ),
                {
                    width: 1200,
                    height: 630,
                }
            );
        }

        const dominant = moodSummary.reduce((prev, curr) =>
            curr.count > prev.count ? curr : prev
        );

        const emojiMap: Record<string, string> = {
            happy: "😊",
            content: "😌",
            neutral: "😐",
            stressed: "😰",
            sad: "😢",
            angry: "😠",
        };

        const totalVotes = moodSummary.reduce((sum, e) => sum + e.count, 0);
        const maxCount = Math.max(...moodSummary.map(m => m.count));

        return new ImageResponse(
            (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        height: "100%",
                        backgroundColor: "#000000",
                        color: "white",
                        position: "relative",
                    }}
                >
                    {/* Logo in top corner */}
                    {logoBase64 && (
                        <img
                            src={logoBase64}
                            alt="Feels Aggregate"
                            width={180}
                            height={60}
                            style={{
                                position: "absolute",
                                top: 40,
                                left: 40,
                                objectFit: "contain"
                            }}
                        />
                    )}

                    <div style={{ display: "flex", fontSize: 220 }}>
                        {emojiMap[dominant.emotion] || "🤔"}
                    </div>
                    <div style={{
                        display: "flex",
                        fontSize: 64,
                        marginTop: 30,
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                    }}>
                        {dominant.emotion}
                    </div>
                    <div style={{ display: "flex", fontSize: 28, marginTop: 15, color: "#888" }}>
                        {totalVotes.toLocaleString()} {totalVotes === 1 ? "vote" : "votes"} right now
                    </div>

                    {/* Mini emotion bars */}
                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 12,
                        marginTop: 40,
                        alignItems: "flex-end"
                    }}>
                        {moodSummary.map((mood) => {
                            const height = maxCount > 0 ? (mood.count / maxCount) * 60 : 10;
                            const percentage = totalVotes > 0 ? Math.round((mood.count / totalVotes) * 100) : 0;
                            return (
                                <div key={mood.emotion} style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 8
                                }}>
                                    <div style={{ display: "flex", fontSize: 18, color: "#666", marginBottom: 4 }}>
                                        {percentage}%
                                    </div>
                                    <div style={{
                                        display: "flex",
                                        width: 50,
                                        height: height,
                                        backgroundColor: mood.emotion === dominant.emotion ? "#fff" : "#1a1a1a",
                                        borderRadius: 4
                                    }} />
                                    <div style={{ display: "flex", fontSize: 32 }}>
                                        {emojiMap[mood.emotion]}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (error) {
        console.error("Error generating OG image:", error);

        return new ImageResponse(
            (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        height: "100%",
                        backgroundColor: "#000000",
                        color: "white",
                    }}
                >
                    <div style={{ display: "flex", fontSize: 72, fontWeight: "bold" }}>
                        Feels Aggregate
                    </div>
                    <div style={{ display: "flex", fontSize: 36, marginTop: 30, color: "#888" }}>
                        Loading...
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    }
}