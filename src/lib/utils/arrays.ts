type FilterMapperContext = {
    current: string
    index: number
    total: number
}
type FilterMapper<Item, Output> = (item: Item, context: FilterMapperContext) => Promise<Output | symbol | null | undefined>
type FilterMapperSync<Item, Output> = (item: Item, context: FilterMapperContext) => Output | symbol | null | undefined

export async function filterMap<Item, Out>(arr: Array<Item>, mapper: FilterMapper<Item, Out>) {
    const output: Array<Out> = []
    for (const [index, item] of arr.entries()) {
        const total = arr.length
        const current = (index + 1).toString().padStart(total.toString().length)
        const res = await mapper(item, { index, current, total })
        if (!res || typeof res === "symbol") {
            continue
        }
        output.push(res)
    }
    return output
}

export function filterMapSync<Item, Out>(arr: Array<Item>, mapper: FilterMapperSync<Item, Out>) {
    const output: Array<Out> = []
    for (const [index, item] of arr.entries()) {
        const total = arr.length
        const current = (index + 1).toString().padStart(total.toString().length)
        const res = mapper(item, { index, current, total })
        if (!res || typeof res === "symbol") {
            continue
        }
        output.push(res)
    }
    return output
}
