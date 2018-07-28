/* tslint:disable:no-unused-variable */
import { RpcClient, RpcServer, RpcServerOptions } from './index';
import { TestMessage, TestMessageReply } from './test_message';
import * as Rx from 'rxjs/Rx';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';


const serverCallbackTimesTen: ((a: string, b: RpcServer) => Promise<string>) =
  (message: string, rpcServer: RpcServer) => {
    const n = parseInt(message);
    return Promise.resolve(`${n * 10}`);
  };


const serverCallback: ((a: string, b: RpcServer) => Promise<string>) =
  (message: string, rpcConsumer: RpcServer) => {
    const testMessage = TestMessage.FromString(message);
    const testmessageReply = new TestMessageReply('0', rpcConsumer.GetId(), testMessage.content * 10, testMessage);
    const r = testmessageReply.ToJson();

    return Promise.resolve().then(() => {
      //const delay_in_seconds = Math.random() * 10 * 1000;
      const delay_in_seconds = 0;
      return of().pipe(delay(delay_in_seconds)).toPromise();
    }).then(() => {
      //console.log(`callback reply "${r}"`);
      return r;
    });
  };


describe('Test rpc call', () => {
  let originalTimeout: number;

  beforeEach(function () {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    const timeout_seconds = 300;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = timeout_seconds * 1000;
  });


  it('one server and one client times ten', (done) => {
    let rpcServer: RpcServer;
    let rpcClient: RpcClient;

    Promise.resolve().then(() => {
      const serverOptions = new RpcServerOptions(
        /* url */ undefined,
        /* serverId */ undefined,
        /* callback */ serverCallbackTimesTen
      );
      return RpcServer.Create(serverOptions);
    }).then((rpcServerP: RpcServer) => {
      rpcServer = rpcServerP;
      return RpcClient.Create();
    }).then((rpcClientP: RpcClient) => {
      rpcClient = rpcClientP;
      const promises = [];

      for (let i = 1; i <= 20; i++) {        
        promises.push(rpcClient.sendRPCMessage(`${i}`));
      }

      return Promise.all(promises);
    }).then((data: any) => {
      const replies: TestMessageReply[] = data;

      console.log('one server and one client times ten replies', replies);

      return Promise.all([rpcServer.Close(), rpcClient.Close()]);
    }).then(() => {
      done();
    });
  });

  it('one server and one client', (done) => {
    let rpcServer: RpcServer;
    let rpcClient: RpcClient;

    Promise.resolve().then(() => {
      const serverOptions = new RpcServerOptions(
        /* url */ undefined,
        /* serverId */ undefined,
        /* callback */ serverCallback
      );
      return RpcServer.Create(serverOptions);
    }).then((rpcServerP: RpcServer) => {
      rpcServer = rpcServerP;
      return RpcClient.Create();
    }).then((rpcClientP: RpcClient) => {
      rpcClient = rpcClientP;
      const promises = [];      

      for (let i = 1; i <= 20; i++) {
        const msg = new TestMessage(`${i}`, rpcClient.GetId(), i);
        promises.push(rpcClient.sendRPCMessage(msg.ToJson()));
      }

      return Promise.all(promises);
    }).then((data: any) => {
      const replies: TestMessageReply[] = data;

      console.log('one server and one client replies', replies);

      return Promise.all([rpcServer.Close(), rpcClient.Close()]);
    }).then(() => {
      done();
    });
  });


 

  it('two servers and two clients', (done) => {
    let rpcServers: RpcServer[] = [];
    let rpcClients: RpcClient[];

    Promise.resolve().then(() => {
      const serverOptions = new RpcServerOptions(
        /* url */ undefined,
        /* serverId */ undefined,
        /* callback */ serverCallback
      );
      return RpcServer.Create(serverOptions);
    }).then((rpcServerP: RpcServer) => {
      rpcServers[0] = rpcServerP;

      const serverOptions = new RpcServerOptions(
        /* url */ undefined,
        /* serverId */ undefined,
        /* callback */ serverCallback
      );
      return RpcServer.Create(serverOptions);
    }).then((rpcServerP: RpcServer) => {
      rpcServers[1] = rpcServerP;

      return Promise.all([RpcClient.Create(), RpcClient.Create()]);
    }).then((rpcClientsP: RpcClient[]) => {
      rpcClients = rpcClientsP;

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

