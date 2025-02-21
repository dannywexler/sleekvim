import { env } from "$env/dynamic/private"
import { Database } from "bun:sqlite"
import { drizzle } from "drizzle-orm/bun-sqlite"

if (!env.DATABASE_URL)
    throw new Error("DATABASE_URL is not set")
const client = new Database(env.DATABASE_URL)
export const db = drizzle(client)
