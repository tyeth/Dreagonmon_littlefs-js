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

// LFS class
export class LFS {
    /**
     * LFS
     * @param {BlockDevice} bd block device
     * @param {number} block_cycles flash wear cycles
     */
    constructor (bd, block_cycles) {
        this.bd = bd;
        this._mount = 0;

        // setup config
        this.block_size = bd.block_size;
        this.block_count = bd.block_count;
        this.block_cycles = block_cycles;

        // wrap bd functions in C runtime
        // needs global thunks due to emscripten limitations
        if (!LFS._readptr) {
            LFS._readptr = Module.addFunction(function (cfg,
                block, off, buffer, size) {
                return LFS._readthunk(block, off, buffer, size);
            });
        }

        if (!LFS._progptr) {
            LFS._progptr = Module.addFunction(function (cfg,
                block, off, buffer, size) {
                return LFS._progthunk(block, off, buffer, size);
            });
        }

        if (!LFS._eraseptr) {
            LFS._eraseptr = Module.addFunction(function (cfg, block) {
                return LFS._erasethunk(block);
            });
        }

        if (!LFS._syncptr) {
            LFS._syncptr = Module.addFunction(function (cfg) {
                return LFS._syncthunk();
            });
        }

        if (!LFS._traverseptr) {
            LFS._traverseptr = Module.addFunction(function (cfg, block) {
                return LFS._traversethunk(block);
            });
        }

        // setup bd thunks
        LFS._readthunk = bd.read.bind(bd);
        LFS._progthunk = bd.prog.bind(bd);
        LFS._erasethunk = (bd.erase || function () { return 0; }).bind(bd);
        LFS._syncthunk = (bd.sync || function () { return 0; }).bind(bd);

        // constants
        this.types = {
            'reg': LFS_TYPE_REG,
            'dir': LFS_TYPE_DIR,
        };

        this.flags = {
            'rdonly': LFS_O_RDONLY,
            'wronly': LFS_O_WRONLY,
            'rdwr': LFS_O_RDWR,
            'creat': LFS_O_CREAT,
            'excl': LFS_O_EXCL,
            'trunc': LFS_O_TRUNC,
            'append': LFS_O_APPEND,
        };

        this.whences = {
            'set': LFS_SEEK_SET,
            'cur': LFS_SEEK_CUR,
            'end': LFS_SEEK_END,
        };

        // link in C functions
        let n = 'number';
        let s = 'string';
        this._lfs_new = Module.cwrap('lfs_new', n, []);
        this._lfs_new_config = Module.cwrap('lfs_new_config', n,
            [ n, n, n, n, n, n, n ]);
        this._lfs_new_info = Module.cwrap('lfs_new_info', n, []);
        this._lfs_new_file = Module.cwrap('lfs_new_file', n, []);
        this._lfs_new_dir = Module.cwrap('lfs_new_dir', n, []);

        this._lfs_format = Module.cwrap('lfs_format', n, [ n, n ]);
        this._lfs_mount = Module.cwrap('lfs_mount', n, [ n, n ]);
        this._lfs_unmount = Module.cwrap('lfs_unmount', n, [ n ]);
        this._lfs_remove = Module.cwrap('lfs_remove', n, [ n, s ]);
        this._lfs_rename = Module.cwrap('lfs_rename', n, [ n, s, s ]);
        this._lfs_stat = Module.cwrap('lfs_stat', n, [ n, s, n ]);

        this._lfs_file_open = Module.cwrap('lfs_file_open', n, [ n, n, s, n ]);
        this._lfs_file_close = Module.cwrap('lfs_file_close', n, [ n, n ]);
        this._lfs_file_sync = Module.cwrap('lfs_file_sync', n, [ n, n ]);
        this._lfs_file_read = Module.cwrap('lfs_file_read', n, [ n, n, n, n ]);
        this._lfs_file_write = Module.cwrap('lfs_file_write', n, [ n, n, n, n ]);
        this._lfs_file_seek = Module.cwrap('lfs_file_seek', n, [ n, n, n, n ]);
        this._lfs_file_truncate = Module.cwrap('lfs_file_seek', n, [ n, n, n ]);
        this._lfs_file_tell = Module.cwrap('lfs_file_tell', n, [ n, n ]);
        this._lfs_file_rewind = Module.cwrap('lfs_file_rewind', n, [ n, n ]);
        this._lfs_file_size = Module.cwrap('lfs_file_size', n, [ n, n ]);

        this._lfs_fs_traverse = Module.cwrap('lfs_fs_traverse', n, [ n, n, n ]);

        this._lfs_mkdir = Module.cwrap('lfs_mkdir', n, [ n, s ]);
        this._lfs_dir_open = Module.cwrap('lfs_dir_open', n, [ n, n, s ]);
        this._lfs_dir_close = Module.cwrap('lfs_dir_close', n, [ n, n ]);
        this._lfs_dir_read = Module.cwrap('lfs_dir_read', n, [ n, n, n ]);
        this._lfs_dir_seek = Module.cwrap('lfs_dir_seek', n, [ n, n, n ]);
        this._lfs_dir_tell = Module.cwrap('lfs_dir_tell', n, [ n, n ]);
        this._lfs_dir_rewind = Module.cwrap('lfs_dir_rewind', n, [ n, n ]);

        this._malloc = Module.cwrap('raw_malloc', n, [ n ]);
        this._free = Module.cwrap('raw_free', null, [ n ]);

    }
    format () {
        if (this._mount > 0) {
            // temporarily unmount filesystems
            this._free(this._lfs_config);
            this._free(this._lfs);
        }

        // allocate memory
        this._lfs_config = this._lfs_new_config(
            LFS._readptr, LFS._progptr, LFS._eraseptr, LFS._syncptr,
            this.block_size, this.block_count,
            this.block_cycles);
        this._lfs = this._lfs_new();

        // call format
        let err = this._lfs_format(this._lfs, this._lfs_config);

        // clean up
        if (this._mount == 0) {
            this._free(this._lfs_config);
            this._free(this._lfs);
        }

        return err;
    }
    mount () {
        this._mount += 1;
        if (this._mount != 1) {
            return 0;
        }

        // allocate memory
        this._lfs_config = this._lfs_new_config(
            LFS._readptr, LFS._progptr, LFS._eraseptr, LFS._syncptr,
            this.block_size, this.block_count,
            this.block_cycles);
        this._lfs = this._lfs_new();

        // call mount
        let err = this._lfs_mount(this._lfs, this._lfs_config);
        if (err) {
            this._mount -= 1;
        }
        return err;
    }
    unmount () {
        this._mount -= 1;
        if (this._mount != 0) {
            return 0;
        }

        // call unmount
        let err = this._lfs_unmount(this._lfs);

        // clean up
        this._free(this._lfs_config);
        this._free(this._lfs);

        return err;
    }
    remove (path) {
        return this._lfs_remove(this._lfs, path);
    }
    rename (oldpath, newpath) {
        return this._lfs_rename(this._lfs, oldpath, newpath);
    }
    stat (path) {
        // fill out butter with stat
        let info = this._lfs_new_info();
        let err = this._lfs_stat(this._lfs, path, info);
        if (err) {
            // return err code instead of object
            this._free(info);
            return err;
        }

        // extract results
        let res = {
            type: Module.HEAPU8[ info + 0 ],
            size: this._u32_from_pointer(info + 4),
            name: this._string_from_pointer(info + 8),
        };
        this._free(info);
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
        return this._lfs_mkdir(this._lfs, path);
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
        LFS._traversethunk = cb;
        return this._lfs_fs_traverse(this._lfs, LFS._traverseptr, 0);
    }
    /**
     * @param {number} p
     * @returns {string}
     */
    _string_from_pointer (p) {
        let data = new Array();
        while (Module.HEAPU8[ p ] > 0) {
            data.push(Module.HEAPU8[ p ]);
            p++;
        }
        let buffer = Uint8Array.from(data);
        let decoder = new TextDecoder();
        return decoder.decode(buffer);
    }
    /**
     * @param {number} p 
     * @param {number} size 
     * @returns {Uint8Array}
     */
    _data_from_pointer (p, size) {
        let data = new Uint8Array(size);
        let i = 0;
        while (i < size) {
            data[ i ] = Module.HEAPU8[ p + i ];
            i++;
        }
        return data;
    }
    /**
     * @param {number} p 
     * @returns {number}
     */
    _u32_from_pointer (p) {
        let num = 0;
        for (let i = 0; i < 4; i++) {
            num = num;
            num = num | (Module.HEAPU8[ p + i ] << (8 * i));
        }
        return num;
    }
}

