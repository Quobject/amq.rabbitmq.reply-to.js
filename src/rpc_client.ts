import * as util from 'util';
import * as amqp from 'amqplib';
import { v4 as uuid } from 'uuid';
import { EventEmitter } from 'events';

const RPC_QUEUE = 'rpc_queue';

export class RpcClient {
  private static readonly DISPLAY_STRING = 'RpcClient >----> xxxxxxxxxxx ';
  private static readonly REPLY_QUEUE = 'amq.rabbitmq.reply-to';
  private channel!: amqp.Channel;
  private responseEmitter!: EventEmitter;

  //public constructor() {}

  public createClient(): Promise<void> {
    let conn!: amqp.Connection;

    return Promise.resolve().then(() => {
      console.log('RpcClient createClient about to connect');


      //self.logger.info('QsMessageQueue about to connect 2');

      return amqp.connect('amqp://127.0.0.1');
    }).then((connp: any) => {
      //console.log('QsMessageQueue connp =' + util.inspect(connp));
      conn = connp;
      return conn.createChannel();
    }).then((ch: amqp.Channel) => {
      this.channel = ch;

      // create an event emitter where rpc responses will be published by correlationId
      // from https://github.com/squaremo/amqp.node/issues/259 Jul 4, 2016
      this.responseEmitter = new EventEmitter();
      this.responseEmitter.setMaxListeners(0);

      this.channel.consume(RpcClient.REPLY_QUEUE, (msg: any) => {
        this.responseEmitter.emit(msg.properties.correlationId, msg.content);
      }, { noAck: true });

    });
  }

  public sendRPCMessage(message: string, rpcQueue: string = 'rpc_queue'): Promise<string> {
    const correlationId = uuid();
    return Promise.resolve().then(() => {
      this.channel.sendToQueue(rpcQueue, new Buffer(message), { correlationId, replyTo: RpcClient.REPLY_QUEUE });
      return new Promise((resolve) => {
        this.responseEmitter.once(correlationId, resolve);
      });
    }).then((data: any) => {
      //console.log('RpcClient sendRPCMessage data', data);
      //console.log('RpcClient sendRPCMessage data.toString', data.toString());
      if (data) {
        return data.toString();
      }
      return '';
    });
  }



}






