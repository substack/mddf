var test = require('tape');
var mddf = require('../');
var fs = require('fs');
var path = require('path');

var tmpdir = require('osenv').tmpdir();
var tmpfile = path.join(tmpdir, 'mddf-' + Math.random());

var df;

test('put', function (t) {
    var size = 50;
    t.plan(size + 3);

    fs.open(tmpfile, 'w+', function (err, fd) {
        t.ifError(err);

        df = mddf({
            blksize: 4096,
            dim: 3,
            size: 0,
            read: fs.read.bind(null, fd),
            write: fs.write.bind(null, fd)
        });
        //if all corrects callbacks are run properly, those sums should be equal
        var callbackSum = 0;
        var expectedSum = 0;

        (function next () {
            if (-- size < 0) {
                t.equal(expectedSum, callbackSum);
                return fs.ftruncate(fd, df.size, function (err) {
                    t.ifError(err);
                });
            }
            var xyz = rpoint();
            var add = Math.random() * 10;
            expectedSum += add;

            var buf = Buffer(Math.random()*100);
            buf.fill(97 + Math.random()*26);

            df.put(xyz, buf, function (err) {
                t.ifError(err);
                callbackSum += add;
                next();
            });
        })();
    });
});

function rpoint () {
    var xs = new Float32Array(3);
    xs[0] = (2*Math.random()-1) * 100;
    xs[1] = (2*Math.random()-1) * 100;
    xs[2] = (2*Math.random()-1) * 100;
    return [].slice.call(xs);
}
