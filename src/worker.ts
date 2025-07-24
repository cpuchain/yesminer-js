import worker from 'worker_threads';
import { isNode } from './utils.js';
import { WorkerParams, WorkerMsg, findNonce } from './find.js';

if (isNode) {
    nodeWorker();
} else {
    webWorker();
}

export async function nodeWorker() {
    const work = worker.workerData as WorkerParams;

    const msgSend = (msg: WorkerMsg) => {
        worker.parentPort?.postMessage(msg);
    };

    await findNonce(work, work.reportOn, work.workerId, work.algoPers, true, msgSend);
}

export function webWorker() {
    if (!addEventListener || !postMessage) {
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addEventListener('message', async (e: any) => {
        const data = e.data || e;

        const work = data as WorkerParams;

        const msgSend = (msg: WorkerMsg) => {
            postMessage(msg);
        };

        await findNonce(work, work.reportOn, work.workerId, work.algoPers, true, msgSend);
    });
}
