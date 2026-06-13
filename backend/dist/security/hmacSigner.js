import crypto from "crypto";
export function sha256Hex(input) {
    return crypto.createHash("sha256").update(input).digest("hex");
}
export function buildHmacSignatureBase(input) {
    return [
        input.method.toUpperCase(),
        input.pathWithQuery,
        input.timestamp,
        input.nonce,
        sha256Hex(input.body ?? "")
    ].join("\n");
}
export function signPinuyumayanRequest(input) {
    const base = buildHmacSignatureBase(input);
    return crypto.createHmac("sha256", input.secret).update(base).digest("hex");
}
export function timingSafeEqualHex(a, b) {
    const aa = Buffer.from(a, "hex");
    const bb = Buffer.from(b, "hex");
    if (aa.length !== bb.length)
        return false;
    return crypto.timingSafeEqual(aa, bb);
}
