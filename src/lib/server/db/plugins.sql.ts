import type { PluginsTableInsert } from "./plugins.table"
import { logFn } from "$src/logging"
import { driz } from "./drizzle"
import { PluginsTable } from "./plugins.table"

export const PluginsSQL = {
    find: (findPlugins?: FindPlugins) => driz.query.PluginsTable.findMany(findPlugins),
    add: logFn("DB", "PLUGINS", "add", async (newPlugin: PluginsTableInsert) => {
        const { id, ...rest } = newPlugin
        return driz
            .insert(PluginsTable)
            .values(newPlugin)
            .onConflictDoUpdate({
                target: PluginsTable.id,
                set: { ...rest },
            })
    }),
}

export type FindPlugins = Parameters<typeof driz.query.PluginsTable.findMany>[0]
