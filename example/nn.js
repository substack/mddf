var mddf = require('../');
var fs = require('fs');

var fd = fs.openSync('data.mddf', 'r');
var stat = fs.fstatSync(fd);

var df = mddf({
    blksize: 4096,
    dim: 3,
    size: stat.size,
    read: fs.read.bind(null, fd)
});
df.nn(process.argv.slice(2), function (err, pt, data) {
    console.log('nearest:', pt);
    console.log('data:', data);
});
