import type { Alogger } from "$src/logging"
import type { Low } from "lowdb"
import { setTimeout } from "node:timers/promises"
import { ENV } from "$src/env"
import { logFn } from "$src/logging"
import { CACHE, READMES } from "$src/paths"
import { Octokit } from "@octokit/rest"
import { assertString } from "@sindresorhus/is"
import { afile } from "fluent-file"
import { JSONFilePreset } from "lowdb/node"
import { z, ZodIssueCode } from "zod"
import { str } from "../utils/strings"
import { dload } from "./download"

let octo: Octokit | null = null

export async function octokit() {
    if (octo) {
        return octo
    }
    let token = import.meta.env.GITHUB_PA_TOKEN as string | undefined
    if (token) {
        console.log("Got GITHUB_PA_TOKEN from import.meta.env")
    }
    else {
        const res = await import("$env/static/private")
        token = res.GITHUB_PA_TOKEN
        console.log("Got GITHUB_PA_TOKEN from env/static/private")
    }
    assertString(token, "GITHUB_PA_TOKEN is missing!!")
    octo = new Octokit({
        auth: token,
    })

    octo.hook.before("request", async () => {
        await setTimeout(ENV.DEV ? 100 : 1000)
    })

    return octo
}

export const README = "README.md"

const GITHUB_IO = ".github.io"

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
    createdOn: string
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
        const ghCacheFile = afile(CACHE, "github.json")
        await CACHE.ensureExists()
        ghCache = await JSONFilePreset<GithubCache>(ghCacheFile.path, { defaults: {} })
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

export const fetchProjectStats = logFn("GITHUB", "STATS", "fetchProjectStats", async (project: GithubProject, lg: Alogger) => {
    const { owner, repo } = project
    if (ENV.DEV) {
        const cachedProjectStats = await cachedProject(project, "stats")
        if (cachedProjectStats) {
            lg.log("CACHED ProjectStats", { cachedProjectStats })
            return cachedProjectStats
        }
    }
    const { data } = await (await octokit()).repos.get({ owner, repo })
    const updatedMs = new Date(data.updated_at).getTime()
    const pushedMs = new Date(data.pushed_at).getTime()
    const updatedOn = new Date(Math.max(updatedMs, pushedMs)).toISOString()
    const fetchedProjecStats = {
        branch: data.default_branch,
        createdOn: data.created_at,
        description: data.description,
        homepage: data.homepage,
        isArchived: data.archived,
        stars: data.stargazers_count,
        updatedOn,
        writtenIn: data.language,
    }
    void cachedProject(project, "stats", fetchedProjecStats)
    lg.log("FETCHED ProjectStats", { fetchedProjecStats })
    return fetchedProjecStats
})

export const fetchProjectReadmePath = logFn("GITHUB", "README", "fetchProjectReadmePath", async (project: GithubProject, lg: Alogger) => {
    const { owner, repo } = project
    const cachedProjectReadmePath = await cachedProject(project, "readmePath")
    if (cachedProjectReadmePath) {
        lg.log("CACHED ProjectReadmePath", { cachedProjectReadmePath })
        return cachedProjectReadmePath
    }
    const res = await (await octokit()).repos.getReadme({ owner, repo })
    const readmePath = res.data.path
    void cachedProject(project, "readmePath", readmePath)
    lg.log("FETCHED ProjectReadmePath", { existingProjectReadmepath: cachedProjectReadmePath })
    return readmePath
})

export const downloadProjectReadme = logFn("GITHUB", "README", "downloadProjectReadme", async (project: GithubProject) => {
    const { owner, repo } = project
    const branch = (await fetchProjectStats(project)).branch
    const readmePath = await fetchProjectReadmePath(project)
    const destination = afile(READMES, owner, repo, README)
    await dload([GITHUB_RAW_CONTENT_HOST, owner, repo, branch, readmePath], destination)
})

export const githubURL = z.string().url().transform((urlstr, { addIssue }) => {
    const og = new URL(urlstr)
    const path = og.pathname.split("/").filter(Boolean)
    const firstPathPiece = path.shift()
    const secondPathPiece = path.shift()
    const host = str(og.host)
    if (host.endsWith(GITHUB_IO) && firstPathPiece) {
        return {
            owner: host.removeSuffix(GITHUB_IO).toString(),
            repo: firstPathPiece,
        }
    }
    if (og.host !== "github.com") {
        addIssue({
            code: ZodIssueCode.custom,
            message: "Host was not github.com",
        })
        return z.NEVER
    }
    if (!firstPathPiece) {
        addIssue({
            code: ZodIssueCode.custom,
            message: "Missing owner",
        })
        return z.NEVER
    }
    const owner = firstPathPiece

    if (!secondPathPiece) {
        addIssue({
            code: ZodIssueCode.custom,
            message: "Missing repo",
        })
        return z.NEVER
    }
    let repo = secondPathPiece
    if (owner === "echasnovski") {
        // console.log("echasnovski:", urlstr)
        const lastPathPiece = path.pop()
        if (!lastPathPiece) {
            addIssue({
                code: ZodIssueCode.custom,
                message: "Missing lastPathPiece",
            })
            return z.NEVER
        }
        repo = lastPathPiece.replace("-", ".").replace("mini.git", "mini-git").replace(".md", "")
    }
    return {
        owner,
        repo,
    }
})
