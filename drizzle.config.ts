import { defineConfig } from "drizzle-kit"
import { ENV } from "./src/env"
import { DATABASE_MIGRATIONS } from "./src/paths"

const prefix = ENV.DEV ? "./" : "/"
const url = `${prefix}data/database`

export const migrationsFolder =  "./db_migrations"

console.log("Drizzle syncing database schema in:", url)
export default defineConfig({
    dbCredentials: { url },
    dialect: "postgresql",
    driver: "pglite",
    out: migrationsFolder,
    schema: "./src/lib/server/db/*.table.ts",
    strict: true,
    verbose: true,
})
