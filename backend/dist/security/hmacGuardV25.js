import crypto from "crypto";
const REQUIRED_HEADERS = [
    "x-pinuyumayan-main-site-key",
    "x-pinuyumayan-client-id",
    "x-pinuyumayan-timestamp",
    "x-pinuyumayan-nonce",
    "x-pinuyumayan-signature"
];
export function sha256Hex(input) {
    return crypto.createHash("sha256").update(input).digest("hex");
}
export function buildSignatureBase(req, bodyString = "") {
    const timestamp = String(req.header("x-pinuyumayan-timestamp") ?? "");
    const nonce = String(req.header("x-pinuyumayan-nonce") ?? "");
    const pathWithQuery = req.originalUrl;
    const bodyHash = sha256Hex(bodyString || JSON.stringify(req.body ?? {}));
    return [req.method.toUpperCase(), pathWithQuery, timestamp, nonce, bodyHash].join("\n");
}
export function verifyPinuyumayanHmacV25(req, secret = process.env.PINUYUMAYAN_HMAC_SECRET ?? "") {
    if (process.env.PINUYUMAYAN_HMAC_ENABLED === "false")
        return { ok: true, failureCode: "hmac_disabled" };
    for (const header of REQUIRED_HEADERS) {
        if (!req.header(header))
            return { ok: false, failureCode: "missing_header" };
    }
    const timestamp = Number(req.header("x-pinuyumayan-timestamp"));
    if (!Number.isFinite(timestamp))
        return { ok: false, failureCode: "timestamp_skew" };
    const now = Date.now();
    if (Math.abs(now - timestamp) > 5 * 60 * 1000)
        return { ok: false, failureCode: "timestamp_skew" };
    if (!secret)
        return { ok: false, failureCode: "invalid_signature" };
    const base = buildSignatureBase(req);
    const expected = crypto.createHmac("sha256", secret).update(base).digest("hex");
    const provided = String(req.header("x-pinuyumayan-signature") ?? "");
    const ok = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided.padEnd(expected.length, "0").slice(0, expected.length)));
    return ok ? { ok: true, signatureBase: base } : { ok: false, failureCode: "invalid_signature", signatureBase: base };
}
