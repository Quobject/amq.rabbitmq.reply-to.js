# amq.rabbitmq.reply-to.js
Direct reply-to is a feature that allows RPC (request/reply) clients with a design similar to that demonstrated in tutorial 6 (https://www.rabbitmq.com/direct-reply-to.html) to avoid declaring a response queue per request.

# Example

```ts
import { RpcClient, RpcConsumer, RpcConsumerOptions } from 'amq.rabbitmq.reply-to.js';

    Promise.resolve().then(() => {
      const consumerOptions = new RpcConsumerOptions(undefined, '',
        consumerCallback()
      );
      return RpcConsumer.Create(consumerOptions);
    }).then(() => {
      return RpcClient.Create();
    }).then((rpcClient: RpcClient) => {
      const promises = [];      

      for (let i = 1; i <= 20; i++) {
        const msg = new TestMessage(`${i}`, rpcClient.GetId(), i);
        promises.push(rpcClient.sendRPCMessage(msg.ToJson()));
      }

      return Promise.all(promises);
    }).then((data: any) => {      
      const replies: TestMessageReply[] = data;

      console.log('replies', replies);
      done();
    });
```