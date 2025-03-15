import type { z } from "@hono/zod-openapi"
import { pgTable } from "drizzle-orm/pg-core"
import { bool, date, drizZodInsertSchema, drizZodSelectSchema, drizZodUpdateSchema, int, text, textArray } from "./drizzleUtils"

export const PluginsTable = pgTable("plugins", {
    addedOn: date().defaultNow(),
    branch: text(),
    category: text(),
    cmd: textArray(),
    createdOn: date(),
    description: text(),
    etag: text(),
    event: textArray(),
    ft: textArray(),
    id: text().primaryKey(),
    isArchived: bool(),
    name: text().unique(),
    owner: text(),
    repo: text(),
    stars: int(),
    updatedOn: date(),
    writtenIn: text(),
})

export const pluginsTableInsert = drizZodInsertSchema(PluginsTable)
export type PluginsTableInsert = z.infer<typeof pluginsTableInsert>
export type PluginsTableInserts = Array<PluginsTableInsert>

export const pluginsTableSelect = drizZodSelectSchema(PluginsTable)
export type PluginsTableSelect = z.infer<typeof pluginsTableSelect>

export const pluginsTableUpdate = drizZodUpdateSchema(PluginsTable)
export type PluginsTableUpdate = z.infer<typeof pluginsTableUpdate>
