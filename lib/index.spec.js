"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:no-unused-variable */
const index_1 = require("./index");
const test_message_1 = require("./test_message");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const serverCallbackTimesTen = (message, rpcServer) => {
    const n = parseInt(message);
    return Promise.resolve(`${n * 10}`);
};
const serverCallback = (message, rpcConsumer) => {
    const testMessage = test_message_1.TestMessage.FromString(message);
    const testmessageReply = new test_message_1.TestMessageReply('0', rpcConsumer.GetId(), testMessage.content * 10, testMessage);
    const r = testmessageReply.ToJson();
    return Promise.resolve().then(() => {
        //const delay_in_seconds = Math.random() * 10 * 1000;
        const delay_in_seconds = 0;
        return rxjs_1.of().pipe(operators_1.delay(delay_in_seconds)).toPromise();
    }).then(() => {
        //console.log(`callback reply "${r}"`);
        return r;
    });
};
describe('Test rpc call', () => {
    let originalTimeout;
    beforeEach(function () {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        const timeout_seconds = 300;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = timeout_seconds * 1000;
    });
    it('one server and one client times ten', (done) => {
        let rpcServer;
        let rpcClient;
        Promise.resolve().then(() => {
            const serverOptions = new index_1.RpcServerOptions(
            /* url */ undefined, 
            /* serverId */ undefined, 
            /* callback */ serverCallbackTimesTen);
            return index_1.RpcServer.Create(serverOptions);
        }).then((rpcServerP) => {
            rpcServer = rpcServerP;
            return index_1.RpcClient.Create();
        }).then((rpcClientP) => {
            rpcClient = rpcClientP;
            const promises = [];
            for (let i = 1; i <= 20; i++) {
                promises.push(rpcClient.sendRPCMessage(`${i}`));
            }
            return Promise.all(promises);
        }).then((data) => {
            const replies = data;
            console.log('one server and one client times ten replies', replies);
            return Promise.all([rpcServer.Close(), rpcClient.Close()]);
        }).then(() => {
            done();
        });
    });
    it('one server and one client', (done) => {
        let rpcServer;
        let rpcClient;
        Promise.resolve().then(() => {
            const serverOptions = new index_1.RpcServerOptions(
            /* url */ undefined, 
            /* serverId */ undefined, 
            /* callback */ serverCallback);
            return index_1.RpcServer.Create(serverOptions);
        }).then((rpcServerP) => {
            rpcServer = rpcServerP;
            return index_1.RpcClient.Create();
        }).then((rpcClientP) => {
            rpcClient = rpcClientP;
            const promises = [];
            for (let i = 1; i <= 20; i++) {
                const msg = new test_message_1.TestMessage(`${i}`, rpcClient.GetId(), i);
                promises.push(rpcClient.sendRPCMessage(msg.ToJson()));
            }
            return Promise.all(promises);
        }).then((data) => {
            const replies = data;
            console.log('one server and one client replies', replies);
            return Promise.all([rpcServer.Close(), rpcClient.Close()]);
        }).then(() => {
            done();
        });
    });
    it('two servers and two clients', (done) => {
        let rpcServers = [];
        let rpcClients;
        Promise.resolve().then(() => {
            const serverOptions = new index_1.RpcServerOptions(
            /* url */ undefined, 
            /* serverId */ undefined, 
            /* callback */ serverCallback);
            return index_1.RpcServer.Create(serverOptions);
        }).then((rpcServerP) => {
            rpcServers[0] = rpcServerP;
            const serverOptions = new index_1.RpcServerOptions(
            /* url */ undefined, 
            /* serverId */ undefined, 
            /* callback */ serverCallback);
            return index_1.RpcServer.Create(serverOptions);
        }).then((rpcServerP) => {
            rpcServers[1] = rpcServerP;
            return Promise.all([index_1.RpcClient.Create(), index_1.RpcClient.Create()]);
        }).then((rpcClientsP) => {
            rpcClients = rpcClientsP;
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
            console.log('two servers and two clients replies', replies);
            return Promise.all([
                rpcServers[0].Close(),
                rpcClients[0].Close(),
                rpcServers[1].Close(),
                rpcClients[1].Close(),
            ]);
        }).then(() => {
            done();
        });
    });
    afterEach(function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });
});
