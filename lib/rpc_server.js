"use strict";
//https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/javascript-nodejs/src/rpc_server.js
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib_1 = require("amqplib");
class RpcServerOptions {
    constructor(url = 'amqp://127.0.0.1', serverid = '', callback = (a, b) => Promise.resolve(a)) {
        this.url = url;
        this.serverid = serverid;
        this.callback = callback;
    }
}
RpcServerOptions.RPC_QUEUE = 'rpc_queue';
exports.RpcServerOptions = RpcServerOptions;
class RpcServer {
    constructor(options) {
        this.options = options;
        if (this.options.serverid === '') {
            this.options.serverid = `${RpcServer.idCounter++}`;
        }
    }
    static Create(options = new RpcServerOptions()) {
        const result = new RpcServer(options);
        return Promise.resolve().then(() => {
            return result.Startconsuming();
        }).then(() => {
            return result;
        });
    }
    GetId() {
        return this.options.serverid;
    }
    Close() {
        return Promise.resolve().then(() => {
            if (this.connection) {
                return this.connection.close();
            }
            return Promise.resolve();
        });
    }
    Startconsuming() {
        let channel;
        return Promise.resolve().then(() => {
            if (this.connection) {
                return this.connection;
            }
            return amqplib_1.connect(this.options.url);
        }).then((connp) => {
            this.connection = connp;
            return this.connection.createChannel();
        }).then((ch) => {
            ch.assertQueue(RpcServerOptions.RPC_QUEUE, { durable: false });
            ch.prefetch(1);
            ch.consume(RpcServerOptions.RPC_QUEUE, (msg) => {
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
RpcServer.idCounter = 0;
exports.RpcServer = RpcServer;
