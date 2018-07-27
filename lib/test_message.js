"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TestMessage {
    constructor(messageid, clientid, content) {
        this.messageid = messageid;
        this.clientid = clientid;
        this.content = content;
    }
    ToJson() {
        return JSON.stringify(this);
    }
    static FromString(json) {
        const obj = JSON.parse(json);
        const result = new TestMessage(obj.messageid, obj.clientid, obj.content);
        return result;
    }
}
exports.TestMessage = TestMessage;
class TestMessageReply {
    constructor(messageid, consumerid, content, testmessage) {
        this.messageid = messageid;
        this.consumerid = consumerid;
        this.content = content;
        this.testmessage = testmessage;
    }
    ToJson() {
        return JSON.stringify(this);
    }
}
exports.TestMessageReply = TestMessageReply;
