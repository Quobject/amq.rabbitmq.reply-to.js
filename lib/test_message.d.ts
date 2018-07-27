export declare class TestMessage {
    messageid: string;
    clientid: string;
    content: number;
    constructor(messageid: string, clientid: string, content: number);
    ToJson(): string;
    static FromString(json: any): TestMessage;
}
export declare class TestMessageReply {
    messageid: string;
    consumerid: string;
    content: number;
    testmessage: TestMessage;
    constructor(messageid: string, consumerid: string, content: number, testmessage: TestMessage);
    ToJson(): string;
}
