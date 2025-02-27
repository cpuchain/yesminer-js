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
