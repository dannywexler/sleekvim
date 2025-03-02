import type { z } from "@hono/zod-openapi"
import { pgTable } from "drizzle-orm/pg-core"
import { bool, date, drizZodInsertSchema, drizZodSelectSchema, drizZodUpdateSchema, int, txt, txtArray } from "./drizzleUtils"

export const PluginsTable = pgTable("plugins", {
    addedOn: date().defaultNow(),
    branch: txt(),
    category: txt(),
    cmd: txtArray(),
    createdOn: date(),
    description: txt(),
    event: txtArray(),
    ft: txtArray(),
    id: txt().primaryKey(),
    isArchived: bool(),
    name: txt().unique(),
    owner: txt(),
    repo: txt(),
    stars: int(),
    updatedOn: date(),
    writtenIn: txt(),
})

export const pluginsTableInsert = drizZodInsertSchema(PluginsTable)
export type PluginsTableInsert = z.infer<typeof pluginsTableInsert>

export const pluginsTableSelect = drizZodSelectSchema(PluginsTable)
export type PluginsTableSelect = z.infer<typeof pluginsTableSelect>

export const pluginsTableUpdate = drizZodUpdateSchema(PluginsTable)
export type PluginsTableUpdate = z.infer<typeof pluginsTableUpdate>
