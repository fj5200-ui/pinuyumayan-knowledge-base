export function requireMainSiteApiKey(req, res, next) {
    const expected = process.env.PINUYUMAYAN_MAIN_SITE_API_KEY ?? process.env.MAIN_SITE_API_KEY;
    if (!expected && process.env.NODE_ENV !== "production") {
        return next();
    }
    const provided = req.header("x-pinuyumayan-main-site-key") ?? req.header("x-api-key");
    if (!expected || provided !== expected) {
        return res.status(401).json({ ok: false, error: "MAIN_SITE_API_KEY_REQUIRED" });
    }
    return next();
}
export function publicCache(seconds, staleSeconds = 86400) {
    return (_req, res, next) => {
        res.setHeader("Cache-Control", `public, s-maxage=${seconds}, stale-while-revalidate=${staleSeconds}`);
        next();
    };
}
export function privateNoStore(_req, res, next) {
    res.setHeader("Cache-Control", "private, no-store");
    next();
}
