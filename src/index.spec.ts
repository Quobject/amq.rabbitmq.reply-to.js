/* tslint:disable:no-unused-variable */
import { RpcClient, RpcConsumer, RpcConsumerOptions } from './index';
import { TestMessage, TestMessageReply } from './test_message';
import * as Rx from 'rxjs/Rx';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';


function consumerCallback(): ((a: string, b: RpcConsumer) => Promise<string>) | undefined {
  return (message: string, rpcConsumer: RpcConsumer) => {
    //console.log(`callback (${rpcConsumer.GetId()}) got message "${message}"`);
    const testMessage = TestMessage.FromString(message);
    const testmessageReply = new TestMessageReply('0', rpcConsumer.GetId(), testMessage.content * 10, testMessage);
    const r = testmessageReply.ToJson();

    return Promise.resolve().then(() => {
      const delay_in_seconds = Math.random() * 10 * 1000;
      return of().pipe(delay(delay_in_seconds)).toPromise();
    }).then(() => {
      console.log(`callback reply "${r}"`);
      return r;
    });
  };
}

describe('Test rpc call', () => {
  let originalTimeout: number;

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


  //it('two consumers and one client', (done) => {

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


  it('two consumers and two clients', (done) => {

    Promise.resolve().then(() => {
      const consumerOptions = new RpcConsumerOptions(undefined, '',
        consumerCallback()
      );
      return RpcConsumer.Create(consumerOptions);
    }).then(() => {
      const consumerOptions = new RpcConsumerOptions(undefined, '',
        consumerCallback()
      );
      return RpcConsumer.Create(consumerOptions);
      }).then(() => {
        return Promise.all([RpcClient.Create(), RpcClient.Create()]);
    }).then((rpcClients: RpcClient[]) => {
      const promises = [];

      for (let i = 1; i <= 20; i++) {
        const rpcClient = rpcClients[i % 2];

        const msg = new TestMessage(`${i}`, rpcClient.GetId(), i);
        promises.push(rpcClient.sendRPCMessage(msg.ToJson()));
      }

      return Promise.all(promises);
    }).then((data: any) => {
      //console.log('data', data);
      const replies: TestMessageReply[] = data;

      console.log('replies', replies);
      done();
    });
  });

  afterEach(function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });


});

