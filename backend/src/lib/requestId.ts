import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const incoming = req.header("x-request-id");
  const requestId = incoming && incoming.length <= 120 ? incoming : `req_${crypto.randomUUID()}`;
  res.locals.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  next();
}
