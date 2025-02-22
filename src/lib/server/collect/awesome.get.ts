import { awesomeProject } from "$lib/server/collect/awesome.schema"
import { downloadProjectReadme } from "$lib/server/github"

export async function getAwesomeProject() {
    await downloadProjectReadme(awesomeProject)
}

if (import.meta.main) {
    void getAwesomeProject()
}
