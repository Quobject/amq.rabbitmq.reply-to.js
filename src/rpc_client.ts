import * as util from 'util';
import { Channel, connect, Connection, Message } from 'amqplib';
import { v4 as uuid } from 'uuid';
import { EventEmitter } from 'events';

const RPC_QUEUE = 'rpc_queue';

export class RpcClientOptions {

  public constructor(public url = 'amqp://127.0.0.1', public clientid = '') { }
}


export class RpcClient {
  private static readonly DISPLAY_STRING = 'RpcClient >----> xxxxxxxxxxx';
  private static readonly REPLY_QUEUE = 'amq.rabbitmq.reply-to';
  private static idCounter = 0;  

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

  private createClient(): Promise<void> {
    let conn!: Connection;

    return Promise.resolve().then(() => {
      //console.log(`${RpcClient.DISPLAY_STRING} (${this.id}) about to connect`);

      return connect(this.options.url);
    }).then((connp: Connection) => {
      //console.log('QsMessageQueue connp =' + util.inspect(connp));
      //console.log(`${RpcClient.DISPLAY_STRING} (${this.GetId()}) connected`);
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






