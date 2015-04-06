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

var near = df.near(process.argv.slice(2));
(function next () {
    near(function (err, pt, data) {
        console.log(err, pt)
        if (!pt) return;
        process.nextTick(next);
    });
})();
