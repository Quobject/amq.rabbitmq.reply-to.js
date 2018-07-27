//https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/javascript-nodejs/src/rpc_server.js

import * as util from 'util';
import { Channel, connect, Connection, Message } from 'amqplib';
//import { v4 as uuid } from 'uuid';
import * as Rx from 'rxjs/Rx';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

const RPC_QUEUE = 'rpc_queue';

export class RpcConsumer {

  constructor(private id: string = '0') {

  }

  private static readonly DISPLAY_STRING = 'xxxxxxxxx >----> RpcConsumer ';
  private conn!: Connection;



  //https://github.com/squaremo/amqp.node/blob/master/examples/tutorials/rpc_client.js
  public call(): Promise<any> {
    const self = this;
    let channel: Channel;

    return Promise.resolve().then(() => {
      console.log(`${RpcConsumer.DISPLAY_STRING} (${this.id}) about to connect`);

      if (this.conn) {
        return this.conn;
      }
      //self.logger.info('QsMessageQueue about to connect 2');

      return connect('amqp://127.0.0.1');
    }).then( (connp: any) => {
      //console.log('QsMessageQueue connp =' + util.inspect(connp));
      self.conn = connp;
      return self.conn.createChannel();
    }).then((ch: Channel) => {

      ch.assertQueue(RPC_QUEUE, { durable: false });
      ch.prefetch(1);
      console.log(`${RpcConsumer.DISPLAY_STRING} (${this.id}) Awaiting RPC requests`);
      ch.consume(RPC_QUEUE, (msg: Message | null) => {
        const n = parseInt(msg.content.toString(), 10);

        console.log(`${RpcConsumer.DISPLAY_STRING} (${this.id}) got message "${msg.content}"`);

        const r = 'todo';

        Promise.resolve().then(() => {
          return of().pipe(delay(1)).toPromise();
        }).then((data: any) => {
          ch.sendToQueue(msg.properties.replyTo,
            new Buffer(r.toString()),
            { correlationId: msg.properties.correlationId });

          ch.ack(msg);
        });
      });
    });
  }

}
