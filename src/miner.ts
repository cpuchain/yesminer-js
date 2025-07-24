import { Worker as NWorker } from 'worker_threads';
import { isNode } from './utils.js';
import { NonceMsg, Work, WorkerParams, WorkerMsg, HashrateMsg, AllMsg } from './find.js';
import { WebSocketPool } from './websocket.js';

export async function mine(miner: Miner, work: WorkerParams) {
    for (let i = 0; i < miner.threads; ++i) {
        if (isNode) {
            const worker = new NWorker(miner.workerFile, {
                workerData: {
                    ...work,
                    workerId: i,
                },
            });

            worker.on('message', async (msg: WorkerMsg) => {
                if (msg.type === 'nonce') {
                    const { nonce, header } = msg as NonceMsg;

                    miner.pool.submitWork(nonce, header);
                } else if (msg.type === 'hashrate') {
                    const { workerId, hashrate } = msg as HashrateMsg;

                    miner.hashrates[workerId as number] = hashrate;
                }

                if (miner.onMessage) {
                    const allHashrate =
                        msg.type === 'hashrate'
                            ? Object.values(miner.hashrates).reduce((acc, curr) => acc + curr, 0)
                            : undefined;

                    miner.onMessage({
                        ...msg,
                        allHashrate,
                    });
                }
            });

            worker.on('error', (e) => {
                console.log(`Error from ${i} worker, exiting`);
                console.log(e);
                worker.terminate();
            });

            await new Promise((resolve) => {
                worker.on('online', () => {
                    resolve(true);
                });
            });

            miner.workers.push(worker);
        } else {
            const worker = new Worker(miner.workerFile);

            worker.onmessage = (e: { data: WorkerMsg }) => {
                const msg = e.data;

                if (msg.type === 'nonce') {
                    const { nonce, header } = msg as NonceMsg;

                    miner.pool.submitWork(nonce, header);
                } else if (msg.type === 'hashrate') {
                    const { workerId, hashrate } = msg as HashrateMsg;

                    miner.hashrates[workerId as number] = hashrate;
                }

                if (miner.onMessage) {
                    const allHashrate =
                        msg.type === 'hashrate'
                            ? Object.values(miner.hashrates).reduce((acc, curr) => acc + curr, 0)
                            : undefined;

                    miner.onMessage({
                        ...msg,
                        allHashrate,
                    });
                }
            };

            worker.onerror = (e) => {
                console.log(`Error from ${i} worker, exiting`);
                console.log(e);
                worker.terminate();
            };

            worker.postMessage(work);
        }
    }
}

export async function stop(miner: Miner) {
    await Promise.all(
        miner.workers.map((worker: NWorker | Worker) => {
            return new Promise((resolve) => {
                if (isNode) {
                    (worker as NWorker).on('exit', () => {
                        resolve(true);
                    });

                    worker.terminate();
                } else {
                    worker.terminate();

                    resolve(true);
                }
            });
        }),
    );

    miner.workers.length = 0;
}

export interface MinerParams {
    workerFile: string;
    threads: number;
    pool: WebSocketPool;
    algoPers?: string;
    onMessage?: (msg: AllMsg) => void;
}

export class Miner {
    workerFile: string;
    threads: number;
    pool: WebSocketPool;
    algoPers?: string;
    onMessage?: (msg: AllMsg) => void;

    workers: (NWorker | Worker)[];
    hashrates: Record<number, number>;
    prevWork: string;

    constructor({ workerFile, threads, pool, algoPers, onMessage }: MinerParams) {
        this.workerFile = workerFile;
        this.threads = threads;
        this.pool = pool;
        this.algoPers = algoPers;
        this.onMessage = onMessage;

        this.workers = [];
        this.hashrates = {};
        this.prevWork = '';
    }

    stop() {
        return stop(this);
    }

    async start() {
        this.pool.on('work', (work) => {
            this.mine(work);
        });

        const work = await this.pool.getWork();

        return this.mine(work);
    }

    async mine(work: Work) {
        const newWork = JSON.stringify(work);

        if (this.prevWork === newWork) {
            return;
        }

        if (this.onMessage) {
            this.onMessage({
                type: 'newWork',
                ...work,
            });
        }

        await this.stop();
        await mine(this, {
            ...work,
            algoPers: this.algoPers,
        });

        this.prevWork = newWork;
    }
}
