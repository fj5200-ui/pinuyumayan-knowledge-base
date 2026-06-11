import crypto from "crypto";

export type SignedKnowledgeRequest = {
  headers: Record<string, string>;
};

export function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function signKnowledgeRequest(input: {
  method: string;
  pathWithQuery: string;
  body?: unknown;
  apiKey?: string;
  clientId?: string;
  hmacSecret?: string;
}): SignedKnowledgeRequest {
  const apiKey = input.apiKey ?? process.env.PINUYUMAYAN_MAIN_SITE_API_KEY;
  const clientId = input.clientId ?? process.env.PINUYUMAYAN_MAIN_SITE_CLIENT_ID ?? "main-site";
  const hmacSecret = input.hmacSecret ?? process.env.PINUYUMAYAN_HMAC_SECRET;

  if (!apiKey) throw new Error("Missing PINUYUMAYAN_MAIN_SITE_API_KEY");
  if (!hmacSecret) throw new Error("Missing PINUYUMAYAN_HMAC_SECRET");

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString("hex");
  const bodyString = input.body === undefined ? "" : JSON.stringify(input.body);
  const bodyHash = sha256Hex(bodyString);
  const base = [input.method.toUpperCase(), input.pathWithQuery, timestamp, nonce, bodyHash].join("\n");
  const signature = crypto.createHmac("sha256", hmacSecret).update(base).digest("hex");

  return {
    headers: {
      "x-pinuyumayan-main-site-key": apiKey,
      "x-pinuyumayan-client-id": clientId,
      "x-pinuyumayan-timestamp": timestamp,
      "x-pinuyumayan-nonce": nonce,
      "x-pinuyumayan-signature": signature,
      "content-type": "application/json"
    }
  };
}
