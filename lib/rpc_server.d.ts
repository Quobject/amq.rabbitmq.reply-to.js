export declare class RpcServerOptions {
    url: string;
    serverid: string;
    callback: (a: string, b: RpcServer) => Promise<string>;
    static RPC_QUEUE: string;
    constructor(url?: string, serverid?: string, callback?: (a: string, b: RpcServer) => Promise<string>);
}
export declare class RpcServer {
    private options;
    private constructor();
    private static idCounter;
    private connection;
    static Create(options?: RpcServerOptions): Promise<RpcServer>;
    GetId(): string;
    Close(): Promise<void>;
    private Startconsuming();
}
