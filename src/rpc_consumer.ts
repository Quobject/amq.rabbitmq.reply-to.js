//https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/javascript-nodejs/src/rpc_server.js

import * as util from 'util';
import * as amqp from 'amqplib';
import { v4 as uuid } from 'uuid';
import * as Rx from 'rxjs/Rx';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

const RPC_QUEUE = 'rpc_queue';

export class RpcConsumer {
  private conn!: amqp.Connection;

  //https://github.com/squaremo/amqp.node/blob/master/examples/tutorials/rpc_client.js
  public call(): Promise<any> {
    const self = this;
    let channel: amqp.Channel;

    return Promise.resolve().then(() => {
      console.log('QsMessageQueue about to connect');

      if (this.conn) {
        return this.conn;
      }
      //self.logger.info('QsMessageQueue about to connect 2');

      return amqp.connect('amqp://localhost');
    }).then( (connp: any) => {
      //console.log('QsMessageQueue connp =' + util.inspect(connp));
      self.conn = connp;
      return self.conn.createChannel();
    }).then((ch: amqp.Channel) => {

      ch.assertQueue(RPC_QUEUE, { durable: false });
      ch.prefetch(1);
      console.log(' [x] Awaiting RPC requests');
      ch.consume(RPC_QUEUE, (msg: any) => {
        const n = parseInt(msg.content.toString(), 10);

        console.log(' [.] fib(%d)', n);

        const r = fibonacci(n);

        Promise.resolve().then(() => {
          console.log(' [.] fib(%d) 1', n);
          return of().pipe(delay(1)).toPromise();
        }).then((data: any) => {
          console.log(' [.] fib(%d) 2', n);
          ch.sendToQueue(msg.properties.replyTo,
            new Buffer(r.toString()),
            { correlationId: msg.properties.correlationId });

          ch.ack(msg);
        });



      });
    });
  }

}






function fibonacci(n: number): number {
  if (n === 0 || n === 1) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
}
