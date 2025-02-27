# Yesminer-js

Reference CPU miner for Yespower ( CPUchain ) EVM coins

### Usage

For solo mining ( with `--ws` enabled from node )

```bash
$ yesminer -u ws://127.0.0.1:8546 -t 1
```

For pool mining

```bash
$ yesminer -u ws://127.0.0.1:8888 -l 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 -w test -t 1
```