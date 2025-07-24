import { getRollupConfig } from '@cpuchain/rollup';

const config = [
    getRollupConfig({ input: './src/index.ts' }),
    getRollupConfig({
        input: './src/node.ts',
        external: [],
    }),
    getRollupConfig({
        input: './src/worker.ts',
        external: [],
    }),
]

export default config;