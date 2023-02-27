import LFSM from "./lfs.js";
const Module = await LFSM();
// link in C functions
const _n_ = 'number';
const _s_ = 'string';
const _lfs_new = Module.cwrap('lfs_new', _n_, []);
const _lfs_new_config = Module.cwrap('lfs_new_config', _n_,
    [ _n_, _n_, _n_, _n_, _n_, _n_, _n_ ]);
const _lfs_new_info = Module.cwrap('lfs_new_info', _n_, []);
const _lfs_new_file = Module.cwrap('lfs_new_file', _n_, []);
const _lfs_new_dir = Module.cwrap('lfs_new_dir', _n_, []);

const _lfs_format = Module.cwrap('lfs_format', _n_, [ _n_, _n_ ]);
const _lfs_mount = Module.cwrap('lfs_mount', _n_, [ _n_, _n_ ]);
const _lfs_unmount = Module.cwrap('lfs_unmount', _n_, [ _n_ ]);
const _lfs_remove = Module.cwrap('lfs_remove', _n_, [ _n_, _s_ ]);
const _lfs_rename = Module.cwrap('lfs_rename', _n_, [ _n_, _s_, _s_ ]);
const _lfs_stat = Module.cwrap('lfs_stat', _n_, [ _n_, _s_, _n_ ]);

const _lfs_file_open = Module.cwrap('lfs_file_open', _n_, [ _n_, _n_, _s_, _n_ ]);
const _lfs_file_close = Module.cwrap('lfs_file_close', _n_, [ _n_, _n_ ]);
const _lfs_file_sync = Module.cwrap('lfs_file_sync', _n_, [ _n_, _n_ ]);
const _lfs_file_read = Module.cwrap('lfs_file_read', _n_, [ _n_, _n_, _n_, _n_ ]);
const _lfs_file_write = Module.cwrap('lfs_file_write', _n_, [ _n_, _n_, _n_, _n_ ]);
const _lfs_file_seek = Module.cwrap('lfs_file_seek', _n_, [ _n_, _n_, _n_, _n_ ]);
const _lfs_file_truncate = Module.cwrap('_lfs_file_truncate', _n_, [ _n_, _n_, _n_ ]);
const _lfs_file_tell = Module.cwrap('lfs_file_tell', _n_, [ _n_, _n_ ]);
const _lfs_file_rewind = Module.cwrap('lfs_file_rewind', _n_, [ _n_, _n_ ]);
const _lfs_file_size = Module.cwrap('lfs_file_size', _n_, [ _n_, _n_ ]);

const _lfs_fs_traverse = Module.cwrap('lfs_fs_traverse', _n_, [ _n_, _n_, _n_ ]);

const _lfs_mkdir = Module.cwrap('lfs_mkdir', _n_, [ _n_, _s_ ]);
const _lfs_dir_open = Module.cwrap('lfs_dir_open', _n_, [ _n_, _n_, _s_ ]);
const _lfs_dir_close = Module.cwrap('lfs_dir_close', _n_, [ _n_, _n_ ]);
const _lfs_dir_read = Module.cwrap('lfs_dir_read', _n_, [ _n_, _n_, _n_ ]);
const _lfs_dir_seek = Module.cwrap('lfs_dir_seek', _n_, [ _n_, _n_, _n_ ]);
const _lfs_dir_tell = Module.cwrap('lfs_dir_tell', _n_, [ _n_, _n_ ]);
const _lfs_dir_rewind = Module.cwrap('lfs_dir_rewind', _n_, [ _n_, _n_ ]);

const _malloc = Module.cwrap('raw_malloc', _n_, [ _n_ ]);
const _free = Module.cwrap('raw_free', null, [ _n_ ]);
const _async_sleep = Module.cwrap('raw_sleep', null, [ _n_ ]);
/**
 * @param {number} p 
 * @param {number} size 
 * @returns {Uint8Array}
 */
const _data_from_pointer = (p, size) => {
    let data = new Uint8Array(size);
    let i = 0;
    while (i < size) {
        data[ i ] = Module.HEAPU8[ p + i ];
        i++;
    }
    return data;
};
/**
 * @param {number} p 
 * @returns {number}
 */
const _u32_from_pointer = (p) => {
    let num = 0;
    for (let i = 0; i < 4; i++) {
        num = num;
        num = num | (Module.HEAPU8[ p + i ] << (8 * i));
    }
    return num;
};
/**
 * @param {number} p
 * @returns {string}
 */
