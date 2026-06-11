import crypto from "crypto";

export type SignedKbRequest = {
  headers: Record<string, string>;
  body: string;
};

function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function signKbRequestV25(params: {
  method: string;
  pathWithQuery: string;
  body?: unknown;
  clientId?: string;
  apiKey?: string;
  hmacSecret?: string;
}): SignedKbRequest {
  const body = params.body === undefined ? "" : JSON.stringify(params.body);
  const timestamp = String(Date.now());
  const nonce = crypto.randomBytes(16).toString("hex");
  const clientId = params.clientId ?? process.env.PINUYUMAYAN_MAIN_SITE_CLIENT_ID ?? "main-site-production";
  const apiKey = params.apiKey ?? process.env.PINUYUMAYAN_MAIN_SITE_API_KEY ?? "";
  const secret = params.hmacSecret ?? process.env.PINUYUMAYAN_HMAC_SECRET ?? "";
  const base = [params.method.toUpperCase(), params.pathWithQuery, timestamp, nonce, sha256Hex(body)].join("\n");
  const signature = crypto.createHmac("sha256", secret).update(base).digest("hex");
  return {
    body,
    headers: {
      "content-type": "application/json",
      "x-pinuyumayan-main-site-key": apiKey,
      "x-pinuyumayan-client-id": clientId,
      "x-pinuyumayan-timestamp": timestamp,
      "x-pinuyumayan-nonce": nonce,
      "x-pinuyumayan-signature": signature
    }
  };
}

export async function signedKbFetchV25(pathWithQuery: string, init: { method?: string; body?: unknown } = {}) {
  const baseUrl = process.env.PINUYUMAYAN_KB_API_URL ?? process.env.NEXT_PUBLIC_KB_API_URL;
  if (!baseUrl) throw new Error("Missing PINUYUMAYAN_KB_API_URL");
  const method = init.method ?? (init.body ? "POST" : "GET");
  const signed = signKbRequestV25({ method, pathWithQuery, body: init.body });
  return fetch(`${baseUrl}${pathWithQuery}`, { method, headers: signed.headers, body: method === "GET" ? undefined : signed.body });
}
