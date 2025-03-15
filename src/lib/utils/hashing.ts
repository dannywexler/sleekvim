import { hash } from "bun"
import { stringit } from "./strings"

export function hashit(content: unknown) {
    return hash.xxHash32(stringit(content), 42).toString(36)
}
