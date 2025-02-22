export type Alogger = typeof console

type AnyFunc = (...args: any) => any

type InnerLogFunc<Fn extends AnyFunc> = Fn extends (...args: [...infer Input, Alogger]) => infer Output ? (...args: Input) => Output : Fn

export function logFn<Fn extends AnyFunc>(methodName: string, fn: Fn) {
    return async (...args: Parameters<InnerLogFunc<Fn>>): Promise<Awaited<ReturnType<Fn>>> => {
        const start = new Date()
        const startTime = start.toISOString()
        const instanceID = `${startTime}__${Math.random().toString(36).slice(2)}`
        console.log({ startTime, methodName, instanceID, event: "START", input: [...args] })

        const output = await fn(...args, console)

        const end = new Date()
        const endTime = end.toISOString()
        const duration = end.getTime() - start.getTime()
        console.log({ endTime, methodName, instanceID, event: "DONE", duration, output })
        return output
    }
}
