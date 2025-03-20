import process from "node:process"

const PROD = process.env.NODE_ENV === "production"

export const ENV = {
    DEV: !PROD,
    PROD,
    URL: PROD ? "https://sleekvim.fly.app" : "http://localhost:3000",
}
