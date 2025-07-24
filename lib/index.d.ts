import { EventEmitter } from 'eventemitter3';
import WebSocket$1 from 'isomorphic-ws';
import { Worker as NWorker } from 'worker_threads';

export interface Work {
	header: string;
	blockTarget?: string;
	target: string;
	blockNumber: string;
}
export interface WorkerParams extends Work {
	reportOn?: number;
	workerId?: number;
	algoPers?: string;
}
export interface NewWorkMsg extends Work {
	type: string;
}
export interface HashrateMsg {
	type: string;
	workerId?: number;
	hashrate: number;
	allHashrate?: number;
}
export interface NonceMsg {
	type: string;
	workerId?: number;
	nonce: string;
	header: string;
	blockNumber: string;
	blockFound: boolean;
}
export interface StringMsg {
	type: string;
	level?: string;
	msg: string;
}
export type AllMsg = StringMsg | NewWorkMsg | HashrateMsg | NonceMsg;
export type WorkerMsg = HashrateMsg | NonceMsg;
export type msgSend = (msg: WorkerMsg) => void;
export declare function findNonce(work: Work, reportOn?: number, workerId?: number, algoPers?: string, isWorker?: boolean, msgSend?: msgSend): Promise<{
	nonce: string;
	header: string;
	blockNumber: string;
	blockFound: boolean;
}>;
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
export declare class WebSocketPool extends EventEmitter {
	url: string;
	login?: string;
	worker?: string;
	reconnect: number;
	onMessage?: (msg: AllMsg) => void;
	ws: WebSocket$1;
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
export declare function mine(miner: Miner, work: WorkerParams): Promise<void>;
declare function stop$1(miner: Miner): Promise<void>;
export interface MinerParams {
	workerFile: string;
	threads: number;
	pool: WebSocketPool;
	algoPers?: string;
	onMessage?: (msg: AllMsg) => void;
}
export declare class Miner {
	workerFile: string;
	threads: number;
	pool: WebSocketPool;
	algoPers?: string;
	onMessage?: (msg: AllMsg) => void;
	workers: (NWorker | Worker)[];
	hashrates: Record<number, number>;
	prevWork: string;
	constructor({ workerFile, threads, pool, algoPers, onMessage }: MinerParams);
	stop(): Promise<void>;
	start(): Promise<void>;
	mine(work: Work): Promise<void>;
}
export interface JsonRpcReq {
	id: number;
	jsonrpc: string;
	method: string;
	params: any[];
	worker?: string;
}
export interface JsonRpcResp {
	id: number;
	jsonrpc: string;
	result?: any;
	method?: string;
	params?: any;
	error?: any;
}
export declare const isNode: boolean;
export declare const ZeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000";
export declare function toDiff(target: string): bigint;
export declare function concatBytes(...arrays: Uint8Array[]): Uint8Array<ArrayBufferLike>;
export declare function setLength(msg: Uint8Array, length: number, right?: boolean): Uint8Array<ArrayBufferLike>;
export declare function randomNonce(): bigint;
export declare function bytesReverse(a: Uint8Array): Uint8Array<ArrayBuffer>;

export {
	stop$1 as stop,
};

export {};
