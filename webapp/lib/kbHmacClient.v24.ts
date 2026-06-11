import crypto from "crypto";

export function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function signKbRequestV24(input: { method: string; pathWithQuery: string; body?: unknown }) {
  const apiKey = process.env.PINUYUMAYAN_MAIN_SITE_API_KEY;
  const hmacSecret = process.env.PINUYUMAYAN_HMAC_SECRET;
  const clientId = process.env.PINUYUMAYAN_MAIN_SITE_CLIENT_ID ?? "main-site-production";
  if (!apiKey || !hmacSecret) throw new Error("Missing KB API key or HMAC secret");

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString("hex");
  const bodyText = input.body === undefined ? "" : JSON.stringify(input.body);
  const bodyHash = sha256Hex(bodyText);
  const base = [input.method.toUpperCase(), input.pathWithQuery, timestamp, nonce, bodyHash].join("\n");
  const signature = crypto.createHmac("sha256", hmacSecret).update(base).digest("hex");

  return {
    "content-type": "application/json",
    "x-pinuyumayan-main-site-key": apiKey,
    "x-pinuyumayan-client-id": clientId,
    "x-pinuyumayan-timestamp": timestamp,
    "x-pinuyumayan-nonce": nonce,
    "x-pinuyumayan-signature": signature
  };
}

export async function kbInternalFetchV24<T>(pathWithQuery: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const baseUrl = process.env.PINUYUMAYAN_KB_API_URL ?? process.env.NEXT_PUBLIC_KB_API_URL;
  if (!baseUrl) throw new Error("Missing PINUYUMAYAN_KB_API_URL");
  const method = init?.method ?? "GET";
  const headers = signKbRequestV24({ method, pathWithQuery, body: init?.body });
  const res = await fetch(`${baseUrl}${pathWithQuery}`, {
    method,
    headers,
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store"
  });
  if (!res.ok) throw new Error(`KB internal request failed ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export async function kbPublicFetchV24<T>(pathWithQuery: string): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_KB_API_URL;
  if (!baseUrl) throw new Error("Missing NEXT_PUBLIC_KB_API_URL");
  const res = await fetch(`${baseUrl}${pathWithQuery}`, { next: { revalidate: 600 } });
  if (!res.ok) throw new Error(`KB public request failed ${res.status}`);
  return res.json() as Promise<T>;
}
