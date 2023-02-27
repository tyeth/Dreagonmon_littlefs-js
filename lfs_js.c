/*
 * javascript wrapper for littlefs
 * C wrappers
 */
#include "lfs.h"
#include <string.h>
#include <stdlib.h>
#include <emscripten.h>


// javascript binding functions
EMSCRIPTEN_KEEPALIVE
lfs_t *lfs_new(void) {
    return malloc(sizeof(lfs_t));
}

EMSCRIPTEN_KEEPALIVE
const struct lfs_config *lfs_new_config(
        int (*read)(const struct lfs_config *c, lfs_block_t block,
            lfs_off_t off, void *buffer, lfs_size_t size),
        int (*prog)(const struct lfs_config *c, lfs_block_t block,
            lfs_off_t off, const void *buffer, lfs_size_t size),
        int (*erase)(const struct lfs_config *c, lfs_block_t block),
        int (*sync)(const struct lfs_config *c),
        lfs_size_t block_size,
        lfs_size_t block_count,
        int32_t block_cycles) {

    struct lfs_config *cfg = malloc(sizeof(struct lfs_config));
    memset(cfg, 0, sizeof(struct lfs_config));

    cfg->read = read;
    cfg->prog = prog;
    cfg->erase = erase;
    cfg->sync = sync;
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
void *raw_malloc(size_t size) {
    return malloc(size);
}

EMSCRIPTEN_KEEPALIVE
void raw_free(void *p) {
    free(p);
}
