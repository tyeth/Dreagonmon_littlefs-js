/*
 * javascript wrapper for littlefs
 * C wrappers
 */
#include "lfs.h"
#include <string.h>
#include <stdlib.h>
#include <emscripten.h>

EM_ASYNC_JS(int, _read_promise, (const struct lfs_config *c, lfs_block_t block,
    lfs_off_t off, void *buffer, lfs_size_t size), {
    let lfs = Module.globalLFSObject.get(c);
    if (lfs != null) {
        let ret = lfs._readthunk(block, off, buffer, size);
        if (ret instanceof Promise) {
            return await ret;
        } else {
            return ret;
        }
    }
    return -5;
})

EM_ASYNC_JS(int, _prog_promise, (const struct lfs_config *c, lfs_block_t block,
    lfs_off_t off, const void *buffer, lfs_size_t size), {
    let lfs = Module.globalLFSObject.get(c);
    if (lfs != null) {
        let ret = lfs._progthunk(block, off, buffer, size);
        if (ret instanceof Promise) {
            return await ret;
        } else {
            return ret;
        }
    }
    return -5;
})

EM_ASYNC_JS(int, _erase_promise, (const struct lfs_config *c, lfs_block_t block), {
    let lfs = Module.globalLFSObject.get(c);
    if (lfs != null) {
        let ret = lfs._erasethunk(block);
        if (ret instanceof Promise) {
            return await ret;
        } else {
            return ret;
        }
    }
    return -5;
})

EM_ASYNC_JS(int, _sync_promise, (const struct lfs_config *c), {
    let lfs = Module.globalLFSObject.get(c);
    if (lfs != null) {
        let ret = lfs._syncthunk();
        if (ret instanceof Promise) {
            return await ret;
        } else {
            return ret;
        }
    }
    return -5;
})

EM_ASYNC_JS(int, _traverse_promise, (const struct lfs_config *c, lfs_block_t block), {
    let lfs = Module.globalLFSObject.get(c);
    if (lfs != null) {
        let ret = lfs._traversethunk(block);
        if (ret instanceof Promise) {
            return await ret;
        } else {
            return ret;
        }
    }
    return -5;
})

typedef int (*traverse_callback)(void*, lfs_block_t);

int _traverse_callback(void* c, lfs_block_t block) {
    return _traverse_promise(c, block);
}


// javascript binding functions
EMSCRIPTEN_KEEPALIVE
lfs_t *lfs_new(void) {
    return malloc(sizeof(lfs_t));
}

EMSCRIPTEN_KEEPALIVE
const struct lfs_config *lfs_new_config(
        lfs_size_t block_size,
        lfs_size_t block_count,
        int32_t block_cycles) {

    struct lfs_config *cfg = malloc(sizeof(struct lfs_config));
    memset(cfg, 0, sizeof(struct lfs_config));

    cfg->read = _read_promise;
    cfg->prog = _prog_promise;
    cfg->erase = _erase_promise;
    cfg->sync = _sync_promise;
    cfg->read_size = block_size;
    cfg->prog_size = block_size;
    cfg->block_size = block_size;
    cfg->cache_size = block_size;
    cfg->lookahead_size = block_size;
    cfg->block_count = block_count;
    cfg->block_cycles = block_cycles;

    return cfg;
}

EMSCRIPTEN_KEEPALIVE
struct lfs_info *lfs_new_info(void) {
    return malloc(sizeof(struct lfs_info));
}

EMSCRIPTEN_KEEPALIVE
struct lfs_file *lfs_new_file(void) {
    return malloc(sizeof(struct lfs_file));
}

EMSCRIPTEN_KEEPALIVE
struct lfs_dir *lfs_new_dir(void) {
    return malloc(sizeof(struct lfs_dir));
}

EMSCRIPTEN_KEEPALIVE
traverse_callback get_traverse_callback(void) {
    return _traverse_callback;
}

EMSCRIPTEN_KEEPALIVE
void *raw_malloc(size_t size) {
    return malloc(size);
}

EMSCRIPTEN_KEEPALIVE
void raw_free(void *p) {
    free(p);
}

EMSCRIPTEN_KEEPALIVE
void raw_sleep(uint32_t ms) {
    emscripten_sleep(ms);
}
