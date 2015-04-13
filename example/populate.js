var mddf = require('../');
var fs = require('fs');

var fd = fs.openSync('data.mddf', 'w+');
var stat = fs.fstatSync(fd);

var df = mddf({
    blksize: 256,
    dim: 3,
    size: stat.size,
    read: fs.read.bind(null, fd),
    write: fs.write.bind(null, fd)
});

var size = 100000;
(function next () {
    if (-- size < 0) {
        return fs.ftruncate(fd, df.size, function () { fs.close(fd) });
    }
    var x = (2*Math.random()-1) * 100;
    var y = (2*Math.random()-1) * 100;
    var z = (2*Math.random()-1) * 100;
    var buf = Buffer(Math.random() * 100);
    buf.fill(97 + Math.random()*26);
    df.put([x,y,z], buf, next);
})();
