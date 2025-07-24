/* eslint-disable */
export const pkgJson = {
    "name": "yesminer",
    "private": true,
    "version": "1.0.0",
    "description": "Node.js CPUchain Miner",
    "license": "MIT",
    "author": "CPUchain",
    "type": "module",
    "main": "./lib/index.cjs",
    "module": "./lib/index.js",
    "types": "./lib/index.d.ts",
    "exports": {
        ".": {
            "import": "./lib/index.js",
            "require": "./lib/index.cjs",
            "default": "./lib/index.js"
        }
    },
    "keywords": [
        "yespower",
        "proof-of-work",
        "cpuchain",
        "wasm",
        "webassembly"
    ],
    "repository": {
        "type": "git",
        "url": "git+https://github.com/cpuchain/yesminer-js.git"
    },
    "target": "node22",
    "pkg": {
        "scripts": "./lib/node.cjs",
        "assets": [
            "lib"
        ],
        "targets": [
            "node22-linux-x64",
            "node22-macos-x64",
            "node22-win-x64"
        ],
        "outputPath": "."
    },
    "scripts": {
        "lint": "eslint src/**/*.ts test/**/*.ts",
        "build:pkg": "tsx ./scripts/pkgJson.ts",
        "build:dist": "yarn build && pkg -d --no-native-build --no-signature --no-bytecode -c ./package.json ./lib/node.cjs",
        "build": "yarn build:pkg && tsc -p tsconfig.types.json --noEmit && rollup -c",
        "start": "tsx src/node.ts",
        "docs:dev": "vitepress dev docs",
        "docs:build": "vitepress build docs",
        "docs:preview": "vitepress preview docs",
        "test": "vitest && istanbul-badges-readme --colors=\"red:50,yellow:60\""
    },
    "devDependencies": {
        "@cpuchain/eslint": "^1.0.9",
        "@cpuchain/rollup": "^1.0.4",
        "@types/node": "^22.16.0",
        "@types/web": "^0.0.253",
        "@types/ws": "^8.18.1",
        "@vitest/coverage-v8": "^3.2.4",
        "@yao-pkg/pkg": "^6.6.0",
        "commander": "^14.0.0",
        "cross-env": "^7.0.3",
        "dotenv": "^17.2.0",
        "eventemitter3": "^5.0.1",
        "glob": "^11.0.3",
        "isomorphic-ws": "^5.0.0",
        "istanbul-badges-readme": "^1.9.0",
        "logger-chain": "^1.0.3",
        "ts-node": "^10.9.2",
        "tsc": "^2.0.4",
        "tsx": "^4.20.3",
        "typescript": "^5.8.3",
        "vitepress": "^1.6.3",
        "vitest": "^3.2.4",
        "ws": "^8.18.3",
        "yespower-wasm": "^1.0.3"
    },
    "resolutions": {
        "fast-glob": ">=3.3.3"
    }
} as const;