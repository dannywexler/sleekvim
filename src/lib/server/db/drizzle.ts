import { migrationsFolder } from "$src/../drizzle.config"
import { ENV } from "$src/env"
import { DATABASE } from "$src/paths"
import { PGlite } from "@electric-sql/pglite"
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import * as PluginsSchema from "./plugins.table"

const pgliteOptions = { extensions: { pg_trgm } } as const
const pgClient = new PGlite(DATABASE.path, pgliteOptions)

export const driz = drizzle({
    client: pgClient,
    schema: { ...PluginsSchema },
    logger: ENV.DEV,
})

async function runMigration() {
    console.log("starting migration")
    console.log("waiting for pglite client to be ready")
    await pgClient.waitReady
    console.log("pglite client is ready")
    console.log("creating pgtrgm extension")
    await pgClient.exec("CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA pg_catalog;")
    console.log("created pgtrgm extension")
    await migrate(driz, {
        migrationsFolder,
    })
    console.log("finished migration")
}

if (import.meta.main) {
    // eslint-disable-next-line antfu/no-top-level-await
    await runMigration()
}
