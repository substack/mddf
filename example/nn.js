var mddf = require('../');
var fdstore = require('fd-chunk-store');

var df = mddf({
    size: 4096,
    dim: 3,
    store: fdstore(4096, 'data.mddf')
});

var start = Date.now();
df.nn(process.argv.slice(2), function (err, pt, data) {
    var elapsed = Date.now() - start;
    console.log('nearest:', pt);
    console.log('data: ' + data);
    console.log('query took ' + elapsed + ' ms');
});
