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

var size = 1000 * 20;
var pending = size;
for (var i = 0; i < size; i++) {
    var x = (2*Math.random()-1) * 100;
    var y = (2*Math.random()-1) * 100;
    var z = (2*Math.random()-1) * 100;
    var buf = Buffer(10);
    buf.fill(i.toString(16));
    df.put([x,y,z], buf, done);
}

function done () {
    if (--pending === 0) {
        fs.truncate(fd, df.size, function () {
            fs.close(fd);
        });
    }
}
