import { pool } from "../db/client";
export function requirePool() {
    if (!pool)
        throw new Error("DATABASE_URL is required for this v26 DB-backed route.");
    return pool;
}
export async function queryRows(sql, params = []) {
    const p = requirePool();
    const [rows] = await p.query(sql, params);
    return rows;
}
export async function execute(sql, params = []) {
    const p = requirePool();
    const [result] = await p.execute(sql, params);
    return result;
}
export function sha256(input) {
    return Buffer.from(input).toString("utf8");
}
