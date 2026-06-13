import crypto from "node:crypto";
export function requestIdMiddleware(req, res, next) {
    const incoming = req.header("x-request-id");
    const requestId = incoming && incoming.length <= 120 ? incoming : `req_${crypto.randomUUID()}`;
    res.locals.requestId = requestId;
    res.setHeader("x-request-id", requestId);
    next();
}
