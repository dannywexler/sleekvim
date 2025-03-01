import { env } from "node:process"

const PROD = env.NODE_ENV === "production"

export const ENV = {
    DEV: !PROD,
    PROD,
}
