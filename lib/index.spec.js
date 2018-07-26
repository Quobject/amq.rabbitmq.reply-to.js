"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:no-unused-variable */
const index_1 = require("./index");
describe('Test rpc call', () => {
    let originalTimeout;
    beforeEach(function () {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        const timeout_seconds = 30;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = timeout_seconds * 1000;
    });
    it('should call', (done) => {
        const temp = new index_1.RpcConsumer();
        temp.call();
        const rpcClient = new index_1.RpcClient();
        Promise.resolve().then(() => {
            return rpcClient.createClient();
        }).then((data) => {
            const promises = [];
            for (let i = 1; i <= 1; i++) {
                promises.push(rpcClient.sendRPCMessage(`${i}`));
            }
            return Promise.all(promises);
        }).then((data) => {
            console.log('data', data);
            done();
        });
    });
    afterEach(function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });
});
