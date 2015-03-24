# mddf

# data format

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

Data records to not neceesarily correspond to points of the same index and may
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

