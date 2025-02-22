import { awesomeProjectReadme } from "$lib/server/collect/awesome.schema"
import { ok, safeTry } from "neverthrow"

export function parseAwesomeProject() {
    return safeTry(async function*() {
        const readme = yield * await awesomeProjectReadme.readText()
        console.log("Got awesomeProjectReadme contents:", readme)
        return ok(true)
    }).mapErr(console.error)
}

if (import.meta.main) {
    parseAwesomeProject()
}
