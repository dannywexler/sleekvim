import { appendFile } from "node:fs/promises"
import { file } from "fluent-file"
import stringify from "safe-stable-stringify"
import { DATA } from "./paths"

type AnyFunc = (...args: any) => any

function prettify(content: any) {
    return stringify(content, null, 4)
}

export const LOG_LEVELS = ["INF", "WRN", "ERR"] as const
export type Rec<Value = unknown> = Record<string, Value>
export type LogLevel = typeof LOG_LEVELS[number]
export type Alogger = {
    log: (msg: string, data: Rec) => void
    warn: (msg: string, data: Rec) => void
    error: (msg: string, data: Rec) => void
    context: (additionalContext?: Rec) => Rec
}

function createLogger(context: Rec): Alogger {
    let ctx = { ...context }
    return {
        log: (msg: string, data: Rec) => metaLog("INF", msg, { ...data, ...context }),
        warn: (msg: string, data: Rec) => metaLog("WRN", msg, { ...data, ...context }),
        error: (msg: string, data: Rec) => metaLog("WRN", msg, { ...data, ...context }),
        context: (newContext?: Rec) => {
            if (newContext) {
                ctx = { ...ctx, ...newContext }
            }
            return { ...ctx }
        },
    }
}

function metaLog(level: LogLevel, msg: string, data: Record<string, unknown>) {
    const timestamp = new Date().toISOString()
    logToConsole(timestamp, level, msg, data)
    void logToFile(timestamp, level, msg, data)
}

function logToConsole(timestamp: string, level: LogLevel, msg: string, data: Record<string, unknown>) {
    const method = level === "INF" ? "log" : level === "WRN" ? "warn" : "error"
    const { service, scope, func, stage, ...rest } = data
    const message = stage ?? `MSG: ${msg}`
    const pieces = [service, scope, func, message]

    if (method !== "log") {
        console[method](timestamp, level, service, "=>", scope, "=>", func, "=>", msg, prettify(rest))
    }
    else {
        console[method](pieces.join(" => "), prettify(rest))
    }
}

async function logToFile(timestamp: string, level: LogLevel, msg: string, data: Record<string, unknown>) {
    const date = timestamp.substring(0, 10)
    const year = date.substring(0, 4)
    const month = date.substring(5, 7)

    const str = `${stringify({ ...data, timestamp, level, msg }) ?? ""}\n`
    const logFile = file(DATA, "logs", year, month, `${date}.log`)

    try {
        await appendFile(logFile.path, str)
    }
    catch (e) {
        console.error("Error writing to", logFile.path, e)
        await logFile.getParentFolder().ensureExists()
        console.log("Creating folder and writing again")
        await appendFile(logFile.path, str)
    }
}

type InnerLogFunc<Fn extends AnyFunc> = Fn extends (...args: [...infer Input, Alogger]) => infer Output ? (...args: Input) => Output : Fn

export function logFn<Fn extends AnyFunc>(service: string, scope: string, func: string, fn: Fn) {
    return async (...args: Parameters<InnerLogFunc<Fn>>): Promise<Awaited<ReturnType<Fn>>> => {
        const start = new Date()
        const startTime = start.toISOString()
        const instanceID = [func, startTime, randID()].join("__")
        const lg = createLogger({
            func,
            instanceID,
            scope,
            service,
        })
        const totalArgs = args.length
        const inputArgs = Object.fromEntries(args.map((val, index) => [`arg${index.toString().padStart(totalArgs, "0")}`, val]))
        lg.log(`${func} called`, { startTime, stage: "CALLED", ...inputArgs })

        const output = await fn(...args, lg) as Promise<Awaited<ReturnType<Fn>>>

        const end = new Date()
        const endTime = end.toISOString()
        const duration = end.getTime() - start.getTime()
        lg.log(`${func} returning`, { endTime, stage: "RETURNING", duration, output })
        return output
    }
}

export function randID() {
    return Math.random().toString(36).slice(2)
}
