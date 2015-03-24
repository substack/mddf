# mddf

# data format

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

dataX: [ DATA, length, next block, next offset ]
...
data2: [ DATA, length, next block, next offset ]
data1: [ DATA, length, next block, next offset ]
data0: [ DATA, length, next block, next offset ]
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
* data next block - (uint32) location of the next block of data or 0 if none
* data next offset - (uint32) offset of the next data block in the next block,
counting from the end of the block as 0
* DATA - the raw bytes to store on this block

