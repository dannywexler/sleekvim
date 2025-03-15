import { z } from "@hono/zod-openapi"
import { boolean, text as drizText, integer, timestamp } from "drizzle-orm/pg-core"
import { createSchemaFactory } from "drizzle-zod"

export const bool = () => boolean().notNull()
export const date = () => timestamp({ mode: "date", withTimezone: true }).notNull()
export const int = () => integer().notNull()
export const text = () => drizText().notNull()
export const maybeNullText = drizText
export const textArray = () => text().array()

const {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} = createSchemaFactory({ coerce: true, zodInstance: z })

export const drizZodInsertSchema = createInsertSchema
export const drizZodSelectSchema = createSelectSchema
export const drizZodUpdateSchema = createUpdateSchema
