import crypto from "crypto";

export function createIdentityHash(
    ip: string,
    userAgent: string,
    day: string
) {
    const secret = process.env.IDENTITY_SECRET || "dev_secret";
    return crypto
        .createHash("sha256")
        .update(ip + userAgent + day + secret)
        .digest("hex");
}
