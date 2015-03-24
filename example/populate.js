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

df.add([1,2,3], 1);
df.add([4,5,6], 2);
df.add([0,-2.5,3],3);
df.add([-2,3,0], 4);
df.add([3,2,1], 5);
