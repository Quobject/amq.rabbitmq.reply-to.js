# amq.rabbitmq.reply-to.js
* Uses direct `reply-to` - a feature that allows RPC (request/reply) clients with a design similar to that demonstrated in tutorial 6 (https://www.rabbitmq.com/direct-reply-to.html) to avoid declaring a response queue per request.

* Creates an event emitter where rpc responses will be published by correlationId
as suggested by https://github.com/squaremo/amqp.node/issues/259#issuecomment-230165144

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]

```
npm i amq.rabbitmq.reply-to.js
```

# Example

**javascript**
```js
const rabbitmqreplyto = require('amq.rabbitmq.reply-to.js');

const serverCallbackTimesTen = (message, rpcServer) => {
    const n = parseInt(message);
    return Promise.resolve(`${n * 10}`);
};

let rpcServer;
let rpcClient;
Promise.resolve().then(() => {
    const serverOptions = new rabbitmqreplyto.RpcServerOptions(
    /* url */ undefined, 
    /* serverId */ undefined, 
    /* callback */ serverCallbackTimesTen);

    return rabbitmqreplyto.RpcServer.Create(serverOptions);
}).then((rpcServerP) => {
    rpcServer = rpcServerP;
    return rabbitmqreplyto.RpcClient.Create();
}).then((rpcClientP) => {
    rpcClient = rpcClientP;
    const promises = [];
    for (let i = 1; i <= 20; i++) {
        promises.push(rpcClient.sendRPCMessage(`${i}`));
    }
    return Promise.all(promises);
}).then((replies) => {
    console.log(replies);
    return Promise.all([rpcServer.Close(), rpcClient.Close()]);
});

//['10',
//  '20',
//  '30',
//  '40',
//  '50',
//  '60',
//  '70',
//  '80',
//  '90',
//  '100',
//  '110',
//  '120',
//  '130',
//  '140',
//  '150',
//  '160',
//  '170',
//  '180',
//  '190',
//  '200']

```

**typescript**
```ts
import { RpcClient, RpcServer, RpcServerOptions } from 'amq.rabbitmq.reply-to.js';

const serverCallbackTimesTen: ((a: string, b: RpcServer) => Promise<string>) =
  (message: string, rpcServer: RpcServer) => {
    const n = parseInt(message);
    return Promise.resolve(`${n * 10}`);
  };

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

  console.log(replies);

  return Promise.all([rpcServer.Close(), rpcClient.Close()]);
});



//['10',
//  '20',
//  '30',
//  '40',
//  '50',
//  '60',
//  '70',
//  '80',
//  '90',
//  '100',
//  '110',
//  '120',
//  '130',
//  '140',
//  '150',
//  '160',
//  '170',
//  '180',
//  '190',
//  '200']

```




## License

MIT

[npm-image]: https://img.shields.io/npm/v/amq.rabbitmq.reply-to.js.svg?style=flat
[npm-url]: https://npmjs.org/package/amq.rabbitmq.reply-to.js
[downloads-image]: https://img.shields.io/npm/dm/amq.rabbitmq.reply-to.js.svg?style=flat
[downloads-url]: https://npmjs.org/package/amq.rabbitmq.reply-to.js