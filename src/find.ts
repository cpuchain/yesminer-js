import { Yespower, bytesToHex, hexToBytes } from 'yespower-wasm';
import { randomNonce, setLength, concatBytes, bytesReverse } from './utils.js';

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

export async function findNonce(
    work: Work,
    reportOn = 100,
    workerId?: number,
    algoPers?: string,
    isWorker?: boolean,
    msgSend?: msgSend,
) {
    const yespower = await Yespower.init();

    let timeStart = Date.now();
    let nonce = randomNonce();
    let i = 0;

    const blockTarget = work.blockTarget?.startsWith('0x') ? BigInt(work.blockTarget) : 0n;
    const target = BigInt(work.target);
    const header = hexToBytes(work.header);

    while (true) {
        const nonceBytes = setLength(hexToBytes(nonce.toString(16)), 8, false);
        const concatted = concatBytes(header, bytesReverse(nonceBytes));
        const result = BigInt(bytesToHex(yespower.Hash(concatted, undefined, undefined, algoPers)));
        const blockFound = blockTarget > result;

        // send found nonce
        if (target > result) {
            const found = {
                nonce: bytesToHex(nonceBytes),
                header: work.header,
                blockNumber: work.blockNumber,
                blockFound,
            };

            if (msgSend) {
                msgSend({
                    type: 'nonce',
                    workerId,
                    ...found,
                } as WorkerMsg);
            }

            if (!isWorker) {
                return found;
            }
        }

        // report hashrate
        if (i && i % reportOn === 0) {
            const timeTook = Date.now() - timeStart;
            const hashrate = Math.floor((1000 * reportOn) / timeTook);

            if (msgSend) {
                msgSend({
                    type: 'hashrate',
                    workerId,
                    hashrate,
                } as WorkerMsg);
            }

            timeStart = Date.now();
        }

        i++;
        nonce++;
    }
}
