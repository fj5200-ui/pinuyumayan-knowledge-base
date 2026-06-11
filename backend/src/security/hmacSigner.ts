import crypto from "crypto";

export function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function buildHmacSignatureBase(input: {
  method: string;
  pathWithQuery: string;
  timestamp: string;
  nonce: string;
  body?: string;
}) {
  return [
    input.method.toUpperCase(),
    input.pathWithQuery,
    input.timestamp,
    input.nonce,
    sha256Hex(input.body ?? "")
  ].join("\n");
}

export function signPinuyumayanRequest(input: {
  method: string;
  pathWithQuery: string;
  timestamp: string;
  nonce: string;
  body?: string;
  secret: string;
}) {
  const base = buildHmacSignatureBase(input);
  return crypto.createHmac("sha256", input.secret).update(base).digest("hex");
}

export function timingSafeEqualHex(a: string, b: string) {
  const aa = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}
