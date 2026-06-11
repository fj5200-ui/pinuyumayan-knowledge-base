import crypto from "crypto";

export function buildPayloadSnapshot(payload: unknown) {
  const body = JSON.stringify(payload);
  const sha256 = crypto.createHash("sha256").update(body).digest("hex");
  return {
    sha256,
    etag: `W/\"${sha256.slice(0, 24)}\"`,
    byteSize: Buffer.byteLength(body),
    generatedAt: new Date().toISOString()
  };
}
