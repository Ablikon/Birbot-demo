export declare const metrics: {
    increment(key: string, value?: number): void;
    gauge(key: string, value: number): void;
    histogram(key: string, value: number, tags?: string[]): void;
};
