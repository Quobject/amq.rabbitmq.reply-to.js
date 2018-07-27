//https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/javascript-nodejs/src/rpc_server.js

import * as util from 'util';
import { Channel, connect, Connection, Message } from 'amqplib';


const RPC_QUEUE = 'rpc_queue';

export class RpcConsumerOptions {

  public constructor(public url = 'amqp://127.0.0.1', public consumerid = '',
    public callback: (a: string, b: RpcConsumer) => Promise<string> = (a: string, b: RpcConsumer) => Promise.resolve(a)) { }

}

export class RpcConsumer {

  private constructor(private options: RpcConsumerOptions) {
    //console.log('RpcConsumerOptions options = ', options);
    
    if (this.options.consumerid === '') {
      this.options.consumerid = `${RpcConsumer.idCounter++}`;
    }
  }

  private static readonly DISPLAY_STRING = 'xxxxxxxxx >----> RpcConsumer';
  private static idCounter = 0; 
  private conn!: Connection;

  public static Create(options: RpcConsumerOptions = new RpcConsumerOptions()): Promise<RpcConsumer> {
    const result = new RpcConsumer(options);

    return Promise.resolve().then(() => {
      return result.startconsuming();
    }).then(() => {
      return result;
    });
  }

  public GetId(): string {
    return this.options.consumerid;
  }

  //https://github.com/squaremo/amqp.node/blob/master/examples/tutorials/rpc_client.js
  public startconsuming(): Promise<void> {
    const self = this;
    let channel: Channel;

    return Promise.resolve().then(() => {
      //console.log(`${RpcConsumer.DISPLAY_STRING} (${this.GetId()}) about to connect`);

      if (this.conn) {
        return this.conn;
      }

      return connect(this.options.url);
    }).then((connp: Connection) => {
      //console.log(`${RpcConsumer.DISPLAY_STRING} (${this.GetId()}) connected`);
      self.conn = connp;
      return self.conn.createChannel();
    }).then((ch: Channel) => {

      ch.assertQueue(RPC_QUEUE, { durable: false });
      ch.prefetch(1);
      //console.log(`${RpcConsumer.DISPLAY_STRING} (${this.GetId()}) Awaiting RPC requests`);
      ch.consume(RPC_QUEUE, (msg: Message | null) => {
        if (msg === null) {
          //console.log(`${RpcConsumer.DISPLAY_STRING} (${this.GetId()}) msg === null`);
          return;
        }

        Promise.resolve().then(() => {   
          return this.options.callback(msg.content.toString(), this);
        }).then((data: any) => {
          ch.sendToQueue(msg.properties.replyTo,
            new Buffer(data),
            { correlationId: msg.properties.correlationId });

          ch.ack(msg);
        });
      });
    });
  }

}
