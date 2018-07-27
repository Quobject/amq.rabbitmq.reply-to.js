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
        //console.log('RpcConsumerOptions options = ', options);
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
    //https://github.com/squaremo/amqp.node/blob/master/examples/tutorials/rpc_client.js
    startconsuming() {
        const self = this;
        let channel;
        return Promise.resolve().then(() => {
            //console.log(`${RpcConsumer.DISPLAY_STRING} (${this.GetId()}) about to connect`);
            if (this.conn) {
                return this.conn;
            }
            return amqplib_1.connect(this.options.url);
        }).then((connp) => {
            //console.log(`${RpcConsumer.DISPLAY_STRING} (${this.GetId()}) connected`);
            self.conn = connp;
            return self.conn.createChannel();
        }).then((ch) => {
            ch.assertQueue(RPC_QUEUE, { durable: false });
            ch.prefetch(1);
            //console.log(`${RpcConsumer.DISPLAY_STRING} (${this.GetId()}) Awaiting RPC requests`);
            ch.consume(RPC_QUEUE, (msg) => {
                if (msg === null) {
                    //console.log(`${RpcConsumer.DISPLAY_STRING} (${this.GetId()}) msg === null`);
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
RpcConsumer.DISPLAY_STRING = 'xxxxxxxxx >----> RpcConsumer';
RpcConsumer.idCounter = 0;
exports.RpcConsumer = RpcConsumer;
