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

for (var i = 0; i < 1000; i++) {
    var x = (2*Math.random()-1) * 100;
    var y = (2*Math.random()-1) * 100;
    var z = (2*Math.random()-1) * 100;
    var buf = Buffer(Math.random() * 20);
    df.add([x,y,z], buf);
}
