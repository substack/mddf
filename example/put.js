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

var x = process.argv[2];
var y = process.argv[3];
var z = process.argv[4];
var buf = Buffer(process.argv[5]);
df.put([x,y,z],buf);
