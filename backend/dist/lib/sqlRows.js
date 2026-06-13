export function unwrapRows(result) {
    if (Array.isArray(result)) {
        const first = result[0];
        if (Array.isArray(first))
            return first;
        return result;
    }
    if (result && typeof result === "object" && "rows" in result) {
        return result.rows ?? [];
    }
    return [];
}
export function toLimit(value, fallback = 20, max = 100) {
    const n = Number(value ?? fallback);
    if (!Number.isFinite(n))
        return fallback;
    return Math.max(1, Math.min(max, Math.floor(n)));
}
export function likeQuery(q) {
    return `%${(q ?? "").trim()}%`;
}
