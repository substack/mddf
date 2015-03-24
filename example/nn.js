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

var start = Date.now();
df.nn(process.argv.slice(2), function (err, pt, data) {
    var elapsed = Date.now() - start;
    console.log('nearest:', pt);
    console.log('data: ' + data);
    console.log('query took ' + elapsed + ' ms');
});
