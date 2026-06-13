export function cacheHeaders(profile) {
    switch (profile) {
        case "publicShort":
            return { "Cache-Control": "public, max-age=300, stale-while-revalidate=86400" };
        case "publicLong":
            return { "Cache-Control": "public, max-age=900, stale-while-revalidate=86400" };
        case "privateInternal":
            return { "Cache-Control": "private, max-age=30" };
        case "noStore":
        default:
            return { "Cache-Control": "no-store" };
    }
}
export function makeWeakEtag(input) {
    const text = typeof input === "string" ? input : JSON.stringify(input);
    let hash = 0;
    for (let i = 0; i < text.length; i++)
        hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
    return `W/"${Math.abs(hash).toString(16)}"`;
}
