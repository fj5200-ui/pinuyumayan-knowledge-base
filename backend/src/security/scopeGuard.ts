export type ApiScope =
  | "knowledge:read"
  | "vocabulary:read"
  | "content:read"
  | "export:read"
  | "export:write"
  | "sync:replay"
  | "jobs:write"
  | "quality:run"
  | "cache:invalidate"
  | "admin:security";

export function hasScope(granted: string[] | undefined, required: ApiScope): boolean {
  if (!granted) return false;
  return granted.includes("*") || granted.includes(required);
}

export function requireScope(granted: string[] | undefined, required: ApiScope): void {
  if (!hasScope(granted, required)) {
    const error = new Error(`Missing required scope: ${required}`);
    (error as Error & { statusCode?: number }).statusCode = 403;
    throw error;
  }
}
