import WebSocket from 'isomorphic-ws';
import { EventEmitter } from 'eventemitter3';
import { AllMsg, Work } from './find.js';
import { JsonRpcReq, JsonRpcResp, ZeroHash } from './utils.js';

export interface WSQueue {
    id: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolve: (msg: any) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reject: (err: any) => void;
    timeout?: NodeJS.Timeout;
    isResolved: boolean;
    lastHead?: string;
}

export function sendWS<T>(
    pool: WebSocketPool,
    method: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params?: any,
    worker?: string,
    lastHead?: string,
): Promise<T> {
    const id = Number(pool.id);

    return new Promise((resolve, reject) => {
        const msg = JSON.stringify({
            id,
            jsonrpc: '2.0',
            method,
            params,
            worker,
        } as JsonRpcReq);

        const queue = {
            id,
            resolve,
            reject,
            isResolved: false,
            lastHead,
        } as WSQueue;

        // should solve on reconnection when the expected message is never received
        queue.timeout = setTimeout(() => {
            if (!queue.isResolved) {
                queue.reject(new Error('Request timeout'));
                queue.isResolved = true;
            }
        }, 20000);

        pool.queue.push(queue);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pool.ws.send(msg, (err: any) => {
            if (err) {
                reject(err);
            }
        });

        pool.id++;
    });
}

export function listenWS(pool: WebSocketPool): Promise<boolean> {
    return new Promise((resolve, reject) => {
        pool.ws.onclose = () => {
            pool.log(`Websocket closed, reconnecting on ${pool.reconnect} ms`, 'error');

            setTimeout(() => {
                pool.ws = new WebSocket(pool.url);
                listenWS(pool);
            }, pool.reconnect);
        };

        pool.ws.onerror = () => {
            pool.log('Websocket encountered error, reconnecting it', 'error');
            pool.ws.close();
        };

        pool.ws.onopen = () => {
            pool.submitLogin()
                .then((r) => {
                    if (!r) {
                        reject(new Error('Pool returned invalid connection boolean'));
                    } else {
                        if (pool.login) {
                            pool.log(`Connected to pool ${pool.url}: ${pool.login}/${pool.worker}`);
                        } else {
                            pool.log(`Connected to node ${pool.url}`);
                        }
                        resolve(r);
                    }
                })
                .catch((e) => reject(e));
        };

        pool.ws.onmessage = (d) => {
            try {
                const data = (d?.data ? JSON.parse(d.data as unknown as string) : null) as JsonRpcResp | null;

                if (!data) {
                    throw new Error('Invalid data');
                }

                // local node
                if (data.method === 'eth_subscription') {
                    pool.getWork().then((w) => pool.emit('work', w));
                    return;
                }

                if (data.id === 0 && data.result?.length > 2) {
                    pool.emit('work', {
                        header: data.result[0],
                        blockTarget: data.result[1],
                        target: data.result[2],
                        blockNumber: data.result[3],
                    } as Work);
                    return;
                }

                const msg = pool.queue.find((q) => q.id === data.id);

                if (!msg) {
                    return;
                }

                // Refresh head if it differs (only applies for local node mining)
                if (msg.lastHead && msg.lastHead !== data.result.hash) {
                    pool.getWork().then((w) => pool.emit('work', w));
                }

                if (data.error) {
                    msg.reject(data.error);
                } else {
                    msg.resolve(data.result);
                }

                msg.isResolved = true;

                pool.queue = pool.queue.filter((q) => !q.isResolved);

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                pool.log(
                    `Caught error while handing incoming message from pool ${pool.url}, reconnecting: ${err.stack || err.message}`,
                    'error',
                );
                console.log(err);
                pool.ws.close();
            }
        };
    });
}

export interface WebSocketPoolOptions {
    url: string;
    login?: string;
    worker?: string;
    reconnect?: number;
    onMessage?: (msg: AllMsg) => void;
}

export class WebSocketPool extends EventEmitter {
    url: string;
    login?: string;
    worker?: string;
    reconnect: number;
    onMessage?: (msg: AllMsg) => void;

    ws: WebSocket;
    connected: Promise<boolean>;
    id: number;
    queue: WSQueue[];

    constructor({ url, login, worker, reconnect, onMessage }: WebSocketPoolOptions) {
        super();

        this.url = url;
        this.login = login;
        this.worker = worker;
        this.reconnect = reconnect || 500;
        this.onMessage = onMessage;

        this.ws = new WebSocket(url);
        this.id = 1;
        this.queue = [];

        this.connected = listenWS(this);
    }

    log(msg: string, level?: string) {
        if (this.onMessage) {
            this.onMessage({
                type: 'websocket',
                level,
                msg,
            });
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    send<T>(method: string, params?: any[], worker?: string, lastHead?: string) {
        return sendWS<T>(this, method, params, worker, lastHead);
    }

    async submitLogin(): Promise<boolean> {
        // local node (subscribe for block)
        if (!this.login) {
            const blockNum = await this.send<string>('eth_subscribe', ['newHeads']);
            if (blockNum?.startsWith('0x')) {
                return true;
            } else {
                return false;
            }
        }
        // pool
        return this.send<boolean>('eth_submitLogin', [this.login], this.worker);
    }

    async getWork(): Promise<Work> {
        await this.connected;
        const result = await this.send<string[]>('eth_getWork');
        return {
            header: result[0],
            blockTarget: result[1],
            target: result[2],
            blockNumber: result[3],
        } as Work;
    }

    async submitWork(nonce: string, header: string) {
        await this.connected;
        const valid = await this.send<boolean>('eth_submitWork', [nonce, header, ZeroHash], this.worker);
        // force refresh of head for local node (eth_subscribe is not returned sometimes)
        if (!this.login) {
            await this.send<{ hash: string }>('eth_getBlockByNumber', ['latest', false], undefined, header);
        }
        return valid;
    }
}
