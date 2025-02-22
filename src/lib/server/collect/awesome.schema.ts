import { PROJECTS, readmeFile } from "$src/paths"
import { jsonFile } from "fluent-file"
import { z } from "zod"

export const awesomeProject = { owner: "rockerBOO", repo: "awesome-neovim" }

export const awesomeProjectReadme = readmeFile(awesomeProject)

export const awesomePlugin = z.object({
    owner: z.string(),
    repo: z.string(),
    description: z.string(),
    category: z.string(),
})
export type AwesomePlugin = z.infer<typeof awesomePlugin>

export const awesomeProjectParsed = z.array(awesomePlugin)

export const awesomeProjectParsedFile = jsonFile(
    awesomeProjectParsed,
    PROJECTS,
    awesomeProject.owner,
    awesomeProject.repo,
    "awesome.parsed.json",
)
