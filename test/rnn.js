var test = require('tape');
var mddf = require('../');
var fs = require('fs');
var path = require('path');

var tmpdir = require('osenv').tmpdir();
var tmpfile = path.join(tmpdir, 'mddf-' + Math.random());

var points = [];
var data = {};
var df;

test('populate for rnn', function (t) {
    var size = 50;
    t.plan(size + 2);

    fs.open(tmpfile, 'w+', function (err, fd) {
        t.ifError(err);

        df = mddf({
            blksize: 4096,
            dim: 3,
            size: 0,
            read: fs.read.bind(null, fd),
            write: fs.write.bind(null, fd)
        });

        (function next () {
            if (-- size < 0) {
                return fs.ftruncate(fd, df.size, function (err) {
                    t.ifError(err);
                });
            }
            var xyz = rpoint();
            points.push(xyz);

            var buf = Buffer(Math.random()*100);
            buf.fill(97 + Math.random()*26);
            data[xyz.join(',')] = buf;

            df.put(xyz, buf, function (err) {
                t.ifError(err);
                next();
            });
        })();
    });
});

test('radius nearest neighbors', function (t) {
    var times = 100;
    t.plan(times * 2);

    (function next () {
        if (--times < 0) return;

        var pt = rpoint();
        var radius = 10;
        var expected = [];
        for (var i = 0; i < points.length; i++) {
            var d = dist(points[i], pt);
            if (d < radius) {
                expected.push(points[i]);
            }
        }

        df.rnn(radius, pt, function (err, res) {
            t.ifError(err);
            t.equal(res.length, expected.length);
            next();
        });
    })();
});

function dist (a, b) {
    var sum = 0;
    for (var i = 0; i < a.length; i++) {
        sum += (a[i]-b[i])*(a[i]-b[i]);
    }
    return Math.sqrt(sum);
}

function rpoint () {
    var xs = new Float32Array(3);
    xs[0] = (2*Math.random()-1) * 100;
    xs[1] = (2*Math.random()-1) * 100;
    xs[2] = (2*Math.random()-1) * 100;
    return [].slice.call(xs);
}
