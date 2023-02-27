import LFSM from "./lfs.js";

let Module = await LFSM();
globalThis["Module"] = Module;

import { MemoryBlockDevice, LFS, LFS_O_CREAT, LFS_O_RDONLY, LFS_O_TRUNC, LFS_O_WRONLY } from "./lfs_js.js";

// console.log(Module);

const bdev = new MemoryBlockDevice(512, 2048);
const lfs = new LFS(bdev, 100);
// console.log(lfs);
console.log("format:", lfs.format());
console.log("mount:", lfs.mount());
let file = lfs.open("/test.txt", LFS_O_WRONLY | LFS_O_CREAT | LFS_O_TRUNC);
console.log("open:", typeof(file) == "number" ? file : "successed.");
let data = new TextEncoder().encode("Hello 你好 World 世界");
let data_size = file.write(data)
console.log("write:", data_size);
console.log("sync:", file.sync());
console.log("close:", file.close());

file = lfs.open("/test.txt", LFS_O_RDONLY);
console.log("open:", typeof(file) == "number" ? file : "successed.");
data = file.read(data_size);
console.log("read:", typeof(data) == "number" ? data : new TextDecoder().decode(data));
console.log("close:", file.close());

let dir = lfs.opendir("/");
console.log("opendir:", typeof(dir) == "number" ? dir : "successed.");
console.log("read dir:", dir.read());
console.log("read dir:", dir.read());
console.log("read dir:", dir.read());
console.log("read dir:", dir.read());
console.log("stat '/test.txt':", lfs.stat("/test.txt"));
