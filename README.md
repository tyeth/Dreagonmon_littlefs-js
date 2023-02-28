## A javascript wrapper for the little filesystem

This project puts together two things that should probably never
go together:  
embedded system filesystems, and web-side javascript.

The result is a fully functional javascript API for littlefs, complete
with simulated block devices. This was all built using emscripten, a
backend for the LLVM that can compile C to javascript. There's no smoke
and mirrors here, this is actually running littlefs in your browser.

* **original littlefs-js** - https://github.com/littlefs-project/littlefs-js
* **littlefs** - https://github.com/geky/littlefs  
* **emscripten** - https://github.com/kripken/emscripten  

## Difference from the original littlefs-js
* link to the littlefs library via git submodule.
* upgrade littlefs to v2.5.1
* comfigured to only generate `.js` file, this will allow easier integrations (but worse performance).
* suppout asynchronous block device's api, which make it possible to directly access real devices via `Web Bluetooth`, `Web USB`, `Web Serial` and so on.
* all filesystem's operations are asynchronous, include `tell` and `seek`, don't forget to `await`.

## Try the demo
You need compile the project before run the demo. This will generate the `lfs.js`.

```bash
# install emcc (emscripten) 3.1.31 first.
make
```

You can try it with `node demo.js` or `deno run demo.js`.

## Useage
`lfs.js` and `lfs_js.js` are required. and only es module are supported.

You can implement your own block device by extend `BlockDevice` class.
Refer to `MemoryBlockDevice` class for example.
* `read` and `prog` functions are required. `erase` and `sync` are optional.
* `read`, `prog`, `erase`, `sync` functions can be asynchronous, and return a number. 0 means success, < 0 means failed, and the error code return to the io-operation-caller.
* outside `lfs_js.js`, use `LFSModule.HEAPU8` to access raw memory.
* `this.block_size` and `this.block_count` are required.
* `write_size`, `read_size`, `cache_size` don't affect the data on the filesystem. so they are all set to `this.block_size`.
