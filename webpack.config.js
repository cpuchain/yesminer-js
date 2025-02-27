const { BannerPlugin, ProvidePlugin } = require('webpack');
const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const rules = [
    {
        test: /\.ts?$/,
        loader: 'esbuild-loader',
        options: {
            loader: 'ts',
            target: 'ES2022',
        }
    }
]

const nodeConfig = {
    target: 'node',
    mode: 'production',
    module: { rules },
    entry: './src/index.ts',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, './lib'),
        libraryTarget: 'commonjs',
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    optimization: {
        minimize: false,
    },
};

const umdConfig = {
    mode: 'production',
    module: { rules },
    entry: './src/index.ts',
    output: {
        filename: 'index.umd.js',
        path: path.resolve(__dirname, './lib'),
        library: 'Yesminer',
        libraryTarget: 'umd'
    },
    plugins: [
        new NodePolyfillPlugin(),
        new ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        }),
        new BannerPlugin({
            banner: 'globalThis.process = { browser: true, env: {}, };',
            raw: true,
        }),
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            fs: false,
            path: false,
            url: false,
            ws: false,
            crypto: false,
            worker_threads: false,
        },
        fallback: {
            'process/browser': require.resolve('process/browser'),
        }
    },
    optimization: {
        minimize: false,
    },
};

module.exports = [
    nodeConfig,
    {
        ...nodeConfig,
        entry: './src/worker.ts',
        output: {
            filename: 'worker.js',
            path: path.resolve(__dirname, './lib'),
            libraryTarget: 'commonjs'
        },
    },
    {
        ...nodeConfig,
        entry: './src/node.ts',
        output: {
            filename: 'node.js',
            path: path.resolve(__dirname, './lib'),
            libraryTarget: 'commonjs'
        },
        plugins: [
            new BannerPlugin({
                banner: '#!/usr/bin/env node\n',
                raw: true
            }),
        ],
    },
    umdConfig,
    {
        ...umdConfig,
        entry: './src/worker.ts',
        output: {
            filename: 'worker.umd.js',
            path: path.resolve(__dirname, './lib'),
            libraryTarget: 'umd'
        },
    },
]