import WebSocket from 'isomorphic-ws';
import EventEmitter3 from 'eventemitter3';
import { AllMsg, Work } from './find';
export interface WSQueue {
    id: number;
    resolve: (msg: any) => void;
    reject: (err: any) => void;
    timeout?: NodeJS.Timeout;
    isResolved: boolean;
    lastHead?: string;
}
export declare function sendWS<T>(pool: WebSocketPool, method: string, params?: any, worker?: string, lastHead?: string): Promise<T>;
export declare function listenWS(pool: WebSocketPool): Promise<boolean>;
export interface WebSocketPoolOptions {
    url: string;
    login?: string;
    worker?: string;
    reconnect?: number;
    onMessage?: (msg: AllMsg) => void;
}
export declare class WebSocketPool extends EventEmitter3 {
    url: string;
    login?: string;
    worker?: string;
    reconnect: number;
    onMessage?: (msg: AllMsg) => void;
    ws: WebSocket;
    connected: Promise<boolean>;
    id: number;
    queue: WSQueue[];
    constructor({ url, login, worker, reconnect, onMessage }: WebSocketPoolOptions);
    log(msg: string, level?: string): void;
    send<T>(method: string, params?: any[], worker?: string, lastHead?: string): Promise<T>;
    submitLogin(): Promise<boolean>;
    getWork(): Promise<Work>;
    submitWork(nonce: string, header: string): Promise<boolean>;
}
