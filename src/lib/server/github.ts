import type { Strings } from "$src/common"
import type { Low } from "lowdb"
import { ENV } from "$src/env"
import { CACHE, PROJECTS, READMES } from "$src/paths"
import { Octokit } from "@octokit/rest"
import { file } from "fluent-file"
import { JSONFilePreset } from "lowdb/node"
import { dload } from "./download"

export const README = "README.md"

const GITHUB_RAW_CONTENT_HOST = "raw.githubusercontent.com"

export function projectID(project: GithubProject) {
    return `${project.owner}/${project.repo}`
}

type GithubCache = Record<string, GithubCacheEntry>

type GithubCacheEntry = {
    stats?: GithubProjectStats
    readmePath?: string
}

export type GithubProject = {
    owner: string
    repo: string
}

export type GithubProjectStats = {
    branch: string
    description: string | null
    isArchived: boolean
    stars: number
    updatedOn: string
    writtenIn: string | null
}
let ghCache: Low<GithubCache> | null = null

async function cachedProject<Field extends keyof GithubCacheEntry>(
    project: GithubProject,
    field: Field,
    value?: GithubCacheEntry[Field],
) {
    if (!ghCache) {
        const ghCacheFile = file(CACHE, "github.json")
        await CACHE.ensureExists()
        ghCache = await JSONFilePreset<GithubCache>(ghCacheFile.path, {})
    }
    const id = projectID(project)
    const entry = ghCache.data[id]
    if (!value) {
        return entry ? entry[field] : undefined
    }
    const newEntry = { ...entry ?? {}, [field]: value }
    ghCache.data[id] = newEntry
    void ghCache.write()
}

const octokit = new Octokit({
})

export async function fetchProjectStats(project: GithubProject): Promise<GithubProjectStats> {
    const existingProjectStats = await cachedProject(project, "stats")
    if (existingProjectStats && ENV.DEV) {
        return existingProjectStats
    }
    const { owner, repo } = project
    const { data } = await octokit.rest.repos.get({ owner, repo })
    // console.log("Got", owner, "/", repo, "data:", data)
    const updatedStats = {
        branch: data.default_branch,
        description: data.description,
        isArchived: data.archived,
        stars: data.stargazers_count,
        updatedOn: data.pushed_at,
        writtenIn: data.language,
    }
    void cachedProject(project, "stats", updatedStats)
    return updatedStats
}

export async function fetchProjectReadmePath(project: GithubProject) {
    const existingProjectReadmepath = await cachedProject(project, "readmePath")
    if (existingProjectReadmepath) {
        return existingProjectReadmepath
    }
    const { owner, repo } = project
    const res = await octokit.rest.repos.getReadme({ owner, repo })
    const readmePath = res.data.path
    void cachedProject(project, "readmePath", readmePath)
    return readmePath
}

export async function downloadProjectReadme(project: GithubProject) {
    const branch = (await fetchProjectStats(project)).branch
    const readmePath = await fetchProjectReadmePath(project)
    const { owner, repo } = project
    const destination = file(READMES, owner, repo, README)
    await dload([GITHUB_RAW_CONTENT_HOST, owner, repo, branch, readmePath], destination)
}

export async function downloadProjectFile(project: GithubProject, pathToFile: Strings) {
    const branch = (await fetchProjectStats(project)).branch
    const { owner, repo } = project
    const destination = file(PROJECTS, owner, repo, ...pathToFile)
    await dload([GITHUB_RAW_CONTENT_HOST, owner, repo, branch, ...pathToFile], destination)
}
