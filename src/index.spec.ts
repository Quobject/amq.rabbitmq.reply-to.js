/* tslint:disable:no-unused-variable */
import { RpcClient, RpcConsumer } from './index';




describe('Test rpc call', () => {
  let originalTimeout: number;

  beforeEach(function () {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    const timeout_seconds = 30;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = timeout_seconds * 1000;
  });


  it('should call', (done) => {
    const temp = new RpcConsumer();
    temp.call();

    const rpcClient = new RpcClient();

    Promise.resolve().then(() => {
      return rpcClient.createClient();
    }).then((data: any) => {
      const promises = [];
      for (let i = 1; i <= 1; i++) {
        promises.push(rpcClient.sendRPCMessage(`${i}`));
      }

      return Promise.all(promises);
    }).then((data: any) => {
      console.log('data', data);
      done();
    });


  });



  afterEach(function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });


});  
