import { defineConfig } from "drizzle-kit"
import { ENV } from "./src/env.ts"

const prefix = ENV.DEV ? "./" : "/"
const url = prefix + "data/database"

console.log('Drizzle syncing database schema in:', url)
export default defineConfig({
    dbCredentials: { url },
    dialect: "postgresql",
    driver: "pglite",
    schema: "./src/lib/server/db/*.table.ts",
    strict: true,
    verbose: true,
})
