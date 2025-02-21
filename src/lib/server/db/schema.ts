import { integer, sqliteTable } from "drizzle-orm/sqlite-core"

export const user = sqliteTable("user", {
    id: integer().primaryKey(),
    age: integer(),
})
