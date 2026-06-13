import crypto from "crypto";
function sha256Hex(input) {
    return crypto.createHash("sha256").update(input).digest("hex");
}
export function verifyPinuyumayanHmacV24(input) {
    const h = (name) => {
        const value = input.headers[name] ?? input.headers[name.toLowerCase()];
        return Array.isArray(value) ? value[0] : value;
    };
    const timestamp = h("x-pinuyumayan-timestamp");
    const nonce = h("x-pinuyumayan-nonce");
    const signature = h("x-pinuyumayan-signature");
    if (!timestamp || !nonce || !signature)
        return { ok: false, reason: "missing_hmac_headers" };
    const now = input.nowSeconds ?? Math.floor(Date.now() / 1000);
    const skew = input.maxSkewSeconds ?? 300;
    const ts = Number(timestamp);
    if (!Number.isFinite(ts) || Math.abs(now - ts) > skew)
        return { ok: false, reason: "timestamp_out_of_range" };
    const bodyHash = sha256Hex(input.bodyText ?? "");
    const base = [input.method.toUpperCase(), input.pathWithQuery, timestamp, nonce, bodyHash].join("\n");
    const expected = crypto.createHmac("sha256", input.secret).update(base).digest("hex");
    const ok = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    return ok ? { ok: true } : { ok: false, reason: "bad_signature" };
}
