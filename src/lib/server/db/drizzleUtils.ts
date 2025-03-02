import { z } from "@hono/zod-openapi"
import { boolean, integer, text, timestamp } from "drizzle-orm/pg-core"
import { createSchemaFactory } from "drizzle-zod"

export const bool = () => boolean().notNull()
export const date = () => timestamp({ mode: "date", withTimezone: true }).notNull()
export const int = () => integer().notNull()
export const txt = () => text().notNull()
export const txtArray = () => text().notNull().array()

const {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} = createSchemaFactory({ coerce: true, zodInstance: z })

export const drizZodInsertSchema = createInsertSchema
export const drizZodSelectSchema = createSelectSchema
export const drizZodUpdateSchema = createUpdateSchema