const _string_from_pointer = (p) => {
    let data = new Array();
    while (Module.HEAPU8[ p ] > 0) {
        data.push(Module.HEAPU8[ p ]);
        p++;
    }
    let buffer = Uint8Array.from(data);
    let decoder = new TextDecoder();
    return decoder.decode(buffer);
};

// error code
export const LFS_ERR_OK = 0;    // No error
export const LFS_ERR_IO = -5;   // Error during device operation
export const LFS_ERR_CORRUPT = -84;  // Corrupted
export const LFS_ERR_NOENT = -2;   // No directory entry
export const LFS_ERR_EXIST = -17;  // Entry already exists
export const LFS_ERR_NOTDIR = -20;  // Entry is not a dir
export const LFS_ERR_ISDIR = -21;  // Entry is a dir
export const LFS_ERR_NOTEMPTY = -39;  // Dir is not empty
export const LFS_ERR_BADF = -9;   // Bad file number
export const LFS_ERR_FBIG = -27;  // File too large
export const LFS_ERR_INVAL = -22;  // Invalid parameter
export const LFS_ERR_NOSPC = -28;  // No space left on device
export const LFS_ERR_NOMEM = -12;  // No more memory available
export const LFS_ERR_NOATTR = -61;  // No data/attr available
export const LFS_ERR_NAMETOOLONG = -36;  // File name too long

// internal constants
export const LFS_TYPE_REG = 0x001;
export const LFS_TYPE_DIR = 0x002;

export const LFS_O_RDONLY = 1;      // Open a file as read only
export const LFS_O_WRONLY = 2;      // Open a file as write only
export const LFS_O_RDWR = 3;      // Open a file as read and write
export const LFS_O_CREAT = 0x0100; // Create a file if it does not exist
export const LFS_O_EXCL = 0x0200; // Fail if a file already exists
export const LFS_O_TRUNC = 0x0400; // Truncate the existing file to zero size
export const LFS_O_APPEND = 0x0800; // Move to end of file on every write

export const LFS_SEEK_SET = 0;
export const LFS_SEEK_CUR = 1;
export const LFS_SEEK_END = 2;

// block device class
export class BlockDevice {
    /**
     * @param {number} block 
     * @param {number} off 
     * @param {number} buffer 
     * @param {number} size 
     */
    read (block, off, buffer, size) {
        throw Error("Not Implement");
    }
    /**
     * @param {number} block 
     * @param {number} off 
     * @param {number} buffer 
     * @param {number} size 
     */
    prog (block, off, buffer, size) {
        throw Error("Not Implement");
    }
    /**
     * @param {number} block 
     */
    erase (block) {
        throw Error("Not Implement");
    }
}

export class MemoryBlockDevice extends BlockDevice {
    constructor (block_size, block_count) {
        super();
        this.block_size = block_size;
        this.block_count = block_count;
        this._storage = [];
    }
    read (block, off, buffer, size) {
        if (this.onread) {
            if (this.onread(block, off, size) == false) {
                return 0;
            }
        }

        if (!this._storage[ block ]) {
            this._storage[ block ] = new Uint8Array(this.block_size);
        }

        Module.HEAPU8.set(
            new Uint8Array(this._storage[ block ].buffer, off, size),
            buffer);
        return 0;
    }
    prog (block, off, buffer, size) {
        if (this.onprog) {
            if (this.onprog(block, off, size) == false) {
                return 0;
            }
        }

        if (!this._storage[ block ]) {
            this._storage[ block ] = new Uint8Array(this.block_size);
        }

        this._storage[ block ].set(
            new Uint8Array(Module.HEAPU8.buffer, buffer, size),
            off);
        return 0;
    }
    erase (block) {
        if (this.onerase) {
            this.onerase(block);
        }

        delete this._storage[ block ];
        return 0;
    }
}

