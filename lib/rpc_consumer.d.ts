export declare class RpcConsumerOptions {
    url: string;
    consumerid: string;
    callback: (a: string, b: RpcConsumer) => Promise<string>;
    constructor(url?: string, consumerid?: string, callback?: (a: string, b: RpcConsumer) => Promise<string>);
}
export declare class RpcConsumer {
    private options;
    private constructor();
    private static readonly DISPLAY_STRING;
    private static idCounter;
    private conn;
    static Create(options?: RpcConsumerOptions): Promise<RpcConsumer>;
    GetId(): string;
    startconsuming(): Promise<void>;
}
