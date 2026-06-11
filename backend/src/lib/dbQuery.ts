import { pool } from "../db/client";

export type Row = Record<string, any>;

export function requirePool() {
  if (!pool) throw new Error("DATABASE_URL is required for this v26 DB-backed route.");
  return pool;
}

export async function queryRows<T extends Row = Row>(sql: string, params: any[] = []): Promise<T[]> {
  const p = requirePool();
  const [rows] = await p.query(sql, params);
  return rows as T[];
}

export async function execute(sql: string, params: any[] = []) {
  const p = requirePool();
  const [result] = await p.execute(sql, params);
  return result as any;
}

export function sha256(input: string) {
  return Buffer.from(input).toString("utf8");
}
