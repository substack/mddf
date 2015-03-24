var mddf = require('../');
var fs = require('fs');

var fd = fs.openSync('data.mddf', 'w+');
var stat = fs.fstatSync(fd);

var df = mddf({
    blksize: 4096,
    dim: 3,
    size: stat.size,
    read: fs.read.bind(null, fd),
    write: fs.write.bind(null, fd)
});

df.write({ key: [1,2,3], value: 1 });
df.write({ key: [4,5,6], value: 2 });
df.write({ key: [0,-2.5,3], value: 3 });
df.write({ key: [-2,3,0], value: 4 });
df.write({ key: [3,2,1], value: 5 });
df.end();
