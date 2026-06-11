import type { Response } from "express";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "VALIDATION_ERROR"
  | "DB_UNAVAILABLE"
  | "JOB_LOCKED"
  | "INTERNAL_ERROR"
  | "ADMIN_UNAUTHORIZED"
  | "ADMIN_FORBIDDEN"
  | "WEAK_PASSWORD";

export function ok<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ ok: true, data });
}

export function fail(
  res: Response,
  status: number,
  code: ApiErrorCode,
  message: string,
  details: Record<string, unknown> = {}
) {
  const requestId = res.locals.requestId ?? undefined;
  return res.status(status).json({ ok: false, error: { code, message, details, requestId } });
}
