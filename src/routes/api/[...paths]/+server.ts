import type { RequestHandler } from "./$types"
import { app } from "$src/lib/server/app/app"

export const GET: RequestHandler = async ({ request }) => app.fetch(request)
