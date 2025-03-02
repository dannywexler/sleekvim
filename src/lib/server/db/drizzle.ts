import { DATABASE } from "$src/paths"
import { PGlite } from "@electric-sql/pglite"
import { drizzle } from "drizzle-orm/pglite"
import * as PluginsSchema from "./plugins.table"

const client = new PGlite(DATABASE.path)
export const driz = drizzle({ client, schema: { ...PluginsSchema } })
