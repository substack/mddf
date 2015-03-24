var mddf = require('../');
var fs = require('fs');

var fd = fs.openSync('data.mddf', 'w+');
var df = mddf({
    size: 1024,
    B: 8,
    read: function (offset, size, cb) {
        fs.read(fd, offset, size, cb);
    },
    write: function (block, offset, cb) {
        fs.write(fd, block, offset, cb);
    }
});

df.add([1,2,3], Buffer('abcdefghi'));
df.add([4,5,6], Buffer(400));
df.add([0,-2.5,3], Buffer(2000));
df.add([-2,3,0], Buffer(1000));
df.add([3,2,1], 'whatever');
