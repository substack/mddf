var test = require('tape');
var mddf = require('../');
var path = require('path');
var fdstore = require('fd-chunk-store')

var tmpdir = require('osenv').tmpdir();
var tmpfile = path.join(tmpdir, 'mddf-' + Math.random());

var df;

test('put', function (t) {
    var size = 50;
    t.plan(size + 1);

    df = mddf({
        size: 4096,
        store: fdstore(4096, tmpfile),
        dim: 3
    });
    //if all corrects callbacks are run properly, those sums should be equal
    var callbackSum = 0;
    var expectedSum = 0;

    (function next () {
        if (-- size < 0) {
            t.equal(expectedSum, callbackSum);
            return
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

function rpoint () {
    var xs = new Float32Array(3);
    xs[0] = (2*Math.random()-1) * 100;
    xs[1] = (2*Math.random()-1) * 100;
    xs[2] = (2*Math.random()-1) * 100;
    return [].slice.call(xs);
}
