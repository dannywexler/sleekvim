import type { SQL } from "drizzle-orm"
import type { FindPlugins } from "../../db/plugins.sql"
import type { PluginSearchQuery } from "./plugins.schema"
import { logFn } from "$src/logging"
import { createRoute, OpenAPIHono } from "@hono/zod-openapi"
import { and, asc, desc, gt, sql } from "drizzle-orm"
import { PluginsSQL } from "../../db/plugins.sql"
import { PluginsTable, pluginsTableResults, pluginsTableTGRM } from "../../db/plugins.table"
import { pluginSearchQuery } from "./plugins.schema"

const search = logFn("API", "PLUGINS", "search", async ({ q, minStars }: PluginSearchQuery) => {
    const filters: Array<SQL> = []
    const orderBy: Array<SQL> = []
    const config: FindPlugins = { }

    if (q) {
        config.extras = { [pluginsTableTGRM.rankColumnName]: pluginsTableTGRM.rank(q) }
        orderBy.push(asc(sql.raw(pluginsTableTGRM.rankColumnName)))
    }
    if (minStars) {
        filters.push(gt(PluginsTable.stars, minStars))
    }

    if (filters) {
        config.where = and(...filters)
    }

    orderBy.push(desc(PluginsTable.stars))
    config.orderBy = orderBy
    const results = await PluginsSQL.find(config)
    const total = results.length
    console.log("Found", total, "results")
    return results.slice(0, 20).map(({ etag, ...rest }) => ({ ...rest }))
})

export const pluginsRoute = new OpenAPIHono().openapi(createRoute({
    method: "get",
    path: "/",
    description: "Search for Plugins",
    request: {
        query: pluginSearchQuery,
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: pluginsTableResults,
                },
            },
            description: "Plugins that match the search query",
        },
    },
}), async (c) => {
    const query = c.req.valid("query")
    const res = await search(query)
    return c.json(res)
})