// wrap bd functions in C runtime
// needs global thunks due to emscripten limitations
/** @type {Map<number, LFS>} */
const globalLFSObject = new Map();
const globalCFunctions = {
    _readptr: Module.addFunction(function (cfg,
        block, off, buffer, size) {
        if (globalLFSObject.has(cfg)) {
            const lfs = globalLFSObject.get(cfg);
            return lfs._readthunk(block, off, buffer, size);
        } else {
            return LFS_ERR_CORRUPT;
        }
    }),
    _progptr: Module.addFunction(function (cfg,
        block, off, buffer, size) {
        if (globalLFSObject.has(cfg)) {
            const lfs = globalLFSObject.get(cfg);
            return lfs._progthunk(block, off, buffer, size);
        } else {
            return LFS_ERR_CORRUPT;
        }
    }),
    _eraseptr: Module.addFunction(function (cfg, block) {
        if (globalLFSObject.has(cfg)) {
            const lfs = globalLFSObject.get(cfg);
            return lfs._erasethunk(block);
        } else {
            return LFS_ERR_CORRUPT;
        }
    }),
    _syncptr: Module.addFunction(function (cfg) {
        if (globalLFSObject.has(cfg)) {
            const lfs = globalLFSObject.get(cfg);
            return lfs._syncthunk();
        } else {
            return LFS_ERR_CORRUPT;
        }
    }),
    _traverseptr: Module.addFunction(function (cfg, block) {
        if (globalLFSObject.has(cfg)) {
            const lfs = globalLFSObject.get(cfg);
            return lfs._traverseptr(block);
        } else {
            return LFS_ERR_CORRUPT;
        }
    }),
};

// LFS class
export class LFS {
    /**
     * LFS
     * @param {BlockDevice} bd block device
     * @param {number} block_cycles flash wear cycles
     */
    constructor (bd, block_cycles) {
        this.bd = bd;
        this._mount = false;

        // setup config
        this.block_size = bd.block_size;
        this.block_count = bd.block_count;
        this.block_cycles = block_cycles;

        // setup bd thunks
        this._readthunk = bd.read.bind(bd);
        this._progthunk = bd.prog.bind(bd);
        this._erasethunk = (bd.erase || function () { return 0; }).bind(bd);
        this._syncthunk = (bd.sync || function () { return 0; }).bind(bd);
    }
    format () {
        if (this._mount) {
            // need unmount filesystems first
            return LFS_ERR_IO;
        }

        // allocate memory
        this._lfs_config = _lfs_new_config(
            globalCFunctions._readptr, globalCFunctions._progptr, globalCFunctions._eraseptr, globalCFunctions._syncptr,
            this.block_size, this.block_count,
            this.block_cycles);
        this._lfs = _lfs_new();

        globalLFSObject.set(this._lfs_config, this);

        // call format
        let err = _lfs_format(this._lfs, this._lfs_config);

        // clean up
        globalLFSObject.delete(this._lfs_config);
        _free(this._lfs_config);
        _free(this._lfs);

        return err;
    }
    mount () {
        if (this._mount) {
            return 0;
        }

        // allocate memory
        this._lfs_config = _lfs_new_config(
            globalCFunctions._readptr, globalCFunctions._progptr, globalCFunctions._eraseptr, globalCFunctions._syncptr,
            this.block_size, this.block_count,
            this.block_cycles);
        this._lfs = _lfs_new();

        globalLFSObject.set(this._lfs_config, this);

        // call mount
        let err = _lfs_mount(this._lfs, this._lfs_config);
        if (err >= 0) {
            this._mount = true;
        } else {
            // clean up
            globalLFSObject.delete(this._lfs_config);
            _free(this._lfs_config);
            _free(this._lfs);
        }
        return err;
    }
    unmount () {
        if (!this._mount) {
            // need mount first
            return LFS_ERR_IO;
        }

        // call unmount
        let err = _lfs_unmount(this._lfs);

        // clean up
        globalLFSObject.delete(this._lfs_config);
        _free(this._lfs_config);
        _free(this._lfs);

        this._mount = false;

        return err;
    }
    remove (path) {
        return _lfs_remove(this._lfs, path);
    }
    rename (oldpath, newpath) {
        return _lfs_rename(this._lfs, oldpath, newpath);
    }
    stat (path) {
        // fill out butter with stat
        let info = _lfs_new_info();
        let err = _lfs_stat(this._lfs, path, info);
        if (err) {
            // return err code instead of object
            _free(info);
            return err;
        }

        // extract results
        let res = {
            type: Module.HEAPU8[ info + 0 ],
            size: _u32_from_pointer(info + 4),
            name: _string_from_pointer(info + 8),
        };
        _free(info);
        return res;
    }
    /**
     * open a file
     * @param {string} name 
     * @param {number} flags 
     * @returns {LFSFile | number}
     */
    open (name, flags) {
        let res = new LFSFile(this, name, flags);
        if (res.err) {
            return res.err;
        }

        return res;
    }
    mkdir (path) {
        return _lfs_mkdir(this._lfs, path);
    }
    /**
     * open a dir
     * @param {string} name 
     * @returns {LFSDir | number}
     */
    opendir (name) {
        let res = new LFSDir(this, name);
        if (res.err) {
            return res.err;
        }

        return res;
    }
    traverse (cb) {
        this._traversethunk = cb;
        return _lfs_fs_traverse(this._lfs, globalCFunctions._traverseptr, 0);
    }
}

