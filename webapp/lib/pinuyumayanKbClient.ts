import { signKnowledgeRequest } from "./signKnowledgeRequest";

const publicBaseUrl = process.env.NEXT_PUBLIC_KB_API_URL ?? "http://localhost:8787";
const serverBaseUrl = process.env.PINUYUMAYAN_KB_API_URL ?? publicBaseUrl;

export async function fetchPublicKnowledge<T>(pathWithQuery: string): Promise<T> {
  const res = await fetch(`${publicBaseUrl}${pathWithQuery}`, {
    next: { revalidate: 600 }
  });
  if (!res.ok) throw new Error(`Knowledge public API failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchInternalKnowledge<T>(pathWithQuery: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const method = init?.method ?? "GET";
  const signed = signKnowledgeRequest({ method, pathWithQuery, body: init?.body });
  const res = await fetch(`${serverBaseUrl}${pathWithQuery}`, {
    method,
    headers: signed.headers,
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store"
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Knowledge internal API failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}
