import type { AwesomePlugin } from "$lib/server/collect/awesome.schema"
import type { Str } from "$src/lib/utils/strings"
import { awesomeProjectParsedFile, awesomeProjectReadme } from "$lib/server/collect/awesome.schema"
import { str, URL_REGEX } from "$src/lib/utils/strings"
import { ok, safeTry } from "neverthrow"
import { githubURL } from "../github"

const textToRemove = [
    "### (requires Neovim 0.5)",
    "#### LSP Installer",
    "### Tree-sitter Supported Colorscheme",
    "### Lua Colorscheme",
    "### Tree-sitter Based",
]

const foundPlugins: Array<AwesomePlugin> = []

export function parseAwesomeProject() {
    return safeTry(async function*() {
        const rawReadmeText = yield * await awesomeProjectReadme.readText()
        const readmeText = cleanup(rawReadmeText)
        for (const categorySection of readmeText.split("##")) {
            parseCategorySection(categorySection)
        }
        console.log("Found", foundPlugins.length, "plugins")

        yield * await awesomeProjectParsedFile.write(foundPlugins)
        return ok(true)
    }).mapErr(console.error)
}

function cleanup(text: string) {
    return str(text)
        .removeAll(...textToRemove)
        .removeUntil("## LSP")
        .removeSuffix("## Preconfigured Configuration")
        .replaceAll("####", "##")
        .replaceAll("###", "##")
        .replaceAll("anott03/nvim-lspinstall", "IGNORE")
        .replaceAll("alexaandru/nvim-lspupdate", "IGNORE")
        .replaceAll("ada0l/obsidian", "andvarfolomeev/obsidian")
}

function parseCategorySection(categorySection: string) {
    const [firstItem, ...categoryLines] = str(categorySection).lines()
    if (!firstItem) {
        return
    }
    const category = overrideCategory(firstItem.trim())

    for (const categoryLine of categoryLines) {
        const foundInfo = parseCategoryLine(categoryLine)
        if (!foundInfo) {
            continue
        }
        const foundPlugin = {
            ...foundInfo,
            category,
        } satisfies AwesomePlugin
        foundPlugins.push(foundPlugin)
    }
}

function parseCategoryLine(categoryLine: Str) {
    if (!categoryLine.startsWith("- [")) {
        return
    }
    if (!categoryLine.includes("github.com")) {
        return
    }
    if (!categoryLine.includes(") - ")) {
        return
    }

    const urlMatches = categoryLine.match(URL_REGEX)
    if (!urlMatches) {
        return
    }

    const project = urlMatches
        .map((urlMatch) => {
            const res = githubURL.safeParse(urlMatch)
            if (!res.success) {
                console.log(
                    "URL parse error for",
                    urlMatch,
                    res.error.format()._errors,
                )
            }
            return res.data
        })
        .filter(item => !!item)
        .shift()
    if (!project) {
        return
    }

    const description = categoryLine.after(") - ").trim()
    return {
        owner: project.owner,
        repo: project.repo,
        description,
    }
}

const programmingLangSupport = "Programming Languages Support"
const programmingLangSupportCategories = [
    "Golang",
    "YAML",
    "PHP",
    "CSV Files",
]
function overrideCategory(category: string) {
    if (programmingLangSupportCategories.includes(category)) {
        return programmingLangSupport
    }
    return category
}

if (import.meta.main) {
    parseAwesomeProject()
}
