export type Awaitable<T> = Promise<T> | T
export type Prettify<T> = {
    [K in keyof T]: T[K]
} & {}
