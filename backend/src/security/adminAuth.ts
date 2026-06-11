import type { Request, Response, NextFunction } from "express";
import { fail } from "../lib/apiResponse";

export type AdminSession = { id: string; email: string; roles: string[] };

export function readAdminSession(req: Request): AdminSession | null {
  const email = req.header("x-admin-email");
  const roles = (req.header("x-admin-roles") ?? "").split(",").map((x) => x.trim()).filter(Boolean);
  if (!email) return null;
  return { id: req.header("x-admin-id") ?? email, email, roles };
}

export function requireAdminRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const session = readAdminSession(req);
    if (!session) return fail(res, 401, "ADMIN_UNAUTHORIZED", "Admin session is required");
    if (!session.roles.includes("super_admin") && !session.roles.includes(role)) {
      return fail(res, 403, "ADMIN_FORBIDDEN", `Missing admin role: ${role}`);
    }
    res.locals.adminSession = session;
    return next();
  };
}
