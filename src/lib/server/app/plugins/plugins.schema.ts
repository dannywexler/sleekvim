import { z } from "@hono/zod-openapi"

export const pluginSearchQuery = z.object({
    q: z.string().default("").openapi({
        example: "search query",
    }),
    minStars: z.coerce.number().int().min(0).default(0).openapi({ example: 100 }),
}).openapi("PluginSearchQuery")
export type PluginSearchQuery = z.infer<typeof pluginSearchQuery>