class LFSFile {
    constructor (lfs, name, flags) {
        /** @type {LFS} */
        this.lfs = lfs;
        this.name = name;
        this.flags = flags;

        // allocate memory and open file
        this._file = this.lfs._lfs_new_file();
        let err = this.lfs._lfs_file_open(this.lfs._lfs, this._file, name, flags);
        if (err < 0) {
            this.lfs._free(this._file);
            this.err = err;
        }
    }
    close () {
        let err = this.lfs._lfs_file_close(this.lfs._lfs, this._file);
        this.lfs._free(this._file);
        return err;
    }
    sync () {
        return this.lfs._lfs_file_sync(this.lfs._lfs, this._file);
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

        let buffer = this.lfs._malloc(size);
        let res = this.lfs._lfs_file_read(this.lfs._lfs, this._file, buffer, size);
        if (res < 0) {
            this.lfs._free(buffer);
            return res;
        }

        let data = this.lfs._data_from_pointer(buffer, res);
        this.lfs._free(buffer);
        return data;
    }
    /**
     * write
     * @param {Uint8Array} data 
     * @returns {number}
     */
    write (data) {
        let buffer = this.lfs._malloc(data.length);
        let i = 0;
        while (i < data.length) {
            Module.HEAPU8[ buffer + i ] = data[ i ];
            i++;
        }

        let res = this.lfs._lfs_file_write(this.lfs._lfs, this._file, buffer, data.length);
        this.lfs._free(buffer);
        return res;
    }
    truncate (size) {
        return this.lfs._lfs_file_truncate(this.lfs._lfs, this._file, size);
    }
    tell () {
        return this.lfs._lfs_file_tell(this.lfs._lfs, this._file);
    }
    rewind () {
        return this.lfs._lfs_file_rewind(this.lfs._lfs, this._file);
    }
    size () {
        return this.lfs._lfs_file_size(this.lfs._lfs, this._file);
    }
}

