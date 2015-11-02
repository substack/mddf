var mddf = require('../');
var fdstore = require('fd-chunk-store');

var df = mddf({
    size: 4096,
    dim: 3,
    store: fdstore(4096, 'data.mddf')
});

var size = 100000;
(function next () {
    if (-- size < 0) return;
    var x = (2*Math.random()-1) * 100;
    var y = (2*Math.random()-1) * 100;
    var z = (2*Math.random()-1) * 100;
    var buf = Buffer(100);
    buf.fill(97 + Math.random()*26);
    df.put([x,y,z], buf, next);
})();
