export function unwrapRows(result: unknown): any[] {
  if (Array.isArray(result)) {
    const first = result[0] as unknown;
    if (Array.isArray(first)) return first as any[];
    return result as any[];
  }
  if (result && typeof result === "object" && "rows" in result) {
    return (result as { rows?: any[] }).rows ?? [];
  }
  return [];
}

export function toLimit(value: number | undefined, fallback = 20, max = 100): number {
  const n = Number(value ?? fallback);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.min(max, Math.floor(n)));
}

export function likeQuery(q: string | undefined): string {
  return `%${(q ?? "").trim()}%`;
}
