export function ok(res, data, status = 200) {
    return res.status(status).json({ ok: true, data });
}
export function fail(res, status, code, message, details = {}) {
    const requestId = res.locals.requestId ?? undefined;
    return res.status(status).json({ ok: false, error: { code, message, details, requestId } });
}
