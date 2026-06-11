import type { inferAsyncReturnType } from "@trpc/server";
import { db } from "../db/client";

export async function createContext() {
  return { db, user: null };
}

export type Context = inferAsyncReturnType<typeof createContext>;
