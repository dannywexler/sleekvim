import type { Strings } from "$src/common"
import urlregexSafe from "url-regex-safe"

export const URL_REGEX = urlregexSafe({
    strict: true,
})
export const URL_REGEX2 = /https:\/\/[\w.\-/]+/g

export const NOT_WORD_REGEX = /\W+/g

export const NEWLINE_REGEX = /\n|\r/

export class Str extends String {
    remove(...textToRemove: Array<string | RegExp>) {
        let result = this as Str
        for (const item of textToRemove) {
            result = str(result.replace(item, ""))
        }
        return result
    }

    removeAll(...textToRemove: Array<string | RegExp>) {
        let result = this as Str
        for (const item of textToRemove) {
            result = str(result.replaceAll(item, ""))
        }
        return result
    }

    removePrefix(...textToRemove: Strings) {
        let result = this as Str
        for (const item of textToRemove) {
            if (result.startsWith(item)) {
                result = str(result.replace(item, ""))
            }
        }
        return result
    }

    removeSuffix(...textToRemove: Strings) {
        let result = this as Str
        for (const item of textToRemove) {
            const idx = result.lastIndexOf(item)
            if (idx >= 0) {
                result = str(result.substring(0, idx))
            }
        }
        return result
    }

    between(startTerm: string, endTerm: string) {
        let result = this as Str
        const startIdx = result.indexOf(startTerm)
        if (startIdx >= 0) {
            result = str(result.substring(startIdx + startTerm.length))
        }
        const endIdx = result.indexOf(endTerm, startIdx)
        if (endIdx >= 0) {
            result = str(result.substring(0, endIdx))
        }
        return result
    }

    removeUntil(searchTerm: string) {
        const idx = this.indexOf(searchTerm)
        return str(this.substring(idx))
    }

    after(searchTerm: string) {
        const idx = this.indexOf(searchTerm)
        if (idx >= 0) {
            return str(this.substring(idx + searchTerm.length))
        }
        return this
    }

    snakify() {
        return this.replace(NOT_WORD_REGEX, "_")
    }

    lines() {
        return this.split(NEWLINE_REGEX).map(str)
    }
}

export function str(astring: string) {
    return new Str(astring)
}
