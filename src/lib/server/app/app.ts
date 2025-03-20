import { OpenAPIHono } from "@hono/zod-openapi"
import { compress } from "hono/compress"
import { pluginsRoute } from "./plugins/plugins.route"

const apiRoute = new OpenAPIHono()
    .doc("/doc", {
        openapi: "3.0.0",
        info: {
            version: "1.0.0",
            title: "My API",
        },
    })
    .use(compress())
    .route("/plugins", pluginsRoute)

export const app = new OpenAPIHono().route("/api", apiRoute)

export type App = typeof app
