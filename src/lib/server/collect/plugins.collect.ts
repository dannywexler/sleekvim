import type { GithubProject } from "../github"
import { filterMap } from "$src/lib/utils/arrays"
import { hashit } from "$src/lib/utils/hashing"
import { PluginsSQL } from "../db/plugins.sql"
import { fetchProjectStats, projectID } from "../github"
import { awesomeProjectParsedFile } from "./awesome.schema"

export async function collectPlugins() {
    const lg = console
    // export const collectPlugins = logFn("COLLECT", "PLUGINS", "collectPlugins", async (lg: Alogger) => {
    const parsedPluginsResult = await awesomeProjectParsedFile.read()
    if (parsedPluginsResult.isErr()) {
        lg.error("Could not read awesomeProjectParsedFile", { ...parsedPluginsResult.error })
        return parsedPluginsResult.error
    }
    const parsedPlugins = parsedPluginsResult.value

    const existingPlugins = await PluginsSQL.find()
    const existingPluginsCount = existingPlugins.length
    const existingPluginIds = new Set<string>()
    const existingPluginNames = new Set<string>()
    const existingPluginNameToIdMap = new Map<string, string>()
    const existingPluginEtags = new Set<string>()
    for (const existingPlugin of existingPlugins) {
        existingPluginIds.add(existingPlugin.id)
        existingPluginNames.add(existingPlugin.name)
        existingPluginEtags.add(existingPlugin.etag)
        existingPluginNameToIdMap.set(existingPlugin.name, existingPlugin.id)
    }

    const allProjectStats = await filterMap(parsedPlugins, async (parsedPlugin, { current, total }) => {
        lg.log(`Collecting stats for plugin ${current} of ${total}`, { owner: parsedPlugin.owner, repo: parsedPlugin.repo })
        const stats = await fetchProjectStats(parsedPlugin)
        return { ...stats, ...parsedPlugin }
    })
    allProjectStats.sort((a, b) => b.stars - a.stars)

    let newPluginsCount = 0
    let updatedPluginsCount = 0
    for (const parsedPlugin of allProjectStats) {
        const id = projectID(parsedPlugin)

        const { description, owner } = parsedPlugin
        let name = normalizeAProject(parsedPlugin)
        const matchingIdForName = existingPluginNameToIdMap.get(name)
        if (matchingIdForName) {
            // lg.log(
            //     `${name} has matchingId ${matchingIdForName}`,
            //     { id, name, matchingIdForName },
            // )
            if (matchingIdForName !== id) {
                const newName = `${name}__${owner}`.replace(/\W+/g, "_")
                lg.log(
                    `Collision of ${id} => ${name} with ${matchingIdForName} resolved by renaming to ${newName}!`,
                    { id, name, matchingIdForName },
                )
                name = newName
            }
            else {
                // lg.log(
                //     `Matching id ${matchingIdForName} for name ${name} is from this plugin ${id}`,
                //     { id, name, matchingIdForName },
                // )
            }
        }
        else {
            // lg.log(
            //     `${id} has brand new name: ${name}`,
            //     { id, name, matchingIdForName },
            // )
        }
        existingPluginNames.add(name)
        existingPluginNameToIdMap.set(name, id)

        if (!existingPluginIds.has(id)) {
            existingPluginIds.add(id)
            newPluginsCount++
            lg.log(`Found new plugin!`, { ...parsedPlugin, name })
        }

        const { createdOn, updatedOn, writtenIn, ...otherStats } = parsedPlugin
        if (!writtenIn) {
            lg.warn(
                `${id} stats was missing language written in!`,
                { ...parsedPlugin },
            )
            continue
        }
        const newContent = {
            ...otherStats,
            createdOn: new Date(createdOn),
            updatedOn: new Date(updatedOn),
            writtenIn: writtenIn ?? "MISSING LANGUAGE!!!",
            description,
            name,
            id,
        }
        const etag = hashit(newContent)
        const updatedPlugin = {
            ...newContent,
            etag,
        }
        if (existingPluginEtags.has(etag)) {
            lg.log(`${newContent.name} stats are up to date.`, updatedPlugin)
            continue
        }
        lg.log(`${newContent.name} has new stats.`, updatedPlugin)
        updatedPluginsCount++

        await PluginsSQL.add(updatedPlugin)
    }

    const counts = {
        updatedPluginsCount,
        newPluginsCount,
        totalPluginsCount: existingPluginsCount + newPluginsCount,
    }

    if (updatedPluginsCount > 0 && newPluginsCount > 0) {
        lg.log(`${updatedPluginsCount} plugins were updated, and ${newPluginsCount} plugins were discovered.`, counts)
    }
    else if (updatedPluginsCount > 0) {
        lg.log(`${updatedPluginsCount} plugins were updated.`, counts)
    }
    else if (newPluginsCount > 0) {
        lg.log(`${newPluginsCount} plugins were discovered.`, counts)
    }
    else {
        lg.log("All plugin information is up to date.", counts)
    }
    return counts
}

function normalizeAProject({ owner, repo }: GithubProject) {
    if (repo === "vim" || repo === "nvim" || repo === "neovim") {
        return owner.replace(/\W+/g, "_")
    }

    return repo
        // eslint-disable-next-line regexp/no-unused-capturing-group
        .replace(/^(n|neo)?vim\W/, "")
        // eslint-disable-next-line regexp/no-unused-capturing-group
        .replace(/\W(n|neo)?vim$/, "")
        .replace(/\Wlua$/, "")
        .replace(/\W+/g, "_")
}

if (import.meta.main) {
    // eslint-disable-next-line antfu/no-top-level-await
    await collectPlugins()
}
