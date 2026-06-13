export function setPublicCache(res, maxAgeSeconds, staleWhileRevalidateSeconds = 0) {
    const parts = [`public`, `max-age=${maxAgeSeconds}`];
    if (staleWhileRevalidateSeconds > 0)
        parts.push(`stale-while-revalidate=${staleWhileRevalidateSeconds}`);
    res.setHeader("Cache-Control", parts.join(", "));
}
export function setNoStore(res) {
    res.setHeader("Cache-Control", "no-store");
}
export function makeEtag(payload) {
    const raw = JSON.stringify(payload);
    let hash = 0;
    for (let i = 0; i < raw.length; i += 1)
        hash = (Math.imul(31, hash) + raw.charCodeAt(i)) | 0;
    return `W/\"${Math.abs(hash).toString(36)}-${raw.length.toString(36)}\"`;
}
