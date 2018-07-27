export declare class RpcClient {
    private static readonly DISPLAY_STRING;
    private static readonly REPLY_QUEUE;
    private channel;
    private responseEmitter;
    createClient(): Promise<void>;
    sendRPCMessage(message: string, rpcQueue?: string): Promise<string>;
}