class LFSDir {
    constructor (lfs, name) {
        /** @type {LFS} */
        this.lfs = lfs;
        this.name = name;

        // allocate memory and open dir
        this._dir = this.lfs._lfs_new_dir();
        let err = this.lfs._lfs_dir_open(this.lfs._lfs, this._dir, name);
        if (err < 0) {
            this.lfs._free(this._dir);
            this.err = err;
        }
    }
    close () {
        let err = this.lfs._lfs_dir_close(this.lfs._lfs, this._dir);
        this.lfs._free(this._dir);
        return err;
    }
    read () {
        // fill out butter with dir read
        let info = this.lfs._lfs_new_info();
        let err = this.lfs._lfs_dir_read(this.lfs._lfs, this._dir, info);
        if (err == 0) {
            // return null when complete
            this.lfs._free(info);
            return null;
        } else if (err < 0) {
            // return err code instead of object
            this.lfs._free(info);
            return err;
        }

        // extract results
        let res = {
            type: Module.HEAPU8[ info + 0 ],
            size: this.lfs._u32_from_pointer(info + 4),
            name: this.lfs._string_from_pointer(info + 8),
        };
        this.lfs._free(info);
        return res;
    }
    seek (off) {
        return this.lfs._lfs_dir_seek(this.lfs._lfs, this._dir, off);
    }
    tell () {
        return this.lfs._lfs_dir_tell(this.lfs._lfs, this._dir);
    }
    rewind () {
        return this.lfs._lfs_dir_rewind(this.lfs._lfs, this._dir);
    }
}
