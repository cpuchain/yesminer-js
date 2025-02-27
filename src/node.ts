import os from 'os';
import path from 'path';
import { Command, InvalidArgumentError } from 'commander';
import { factory } from '@cpuchain/logger';
import { name, description, version } from '../package.json';
import { Miner } from './miner';
import { WebSocketPool } from './websocket';
import { NewWorkMsg, NonceMsg, HashrateMsg, AllMsg, StringMsg } from './find';
import { toDiff } from './utils';

const workerFile = path.join(__dirname, '../lib/worker.js');

let allHashrate = 0;

function onMessage(msg: AllMsg) {
    const logger = factory({});

    if (msg.type === 'newWork') {
        const { blockNumber, target } = msg as NewWorkMsg;

        logger.debug('WORK', `block: ${Number(blockNumber)} diff: ${toDiff(target)}`);
    } else if (msg.type === 'nonce') {
        const { nonce, blockNumber, blockFound } = msg as NonceMsg;

        if (blockFound) {
            logger.debug('MINED', `block: ${Number(blockNumber)} nonce: ${nonce}`);
        } else {
            logger.debug('FOUND', `block: ${Number(blockNumber)} solution: ${nonce}`);
        }
    } else if (msg.type === 'hashrate') {
        if ((msg as HashrateMsg).allHashrate) {
            allHashrate = (msg as HashrateMsg).allHashrate as number;
        }
    } else if ((msg as StringMsg).msg) {
        const { type, level, msg: strMsg } = msg as StringMsg;

        if (level === 'error') {
            logger.error(type.toUpperCase(), strMsg);
        } else {
            logger.debug(type.toUpperCase(), strMsg);
        }
    }
}

function parseUrl(urlStr: string) {
    try {
        const url = new URL(urlStr);
        if (url.protocol !== 'ws:' && url.protocol !== 'wss:') {
            throw new Error('Not valid');
        }
        return urlStr;
    } catch {
        throw new InvalidArgumentError('Not valid WebSocket URL');
    }
}

function parseWallet(walletStr: string) {
    if (!/(0x[a-fA-F0-9]{40})/g.exec(walletStr) || !BigInt(walletStr)) {
        throw new InvalidArgumentError('Not valid wallet address');
    }

    return walletStr;
}

interface Options {
    url?: string;
    login?: string;
    worker?: string;
    threads?: string;
    algoPers?: string;
}

const program = new Command();

program
    .name(name)
    .version(version)
    .description(description)
    .option(
        '-u, --url <URL>',
        'Pool / Node WebSocket URL ( that starts with either wss:// or ws:// )',
        parseUrl,
    )
    .option('-l, --login <LOGIN>', 'Wallet address to receive coins when you mine at pool', parseWallet)
    .option('-w, --worker <WORKER>', 'Worker ID to report on pool (optional)')
    .option('-t, --threads <THREADS>', 'CPU threads to mine ( will use all available cores if not specified)')
    .option('--algo-pers <ALGO_PERS>', 'Pers for custom Yespower chain (optional)')
    .action(async (options: Options) => {
        const logger = factory({});

        const { url: poolUrl, login, worker, threads: rawThreads, algoPers } = options;

        const url = poolUrl || 'ws://127.0.0.1:8546';
        const threads = Number(rawThreads || os.cpus().length);

        logger.debug('CONFIG', JSON.stringify({ url, login, worker, threads, algoPers }, null, 2));

        const pool = new WebSocketPool({
            url,
            login,
            worker,
            onMessage,
        });

        const miner = new Miner({
            workerFile,
            threads,
            pool,
            algoPers,
            onMessage,
        });

        await miner.start();

        setInterval(() => {
            if (allHashrate) {
                logger.debug('HASHRATE', `${allHashrate}H/s`);
            }
        }, 10000);
    });

program.parseAsync();
