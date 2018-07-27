export declare class RpcConsumer {
    private id;
    constructor(id?: string);
    private static readonly DISPLAY_STRING;
    private conn;
    call(): Promise<any>;
}
