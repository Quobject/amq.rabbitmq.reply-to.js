"use strict";
//https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/javascript-nodejs/src/rpc_server.js
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib_1 = require("amqplib");
const RPC_QUEUE = 'rpc_queue';
class RpcConsumerOptions {
    constructor(url = 'amqp://127.0.0.1', consumerid = '', callback = (a, b) => Promise.resolve(a)) {
        this.url = url;
        this.consumerid = consumerid;
        this.callback = callback;
    }
}
exports.RpcConsumerOptions = RpcConsumerOptions;
class RpcConsumer {
    constructor(options) {
        this.options = options;
        if (this.options.consumerid === '') {
            this.options.consumerid = `${RpcConsumer.idCounter++}`;
        }
    }
    static Create(options = new RpcConsumerOptions()) {
        const result = new RpcConsumer(options);
        return Promise.resolve().then(() => {
            return result.startconsuming();
        }).then(() => {
            return result;
        });
    }
    GetId() {
        return this.options.consumerid;
    }
    startconsuming() {
        let channel;
        return Promise.resolve().then(() => {
            if (this.conn) {
                return this.conn;
            }
            return amqplib_1.connect(this.options.url);
        }).then((connp) => {
            this.conn = connp;
            return this.conn.createChannel();
        }).then((ch) => {
            ch.assertQueue(RPC_QUEUE, { durable: false });
            ch.prefetch(1);
            ch.consume(RPC_QUEUE, (msg) => {
                if (msg === null) {
                    return;
                }
                Promise.resolve().then(() => {
                    return this.options.callback(msg.content.toString(), this);
                }).then((data) => {
                    ch.sendToQueue(msg.properties.replyTo, new Buffer(data), { correlationId: msg.properties.correlationId });
                    ch.ack(msg);
                });
            });
        });
    }
}
RpcConsumer.idCounter = 0;
exports.RpcConsumer = RpcConsumer;
