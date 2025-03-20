import type { App } from "$src/lib/server/app/app"
import { ENV } from "$src/env"
import { hc } from "hono/client"

export function API(fetch?: Fetch) {
    const client = hc<App>(ENV.URL, { fetch })

    return {
        PLUGINS: {
            search: client.api.plugins.$get,
        },
    }
}
