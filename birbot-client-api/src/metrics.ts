export const metrics = {
    increment(key: string, value?: number) {},
    gauge(key: string, value: number) {},
    histogram(key: string, value: number, tags?: string[]) {},
}
