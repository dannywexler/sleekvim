import { env } from "bun"

const PROD = env.NODE_ENV === "production"

export const ENV = {
    DEV: !PROD,
    PROD,
}
