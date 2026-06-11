import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

const staticDb = {
  async execute(_query: unknown): Promise<unknown> {
    throw new Error("DATABASE_URL is not configured; static JSON fallback should handle read routes when KNOWLEDGE_DATA_MODE=static or DB queries fail.");
  }
};

export const pool = databaseUrl ? mysql.createPool(databaseUrl) : null;
export const db = databaseUrl ? drizzle(pool!, { schema, mode: "default" }) : staticDb;
