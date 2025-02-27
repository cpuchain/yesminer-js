import { Worker as NWorker } from 'worker_threads';
import { Work, WorkerParams, AllMsg } from './find';
import { WebSocketPool } from './websocket';
export declare function mine(miner: Miner, work: WorkerParams): Promise<void>;
export declare function stop(miner: Miner): Promise<void>;
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
