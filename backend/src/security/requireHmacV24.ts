import crypto from "crypto";

export type HmacCheckResult = { ok: boolean; reason?: string };

function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function verifyPinuyumayanHmacV24(input: {
  method: string;
  pathWithQuery: string;
  bodyText?: string;
  headers: Record<string, string | string[] | undefined>;
  secret: string;
  nowSeconds?: number;
  maxSkewSeconds?: number;
}): HmacCheckResult {
  const h = (name: string) => {
    const value = input.headers[name] ?? input.headers[name.toLowerCase()];
    return Array.isArray(value) ? value[0] : value;
  };
  const timestamp = h("x-pinuyumayan-timestamp");
  const nonce = h("x-pinuyumayan-nonce");
  const signature = h("x-pinuyumayan-signature");
  if (!timestamp || !nonce || !signature) return { ok: false, reason: "missing_hmac_headers" };

  const now = input.nowSeconds ?? Math.floor(Date.now() / 1000);
  const skew = input.maxSkewSeconds ?? 300;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(now - ts) > skew) return { ok: false, reason: "timestamp_out_of_range" };

  const bodyHash = sha256Hex(input.bodyText ?? "");
  const base = [input.method.toUpperCase(), input.pathWithQuery, timestamp, nonce, bodyHash].join("\n");
  const expected = crypto.createHmac("sha256", input.secret).update(base).digest("hex");
  const ok = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  return ok ? { ok: true } : { ok: false, reason: "bad_signature" };
}
