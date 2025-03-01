import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const PluginsTable = sqliteTable("plugins", {
    owner: text().notNull(),
    repo: text().notNull(),
    description: text().notNull(),
    category: text().notNull(),
})
