"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:no-unused-variable */
const index_1 = require("./index");
const test_message_1 = require("./test_message");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
function consumerCallback() {
    return (message, rpcConsumer) => {
        //console.log(`callback (${rpcConsumer.GetId()}) got message "${message}"`);
        const testMessage = test_message_1.TestMessage.FromString(message);
        const testmessageReply = new test_message_1.TestMessageReply('0', rpcConsumer.GetId(), testMessage.content * 10, testMessage);
        const r = testmessageReply.ToJson();
        return Promise.resolve().then(() => {
            const delay_in_seconds = Math.random() * 10 * 1000;
            return rxjs_1.of().pipe(operators_1.delay(delay_in_seconds)).toPromise();
        }).then(() => {
            console.log(`callback reply "${r}"`);
            return r;
        });
    };
}
describe('Test rpc call', () => {
    let originalTimeout;
    beforeEach(function () {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        const timeout_seconds = 300;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = timeout_seconds * 1000;
    });
    //it('one consumer and one client', (done) => {
    //  Promise.resolve().then(() => {
    //    const consumerOptions = new RpcConsumerOptions(undefined, '',
    //      consumerCallback()
    //    );
    //    return RpcConsumer.Create(consumerOptions);
    //  }).then(() => {
    //    return RpcClient.Create();
    //  }).then((rpcClient: RpcClient) => {
    //    const promises = [];      
    //    for (let i = 1; i <= 20; i++) {
    //      const msg = new TestMessage(`${i}`, rpcClient.GetId(), i);
    //      promises.push(rpcClient.sendRPCMessage(msg.ToJson()));
    //    }
    //    return Promise.all(promises);
    //  }).then((data: any) => {
    //    //console.log('data', data);
    //    const replies: TestMessageReply[] = data;
    //    console.log('replies', replies);
    //    done();
    //  });
    //});
    //it('two consumer and one client', (done) => {
    //  Promise.resolve().then(() => {
    //    const consumerOptions = new RpcConsumerOptions(undefined, '',
    //      consumerCallback()
    //    );
    //    return RpcConsumer.Create(consumerOptions);
    //  }).then(() => {
    //    const consumerOptions = new RpcConsumerOptions(undefined, '',
    //      consumerCallback()
    //    );
    //    return RpcConsumer.Create(consumerOptions);
    //  }).then(() => {
    //    return RpcClient.Create();
    //  }).then((rpcClient: RpcClient) => {
    //    const promises = [];
    //    for (let i = 1; i <= 20; i++) {
    //      const msg = new TestMessage(`${i}`, rpcClient.GetId(), i);
    //      promises.push(rpcClient.sendRPCMessage(msg.ToJson()));
    //    }
    //    return Promise.all(promises);
    //  }).then((data: any) => {
    //    //console.log('data', data);
    //    const replies: TestMessageReply[] = data;
    //    console.log('replies', replies);
    //    done();
    //  });
    //});
    it('two consumer and two client', (done) => {
        Promise.resolve().then(() => {
            const consumerOptions = new index_1.RpcConsumerOptions(undefined, '', consumerCallback());
            return index_1.RpcConsumer.Create(consumerOptions);
        }).then(() => {
            const consumerOptions = new index_1.RpcConsumerOptions(undefined, '', consumerCallback());
            return index_1.RpcConsumer.Create(consumerOptions);
        }).then(() => {
            return Promise.all([index_1.RpcClient.Create(), index_1.RpcClient.Create()]);
        }).then((rpcClients) => {
            const promises = [];
            for (let i = 1; i <= 20; i++) {
                const rpcClient = rpcClients[i % 2];
                const msg = new test_message_1.TestMessage(`${i}`, rpcClient.GetId(), i);
                promises.push(rpcClient.sendRPCMessage(msg.ToJson()));
            }
            return Promise.all(promises);
        }).then((data) => {
            //console.log('data', data);
            const replies = data;
            console.log('replies', replies);
            done();
        });
    });
    afterEach(function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });
});
