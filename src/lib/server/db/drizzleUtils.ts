import { z } from "@hono/zod-openapi"
import { sql } from "drizzle-orm"
import { boolean, text as drizText, index, integer, timestamp } from "drizzle-orm/pg-core"
import { createSchemaFactory } from "drizzle-zod"

export const bool = () => boolean().notNull()
export const date = () => timestamp({ mode: "date", withTimezone: true }).notNull()
export const int = () => integer().notNull()
export const text = () => drizText().notNull()
export const maybeNullText = drizText

export type CreateTGRMOptions = Partial<{
    indexName: string
    rankColumnName: string
    siglen: number
    roundingPlaces: number
}>
export function createTGRM<Columns extends string>(
    columns: ReadonlyArray<Columns>,
    options: CreateTGRMOptions = {},
) {
    const {
        indexName = "pg_tgrm_index",
        rankColumnName = "rank",
        siglen = 256,
        roundingPlaces = 4,
    } = options

    const coreQuery = columns
        .map(column => `coalesce(${column}, '')`)
        .join(" || ' ' || ")

    return {
        rankColumnName,
        index: () => index(indexName).using(
            "gin",
            sql.raw(`(${coreQuery}) gist_trgm_ops(siglen=${siglen})`),
        ),
        rank: (query: string) => sql
            .raw(`round(('${query}' <<-> (${coreQuery}))::numeric, ${roundingPlaces})`)
            .as(rankColumnName),
    }
}

const {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} = createSchemaFactory({ coerce: true, zodInstance: z })

export const drizZodInsertSchema = createInsertSchema
export const drizZodSelectSchema = createSelectSchema
export const drizZodUpdateSchema = createUpdateSchema
