# mddf

multi-dimensional data format with attachments
for proximity search using a kd-b tree

# motivation

Multidimensional data is important for maps, because you are always
interested in things within a range defined in two or three dimensions
(though mddf can do N dimensions). Many popular methods of storing
map data are not memory efficient, and you must load the entire dataset
into RAM or a specialized heavy database engine before it can be used. mddf
arranges data more sensibly, so it's actually possible to seek into the file,
reading only a small segment, and pull out a collection of nearby points. This
means map programs could load fast, work with massive maps and run on tiny
devices.

There is nothing in mddf that is specifically about maps, but that is the use
case that motivates this work.

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
var fdstore = require('fd-chunk-store');
var sparse = require('sparse-chunk-store');

var df = mddf({
    size: 4096,
    dim: 3,
    store: sparse(fdstore(4096, 'data.mddf'))
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
```

We put `100000 * (4*3 + 100) / 1024 / 1024` (10M) in and got a 17M file out:

```
$ ls -sh data.mddf 
17M data.mddf
```

Now we can query for nearest neighbors:

``` js
var mddf = require('mddf');
var fdstore = require('fd-chunk-store');
var sparse = require('sparse-chunk-store');

var df = mddf({
    size: 4096,
    dim: 3,
    store: sparse(fdstore(4096, 'data.mddf'))
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

# limitations

If you try to save a payload that is larger than the block size, bad things will
happen!

This is very alpha quality, mad science code. caveat npmtor.

# methods

``` js
var mddf = require('mddf')
```

## var df = mddf(opts)

Create an mddf instance `df` given:

* `opts.size` - number of bytes to store per block
* `opts.store` - [abstract-chunk-store](https://github.com/mafintosh/abstract-chunk-store)
storage backend
* `opts.dim` - number of dimensions

It is highly recommended that you wrap `opts.store` with
[sparse-chunk-store](https://npmjs.com/package/sparse-chunk-store)
when you have a store that lays out items sequentially because mddf will
generate somewhat sparse data by default.

## df.put(pt, data, cb)

Insert the point `pt`, an array of floating-point coordinates into the structure
with a payload of `data`, a buffer.

`cb(err)` fires when the operation completes with any errors.

## df.nn(point, cb)

Find the nearest neighbor to `point` as `cb(err, pt, data)`.

## df.knn(k, point, cb)

Find the `k` nearest neighbors to `point` as `cb(err, pts)`.

`pts` will be a `k`-item array with items that have `point` and `data`
properties.

## df.rnn(radius, point, cb)

Find every point within `radius` from `point` as `cb(err, pts)`.

`pts` will be a `k`-item array with items that have `point` and `data`
properties.

## var next = df.near(point)

Return an iterator function `next()` with a stream of nearby points according to
a walk of the underlying kd-b tree. The proximity of the points has more to do
with how the blocks are organized and embodies the storage trade-off of fetching
blocks again.

Call `next(cb)` with a callback that will get called with `cb(err, pt, data)` to
get each point with its data.

# usage

```
mddf OPTIONS nn X Y Z ...

  Search for and print the nearest point to [X Y Z...].

mddf OPTIONS knn X Y Z ...

  Search for and print the k nearest points to [X Y Z...].
 
mddf OPTIONS rnn R X Y Z ...

  Search for and print every point within a radius R from [X Y Z...].

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
