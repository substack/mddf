# mddf

multi-dimensional data format with attachments
for proximity search using a kd-b tree

# command example

store data at some points:

```
$ echo cool | mddf -d 3 -f /tmp/wow.mddf put 1 2 3
$ echo beans | mddf -d 3 -f /tmp/wow.mddf put 5 -10 8
$ echo wow | mddf -d 3 -f /tmp/wow.mddf put -20 5 -30
```

search for the nearest neighbor:

```
$ mddf -d 3 -f /tmp/wow.mddf nn -5 3 -15
-20 5 -30
```

fetch data at a point:

```
$ mddf -d 3 -f /tmp/wow.mddf data -20 5 -30
wow
```

# api example

Let's generate 100000 uniformly distributed points in 3d, each with a 100 byte
payload:

``` js
var mddf = require('mddf');
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

var size = 100000;
(function next () {
    if (-- size < 0) {
        return fs.ftruncate(fd, df.size, function () { fs.close(fd) });
    }
    var x = (2*Math.random()-1) * 100;
    var y = (2*Math.random()-1) * 100;
    var z = (2*Math.random()-1) * 100;
    var buf = Buffer(100);
    buf.fill(97 + Math.random()*26);
    df.put([x,y,z], buf, next);
})();
```

We put `100000 * (4*3 + 100) / 1024 / 1024` (10M) in and got a 17M file out:

```
$ ls -sh data.mddf 
17M data.mddf
```

Now we can query for nearest neighbors:

``` js
var mddf = require('mddf');
var fs = require('fs');

var fd = fs.openSync('data.mddf', 'r');
var stat = fs.fstatSync(fd);

var df = mddf({
    blksize: 4096,
    dim: 3,
    size: stat.size,
    read: fs.read.bind(null, fd)
});

var start = Date.now();
df.nn(process.argv.slice(2), function (err, pt, data) {
    var elapsed = Date.now() - start;
    console.log('nearest:', pt);
    console.log('data: ' + data);
    console.log('query took ' + elapsed + ' ms');
});
```

and the nearest neighbor is:

```
$ node nn.js -50 25 100
nearest: [ -48.222816467285156, 22.09300422668457, 95.60971069335938 ]
data: yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
query took 12 ms
```

12 ms! And with no caching of `fs.read()`!

# perf boost

For added performance, cache the calls to `fs.read()` and buffer `fs.write()` in
memory before writing to disk each time.

# limitations

If you try to save a payload that is larger than the block size, bad things will
happen!

This is very alpha quality, mad science code. caveat npmtor.

# methods

``` js
var mddf = require('mddf')
```

## var df = mddf(opts)

## df.put(pt, data, cb)

Insert the point `pt`, an array of floating-point coordinates into the structure
with a payload of `data`, a buffer.

`cb(err)` fires when the operation completes with any errors.

## df.nn(point, cb)

Find the nearest neighbor to `point` as `cb(err, pt, data)`.

# usage

```
mddf OPTIONS nn X Y Z ...

  Search for and print the nearest point to [X Y Z...].

mddf OPTIONS data X Y Z ...

  Write the data at [X Y Z...] to stdout.

mddf OPTIONS put X Y Z ...  

  Put data from stdin into the point at [X Y Z...].

mddf help 

  Show this message.

OPTIONS

  -f FILE  Read and write to an mddf index FILE.
  -b SIZE  Block size. Default: 4096.
  -d DIM   Dimension to use for coordinates.

```

# todo

[static-kdtree](https://npmjs.com/package/static-kdtree) has these other
methods, they are probably worth implementing here:

* range
* rnn
* knn

# data format

This format is provisional and will change to support data payloads larger than
the block size.

## block format

mddf data is arranged into a tree of blocks.
Each block is BLOCKSIZE long.

```
[ ptlen ]
pt0: [ coord0, coord1... coordN ] [ offset0 ]
pt1: [ coord0, coord1... coordN ] [ offset1 ]
pt2: [ coord0, coord1... coordN ] [ offset2 ]
...
ptM: [ coord0, coord1... coordN ] [ offsetM ]

[... unallocated space ...]

dataX: [ DATA, length ]
...
data2: [ DATA, length ]
data1: [ DATA, length ]
data0: [ DATA, length ]
[ datalen ]
```

Point data starts at the beginning of the block:

* ptlen - (uint32be) number of points that follows
* ptM - each point is stored as a collection of M coordinates
* coordN (float32be) - each coordinate is stored as a 32-bit big-endian float
* offsetM (uint32) - offset to corresponding data in this block counting from
the end of the block

Data records start at the end of the block and grow toward the beginning.

Data records do not neceesarily correspond to points of the same index and may
be referenced by completely different blocks. Implementations may prioritize
placing data near points for performance gains.

* data length - (uint32) amount of data in this block
* DATA - the raw bytes to store on this block
* datalen - (uint32) number of data records in this block

## tree structure

The blocks are organized into a KD-B tree with allowances for variable-size
chunks of data to live alongside points. 

When a block is too full, the next block index is chosen by comparing the point
to insert with the first point in the current block at the dimension
`(depth modulo dim)` for the current depth in the tree (starting from zero)
`depth` and the dimension of every point, `dim`.
If less than, select the left child at `(index * 2) + 1`. If greater or equal,
select the right child at `(index + 1) * 2`.

# install

With [npm](https://npmjs.org) do:

```
npm install mddf
```

# license

MIT
