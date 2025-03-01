import { DATABASE } from "$src/paths"
import { Database } from "bun:sqlite"
import { drizzle } from "drizzle-orm/bun-sqlite"
import * as PluginsSchema from "./plugins.table"

console.log("Creating database in:", DATABASE.path)
const client = new Database(DATABASE.path)
export const driz = drizzle({ client, schema: { ...PluginsSchema } })
