export declare class RpcClientOptions {
    url: string;
    clientid: string;
    constructor(url?: string, clientid?: string);
}
export declare class RpcClient {
    private options;
    private static readonly REPLY_QUEUE;
    private static idCounter;
    private connection;
    private constructor();
    private channel;
    private responseEmitter;
    static Create(options?: RpcClientOptions): Promise<RpcClient>;
    GetId(): string;
    Close(): Promise<void>;
    private createClient();
    sendRPCMessage(message: string): Promise<string>;
}
