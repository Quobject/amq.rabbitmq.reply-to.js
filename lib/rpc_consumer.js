"use strict";
//https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/javascript-nodejs/src/rpc_server.js
Object.defineProperty(exports, "__esModule", { value: true });
const amqp = require("amqplib");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const RPC_QUEUE = 'rpc_queue';
class RpcConsumer {
    //https://github.com/squaremo/amqp.node/blob/master/examples/tutorials/rpc_client.js
    call() {
        const self = this;
        let channel;
        return Promise.resolve().then(() => {
            console.log('QsMessageQueue about to connect');
            if (this.conn) {
                return this.conn;
            }
            //self.logger.info('QsMessageQueue about to connect 2');
            return amqp.connect('amqp://localhost');
        }).then((connp) => {
            //console.log('QsMessageQueue connp =' + util.inspect(connp));
            self.conn = connp;
            return self.conn.createChannel();
        }).then((ch) => {
            ch.assertQueue(RPC_QUEUE, { durable: false });
            ch.prefetch(1);
            console.log(' [x] Awaiting RPC requests');
            ch.consume(RPC_QUEUE, (msg) => {
                const n = parseInt(msg.content.toString(), 10);
                console.log(' [.] fib(%d)', n);
                const r = fibonacci(n);
                Promise.resolve().then(() => {
                    console.log(' [.] fib(%d) 1', n);
                    return rxjs_1.of().pipe(operators_1.delay(1)).toPromise();
                }).then((data) => {
                    console.log(' [.] fib(%d) 2', n);
                    ch.sendToQueue(msg.properties.replyTo, new Buffer(r.toString()), { correlationId: msg.properties.correlationId });
                    ch.ack(msg);
                });
            });
        });
    }
}
exports.RpcConsumer = RpcConsumer;
function fibonacci(n) {
    if (n === 0 || n === 1) {
        return n;
    }
    return fibonacci(n - 1) + fibonacci(n - 2);
}
