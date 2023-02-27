import { MemoryBlockDevice, LFS, LFS_O_CREAT, LFS_O_RDONLY, LFS_O_TRUNC, LFS_O_WRONLY } from "./lfs_js.js";

// console.log(Module);

const bdev = new MemoryBlockDevice(512, 2048);
const lfs = new LFS(bdev, 100);
// console.log(lfs);
console.log("format:", await lfs.format());
console.log("mount:", await lfs.mount());
let file = await lfs.open("/test.txt", LFS_O_WRONLY | LFS_O_CREAT | LFS_O_TRUNC);
console.log("open:", typeof(file) == "number" ? file : "successed.");
let data = new TextEncoder().encode("Hello 你好 World 世界");
let data_size = await file.write(data)
console.log("write:", data_size);
console.log("tell:", await file.tell());
console.log("sync:", await file.sync());
console.log("close:", await file.close());

file = await lfs.open("/test.txt", LFS_O_RDONLY);
console.log("open:", typeof(file) == "number" ? file : "successed.");
data = await file.read(data_size);
console.log("read:", typeof(data) == "number" ? data : new TextDecoder().decode(data));
console.log("close:", await file.close());

let dir = await lfs.opendir("/");
console.log("opendir:", typeof(dir) == "number" ? dir : "successed.");
console.log("read dir:", await dir.read());
console.log("read dir:", await dir.read());
console.log("read dir:", await dir.read());
console.log("read dir:", await dir.read());
console.log("stat '/test.txt':", await lfs.stat("/test.txt"));
await lfs.traverse(async (block) => { await (new Promise(r => setTimeout(r, 100))); console.log("traverse block", block); })
