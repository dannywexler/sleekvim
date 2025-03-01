import { pgTable, text } from "drizzle-orm/pg-core"

export const PluginsTable = pgTable("plugins", {
    owner: text().notNull(),
    repo: text().notNull(),
    description: text().notNull(),
    category: text().notNull(),
})
