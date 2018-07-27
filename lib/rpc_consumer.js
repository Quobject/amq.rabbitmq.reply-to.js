"use strict";
//https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/javascript-nodejs/src/rpc_server.js
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib_1 = require("amqplib");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const RPC_QUEUE = 'rpc_queue';
class RpcConsumer {
    constructor(id = '0') {
        this.id = id;
    }
    //https://github.com/squaremo/amqp.node/blob/master/examples/tutorials/rpc_client.js
    call() {
        const self = this;
        let channel;
        return Promise.resolve().then(() => {
            console.log(`${RpcConsumer.DISPLAY_STRING} (${this.id}) about to connect`);
            if (this.conn) {
                return this.conn;
            }
            //self.logger.info('QsMessageQueue about to connect 2');
            return amqplib_1.connect('amqp://127.0.0.1');
        }).then((connp) => {
            //console.log('QsMessageQueue connp =' + util.inspect(connp));
            self.conn = connp;
            return self.conn.createChannel();
        }).then((ch) => {
            ch.assertQueue(RPC_QUEUE, { durable: false });
            ch.prefetch(1);
            console.log(`${RpcConsumer.DISPLAY_STRING} (${this.id}) Awaiting RPC requests`);
            ch.consume(RPC_QUEUE, (msg) => {
                const n = parseInt(msg.content.toString(), 10);
                console.log(`${RpcConsumer.DISPLAY_STRING} (${this.id}) got message "${msg.content}"`);
                const r = 'todo';
                Promise.resolve().then(() => {
                    return rxjs_1.of().pipe(operators_1.delay(1)).toPromise();
                }).then((data) => {
                    ch.sendToQueue(msg.properties.replyTo, new Buffer(r.toString()), { correlationId: msg.properties.correlationId });
                    ch.ack(msg);
                });
            });
        });
    }
}
RpcConsumer.DISPLAY_STRING = 'xxxxxxxxx >----> RpcConsumer ';
exports.RpcConsumer = RpcConsumer;
