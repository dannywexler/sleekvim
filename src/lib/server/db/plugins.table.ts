import type { z } from "@hono/zod-openapi"
import { pgTable } from "drizzle-orm/pg-core"
import { bool, createTGRM, date, drizZodInsertSchema, drizZodSelectSchema, drizZodUpdateSchema, int, text } from "./drizzleUtils"

const tgrmColumns = [
    "name",
    "description",
    "category",
    "owner",
] as const

export const pluginsTableTGRM = createTGRM(tgrmColumns)

export const PluginsTable = pgTable("plugins", {
    addedOn: date().defaultNow(),
    branch: text(),
    category: text(),
    createdOn: date(),
    description: text(),
    etag: text(),
    id: text().primaryKey(),
    isArchived: bool(),
    name: text().unique(),
    owner: text(),
    repo: text(),
    stars: int(),
    updatedOn: date(),
    writtenIn: text(),
}, () => [
    pluginsTableTGRM.index(),
])

export const pluginsTableInsert = drizZodInsertSchema(PluginsTable)
export type PluginsTableInsert = z.infer<typeof pluginsTableInsert>
export type PluginsTableInserts = Array<PluginsTableInsert>

export const pluginsTableSelect = drizZodSelectSchema(PluginsTable)
export type PluginsTableSelect = z.infer<typeof pluginsTableSelect>

export const pluginsTableUpdate = drizZodUpdateSchema(PluginsTable)
export type PluginsTableUpdate = z.infer<typeof pluginsTableUpdate>

export const pluginsTableResult = pluginsTableInsert.omit({ etag: true })
export type PluginsTableResult = z.infer<typeof pluginsTableResult>
export const pluginsTableResults = pluginsTableResult.array()
export type PluginsTableResults = z.infer<typeof pluginsTableResults>

export type PluginsTableFields = keyof PluginsTableSelect
