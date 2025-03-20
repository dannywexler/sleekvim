import type { GithubProject } from "$lib/server/github"
import { README } from "$lib/server/github"
import { ENV } from "$src/env"
import { afile, folder } from "fluent-file"

const PROJECT_ROOT = folder(import.meta.dir, "..")
export const DATA = folder(ENV.PROD ? "/" : PROJECT_ROOT, "data")
export const DATABASE = DATA.subFolder("database")
export const DATABASE_MIGRATIONS = PROJECT_ROOT.subFolder("db_migrations")
export const CACHE = DATA.subFolder("cache")
export const PROJECTS = DATA.subFolder("projects")
export const READMES = DATA.subFolder("readmes")

export function readmeFile(project: GithubProject) {
    return afile(READMES, project.owner, project.repo, README)
}
