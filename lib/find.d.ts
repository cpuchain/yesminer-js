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
type msgSend = (msg: WorkerMsg) => void;
export declare function findNonce(work: Work, reportOn?: number, workerId?: number, algoPers?: string, isWorker?: boolean, msgSend?: msgSend): Promise<{
    nonce: string;
    header: string;
    blockNumber: string;
    blockFound: boolean;
}>;
export {};
