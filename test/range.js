var test = require('tape');
var mddf = require('../');
var fs = require('fs');
var path = require('path');

var tmpdir = require('osenv').tmpdir();
var tmpfile = path.join(tmpdir, 'mddf-' + Math.random());

var pointsInRange = [];
var pointsOutOfRange = [];
var minPoint;
var maxPoint;
var data = {};
var df;
var outsideSize = 50;
var insideSize = 50;

test('populate', function(t){
    minPoint = [];
    maxPoint = [];

    t.plan(insideSize + outsideSize + 2);

    for(var i=0; i<3; i++){
        var random = (1 - Math.random() * 2) * 50;
        var max = random + Math.random() * 50;
        var min = random - Math.random() * 50;
        maxPoint[i] = max;
        minPoint[i] = min;
    }

        console.log('min: ' + minPoint);
    console.log('max: ' + maxPoint);

    fs.open(tmpfile, 'w+', function (err, fd) {
        t.ifError(err);
        df = mddf({
            blksize: 4096,
            dim: 3,
            size: 0,
            read: fs.read.bind(null, fd),
            write: fs.write.bind(null, fd)
        });
        file = fd;
        populateOutside();
    });


    function populateOutside () {

        if (-- outsideSize < 0) {
            return populateInside();
        }
        var xyz = rpointNotInRange(minPoint, maxPoint);
        pointsOutOfRange.push(xyz);

        var buf = Buffer(Math.random()*100);
        buf.fill(97 + Math.random()*26);
        data[xyz.join(',')] = buf;

        df.put(xyz, buf, function (err) {
            t.ifError(err);
            populateOutside();
        });
    }

    function populateInside () {

        if (-- insideSize < 0) {

            return fs.ftruncate(file, df.size, function (err) {
                t.ifError(err);
            });
        }
        var xyz = rpointInRange(minPoint, maxPoint);
        pointsInRange.push(xyz);

        var buf = Buffer(Math.random()*100);
        buf.fill(97 + Math.random()*26);
        data[xyz.join(',')] = buf;

        df.put(xyz, buf, function (err) {
            t.ifError(err);
            populateInside();
        });
    }
});

test('range', function (t){
    t.plan(2 + pointsInRange.length);
    df.range(minPoint, maxPoint, function (err, res) {
        t.ifError(err);
        t.equal(res.length, pointsInRange.length);
        for (var i = 0; i < res.length; i++) {
            var found = res[i];
            var key = found.point.join(',');
            t.deepEqual(found.data, data[key]);
        }
    });
});
function rpointInRange (lo, hi) {
    var xs = new Float32Array(3);
    for(var i=0; i<3; i++){
        var min = Math.min(lo[i], hi[i]);
        var max = Math.max(lo[i], hi[i]);
        xs[i] = Math.random() * (max - min) + min;
    }
    return [].slice.call(xs);
}

function rpointNotInRange (lo, hi) {
    var xs = new Float32Array(3);
    for(var i=0; i<3; i++){
        var min = lo[i];
        var max = hi[i];
        var val = min;
        while(val >= min && val <= max){
            val = (2*Math.random()-1) * 100;
        }
        xs[i] = val;
    }
    return [].slice.call(xs);
}
