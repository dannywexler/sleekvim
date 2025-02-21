import { fileURLToPath } from "node:url"
import antfu from "@antfu/eslint-config"
import { includeIgnoreFile } from "@eslint/compat"

const gitignorePath = fileURLToPath(new URL("./.gitignore", import.meta.url))

export default antfu(
    {
        isInEditor: false,
        stylistic: {
            indent: 4,
            quotes: "double",
        },
        svelte: true,
        typescript: {
            tsconfigPath: "tsconfig.json",
        },
        yaml: false,
    },

    includeIgnoreFile(gitignorePath),
)
