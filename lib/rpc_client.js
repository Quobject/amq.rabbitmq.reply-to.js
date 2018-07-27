"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const amqp = require("amqplib");
const uuid_1 = require("uuid");
const events_1 = require("events");
const RPC_QUEUE = 'rpc_queue';
class RpcClient {
    //public constructor() {}
    createClient() {
        let conn;
        return Promise.resolve().then(() => {
            console.log('RpcClient createClient about to connect');
            //self.logger.info('QsMessageQueue about to connect 2');
            return amqp.connect('amqp://127.0.0.1');
        }).then((connp) => {
            //console.log('QsMessageQueue connp =' + util.inspect(connp));
            conn = connp;
            return conn.createChannel();
        }).then((ch) => {
            this.channel = ch;
            // create an event emitter where rpc responses will be published by correlationId
            // from https://github.com/squaremo/amqp.node/issues/259 Jul 4, 2016
            this.responseEmitter = new events_1.EventEmitter();
            this.responseEmitter.setMaxListeners(0);
            this.channel.consume(RpcClient.REPLY_QUEUE, (msg) => {
                this.responseEmitter.emit(msg.properties.correlationId, msg.content);
            }, { noAck: true });
        });
    }
    sendRPCMessage(message, rpcQueue = 'rpc_queue') {
        const correlationId = uuid_1.v4();
        return Promise.resolve().then(() => {
            this.channel.sendToQueue(rpcQueue, new Buffer(message), { correlationId, replyTo: RpcClient.REPLY_QUEUE });
            return new Promise((resolve) => {
                this.responseEmitter.once(correlationId, resolve);
            });
        }).then((data) => {
            //console.log('RpcClient sendRPCMessage data', data);
            //console.log('RpcClient sendRPCMessage data.toString', data.toString());
            if (data) {
                return data.toString();
            }
            return '';
        });
    }
}
RpcClient.DISPLAY_STRING = 'RpcClient >----> xxxxxxxxxxx ';
RpcClient.REPLY_QUEUE = 'amq.rabbitmq.reply-to';
exports.RpcClient = RpcClient;
