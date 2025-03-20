import { octokit } from "./lib/server/github"

export async function init() {
    await octokit()
}
