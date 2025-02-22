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
            overrides: {
                "no-console": "off",
            },
            overridesTypeAware: {
                "ts/consistent-type-definitions": ["error", "type"],
                "ts/strict-boolean-expressions": "off",
            },
        },
        yaml: false,
    },

    includeIgnoreFile(gitignorePath),
)
