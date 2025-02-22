import type { Strings } from "$src/common"
import type { AnyFile } from "fluent-file"
import { ENV } from "$src/env"
import download from "download"

const HTTPS = "https://"

export async function dload(urlPieces: Strings, destinationFile: AnyFile) {
    let base = urlPieces.shift() ?? ""
    if (!base.startsWith(HTTPS)) {
        base = HTTPS + base
    }
    const url = [base, ...urlPieces].join("/")
    const alreadyExists = await destinationFile.exists()
    if (alreadyExists && ENV.DEV) {
        return
    }
    await download(url, destinationFile.parentPath, { filename: destinationFile.fullName })
}
