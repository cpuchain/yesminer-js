import { webcrypto as crypto } from 'crypto';
import { bytesToHex } from 'yespower-wasm';

export interface JsonRpcReq {
    id: number;
    jsonrpc: string;
    method: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: any[];
    worker?: string;
}

export interface JsonRpcResp {
    id: number;
    jsonrpc: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result?: any;
    // for ws subscriptions from node
    method?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error?: any;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isNode = !((process as any)?.browser && window);

export const ZeroHash = '0x0000000000000000000000000000000000000000000000000000000000000000';

export function toDiff(target: string) {
    return 2n ** 256n / BigInt(target);
}

export function concatBytes(...arrays: Uint8Array[]) {
    if (arrays.length === 1) return arrays[0];
    const length = arrays.reduce((a, arr) => a + arr.length, 0);
    const result = new Uint8Array(length);
    for (let i = 0, pad = 0; i < arrays.length; i++) {
        const arr = arrays[i];
        result.set(arr, pad);
        pad += arr.length;
    }
    return result;
}

export function setLength(msg: Uint8Array, length: number, right = false) {
    if (right) {
        if (msg.length < length) {
            return new Uint8Array([...msg, ...new Uint8Array(length - msg.length)]);
        }
        return msg.subarray(0, length);
    } else {
        if (msg.length < length) {
            return new Uint8Array([...new Uint8Array(length - msg.length), ...msg]);
        }
        return msg.subarray(-length);
    }
}

export function randomNonce() {
    return BigInt(bytesToHex(crypto.getRandomValues(new Uint8Array(63))));
}

export function bytesReverse(a: Uint8Array) {
    const length = a.length;
    const b = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        b[i] = a[length - i - 1];
    }
    return b;
}
