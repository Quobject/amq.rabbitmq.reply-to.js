//https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/javascript-nodejs/src/rpc_server.js

import * as util from 'util';
import { Channel, connect, Connection, Message } from 'amqplib';



export class RpcServerOptions {
  public static RPC_QUEUE = 'rpc_queue';

  public constructor(public url = 'amqp://127.0.0.1', public serverid = '',
    public callback: (a: string, b: RpcServer) => Promise<string> = (a: string, b: RpcServer) => Promise.resolve(a)) { }

}

export class RpcServer {

  private constructor(private options: RpcServerOptions) {
    if (this.options.serverid === '') {
      this.options.serverid = `${RpcServer.idCounter++}`;
    }
  }

  private static idCounter = 0; 
  private connection!: Connection;

  public static Create(options: RpcServerOptions = new RpcServerOptions()): Promise<RpcServer> {
    const result = new RpcServer(options);

    return Promise.resolve().then(() => {
      return result.Startconsuming();
    }).then(() => {
      return result;
    });
  }

  public GetId(): string {
    return this.options.serverid;
  }

  public Close(): Promise<void> {
    return Promise.resolve().then(() => {
      if (this.connection) {
        return this.connection.close();
      }
      return Promise.resolve();
    });
  }

  private Startconsuming(): Promise<void> {
    let channel: Channel;

    return Promise.resolve().then(() => {

      if (this.connection) {
        return this.connection;
      }

      return connect(this.options.url);
    }).then((connp: Connection) => {
      this.connection = connp;
      return this.connection.createChannel();
    }).then((ch: Channel) => {

      ch.assertQueue(RpcServerOptions.RPC_QUEUE, { durable: false });
      ch.prefetch(1);
      ch.consume(RpcServerOptions.RPC_QUEUE, (msg: Message | null) => {
        if (msg === null) {
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
