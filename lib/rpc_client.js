"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib_1 = require("amqplib");
const uuid_1 = require("uuid");
const events_1 = require("events");
const rpc_server_1 = require("./rpc_server");
const RPC_QUEUE = 'rpc_queue';
class RpcClientOptions {
    constructor(url = 'amqp://127.0.0.1', clientid = '') {
        this.url = url;
        this.clientid = clientid;
    }
}
exports.RpcClientOptions = RpcClientOptions;
class RpcClient {
    constructor(options) {
        this.options = options;
        if (this.options.clientid === '') {
            this.options.clientid = `${RpcClient.idCounter++}`;
        }
    }
    static Create(options = new RpcClientOptions()) {
        const result = new RpcClient(options);
        return Promise.resolve().then(() => {
            return result.createClient();
        }).then(() => {
            return result;
        });
    }
    GetId() {
        return this.options.clientid;
    }
    Close() {
        return Promise.resolve().then(() => {
            if (this.connection) {
                return this.connection.close();
            }
            return Promise.resolve();
        });
    }
    createClient() {
        let conn;
        return Promise.resolve().then(() => {
            return amqplib_1.connect(this.options.url);
        }).then((connp) => {
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
    sendRPCMessage(message) {
        const correlationId = uuid_1.v4();
        return Promise.resolve().then(() => {
            this.channel.sendToQueue(rpc_server_1.RpcServerOptions.RPC_QUEUE, new Buffer(message), { correlationId, replyTo: RpcClient.REPLY_QUEUE });
            return new Promise((resolve) => {
                this.responseEmitter.once(correlationId, resolve);
            });
        }).then((data) => {
            if (data) {
                return data.toString();
            }
            return '';
        });
    }
}
RpcClient.REPLY_QUEUE = 'amq.rabbitmq.reply-to';
RpcClient.idCounter = 0;
exports.RpcClient = RpcClient;