class LFSFile {
    constructor (lfs, name, flags) {
        /** @type {LFS} */
        this.lfs = lfs;
        this.name = name;

        // allocate memory and open file
        this._file = _lfs_new_file();
        let err = _lfs_file_open(this.lfs._lfs, this._file, name, flags);
        if (err < 0) {
            _free(this._file);
            this.err = err;
        }
    }
    /**
     * close
     * @returns {number}
     */
    close () {
        let err = _lfs_file_close(this.lfs._lfs, this._file);
        _free(this._file);
        return err;
    }
    /**
     * sync
     * @returns {number}
     */
    sync () {
        return _lfs_file_sync(this.lfs._lfs, this._file);
    }
    /**
     * read
     * @param {number} size 
     * @returns {Uint8Array | number}
     */
    read (size) {
        if (!size) {
            size = this.size();
        }

        let buffer = _malloc(size);
        let res = _lfs_file_read(this.lfs._lfs, this._file, buffer, size);
        if (res < 0) {
            _free(buffer);
            return res;
        }

        let data = _data_from_pointer(buffer, res);
        _free(buffer);
        return data;
    }
    /**
     * write
     * @param {Uint8Array} data 
     * @returns {number}
     */
    write (data) {
        let buffer = _malloc(data.length);
        let i = 0;
        while (i < data.length) {
            Module.HEAPU8[ buffer + i ] = data[ i ];
            i++;
        }

        let res = _lfs_file_write(this.lfs._lfs, this._file, buffer, data.length);
        _free(buffer);
        return res;
    }
    /**
     * seek
     * @param {number} offset 
     * @param {number} whence 
     * @returns {number}
     */
    seek (offset, whence) {
        return _lfs_file_seek(this.lfs._lfs, this._file, offset, whence);
    }
    /**
     * truncate
     * @param {number} size 
     * @returns {number}
     */
    truncate (size) {
        return _lfs_file_truncate(this.lfs._lfs, this._file, size);
    }
    /**
     * tell
     * @returns {number}
     */
    tell () {
        return _lfs_file_tell(this.lfs._lfs, this._file);
    }
    /**
     * rewind
     * @returns {number}
     */
    rewind () {
        return _lfs_file_rewind(this.lfs._lfs, this._file);
    }
    /**
     * size
     * @returns {number}
     */
    size () {
        return _lfs_file_size(this.lfs._lfs, this._file);
    }
}

class LFSDir {
    constructor (lfs, name) {
        /** @type {LFS} */
        this.lfs = lfs;
        this.name = name;

        // allocate memory and open dir
        this._dir = _lfs_new_dir();
        let err = _lfs_dir_open(this.lfs._lfs, this._dir, name);
        if (err < 0) {
            _free(this._dir);
            this.err = err;
        }
    }
    close () {
        let err = _lfs_dir_close(this.lfs._lfs, this._dir);
        _free(this._dir);
        return err;
    }
    read () {
        // fill out butter with dir read
        let info = _lfs_new_info();
        let err = _lfs_dir_read(this.lfs._lfs, this._dir, info);
        if (err == 0) {
            // return null when complete
            _free(info);
            return null;
        } else if (err < 0) {
            // return err code instead of object
            _free(info);
            return err;
        }

        // extract results
        let res = {
            type: Module.HEAPU8[ info + 0 ],
            size: _u32_from_pointer(info + 4),
            name: _string_from_pointer(info + 8),
        };
        _free(info);
        return res;
    }
    seek (off) {
        return _lfs_dir_seek(this.lfs._lfs, this._dir, off);
    }
    tell () {
        return _lfs_dir_tell(this.lfs._lfs, this._dir);
    }
    rewind () {
        return _lfs_dir_rewind(this.lfs._lfs, this._dir);
    }
}
