var mddf = require('../');
var fdstore = require('fd-chunk-store');
var sparse = require('sparse-chunk-store');

var df = mddf({
    size: 4096,
    dim: 3,
    store: sparse(fdstore(4096, 'data.mddf'))
});

var x = process.argv[2];
var y = process.argv[3];
var z = process.argv[4];
var buf = Buffer(process.argv[5]);
df.put([x,y,z],buf);
