export class TestMessage {

  constructor(public messageid: string, public clientid: string, public content: number) { }

  public ToJson(): string {
    return JSON.stringify(this);
  }

  public static FromString(json: any): TestMessage {
    const obj = JSON.parse(json);
    const result = new TestMessage(obj.messageid, obj.clientid, obj.content);
    return result;
  }
}

export class TestMessageReply {
  constructor(public messageid: string, public consumerid: string, public content: number, public testmessage: TestMessage) { }

  public ToJson(): string {
    return JSON.stringify(this);
  }
}