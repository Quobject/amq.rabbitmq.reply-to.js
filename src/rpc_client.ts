import * as util from 'util';
import { Channel, connect, Connection, Message } from 'amqplib';
import { v4 as uuid } from 'uuid';
import { EventEmitter } from 'events';
import { RpcServerOptions } from './rpc_server';

const RPC_QUEUE = 'rpc_queue';

export class RpcClientOptions {

  public constructor(public url = 'amqp://127.0.0.1', public clientid = '') { }
}

export class RpcClient {
  private static readonly REPLY_QUEUE = 'amq.rabbitmq.reply-to';
  private static idCounter = 0;  
  private connection!: Connection;

  private constructor(private options: RpcClientOptions) {
    if (this.options.clientid === '') {
      this.options.clientid = `${RpcClient.idCounter++}`;
    }
  }

  private channel!: Channel;
  private responseEmitter!: EventEmitter;

  public static Create(options: RpcClientOptions = new RpcClientOptions()): Promise<RpcClient> {
    const result = new RpcClient(options);  
    
    return Promise.resolve().then(() => {
      return result.createClient()
    }).then(() => {
      return result;
    });
  }

  public GetId(): string {
    return this.options.clientid;
  }

  public Close(): Promise<void> {
    return Promise.resolve().then(() => {
      if (this.connection) {
        return this.connection.close();
      }
      return Promise.resolve();
    });
  }

  private createClient(): Promise<void> {
    let conn!: Connection;

    return Promise.resolve().then(() => {
      return connect(this.options.url);
    }).then((connp: Connection) => {
      conn = connp;
      return conn.createChannel();
    }).then((ch: Channel) => {
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

  public sendRPCMessage(message: string): Promise<string> {
    const correlationId = uuid();

    return Promise.resolve().then(() => {
      this.channel.sendToQueue(RpcServerOptions.RPC_QUEUE, new Buffer(message), { correlationId, replyTo: RpcClient.REPLY_QUEUE });
      return new Promise((resolve) => {
        this.responseEmitter.once(correlationId, resolve);
      });
    }).then((data: any) => {
      if (data) {
        return data.toString();
      }
      return '';
    });
  }
}
