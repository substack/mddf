var mddf = require('../');
var fdstore = require('fd-chunk-store');

var df = mddf({
    size: 4096,
    dim: 3,
    store: fdstore(4096, 'data.mddf')
});

var near = df.near(process.argv.slice(2));
(function next () {
    near(function (err, pt, data) {
        if (!pt) return;
        console.log(pt)
        process.nextTick(next);
    });
})();
