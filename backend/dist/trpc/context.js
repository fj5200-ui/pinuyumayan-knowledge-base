import { db } from "../db/client";
export async function createContext() {
    return { db, user: null };
}
