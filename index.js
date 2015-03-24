var fs = require('fs');
var Buffer = require('buffer').Buffer;

module.exports = MDDF;

function MDDF (opts) {
    if (!(this instanceof MDDF)) return new MDDF(opts);
    var self = this;
    this._read = opts.read;
    this._write = opts.write;
    
    this.blksize = opts.blksize || 4096;
    this.dim = opts.dim;
    this.B = Math.floor((this.blksize - 4) / (this.dim * 4 + 4));
    this.size = opts.size || 0;
}

MDDF.prototype.add = function (pt, dataix, cb) {
    if (!cb) cb = function () {};
    var self = this;
    if (!self._write) {
        return cb(new Error('cannot add points: no write function defined'));
    }
    if (typeof data === 'string') {
        data = Buffer(data);
    }
    if (self.dim !== pt.length) {
        return cb(new Error('inconsistent dimension'));
    }
    
    (function next (index, depth) {
        self._readBlock(index, function (err, buf) {
            if (err) return cb(err);
            var len = buf.readUInt32BE(0);
            
            if (len < self.B) {
                // not full, add point
                buf.writeUInt32BE(0, len + 1);
                for (var i = 0; i < pt.length; i++) {
                    buf.writeFloatBE(4 + i * (self.dim * 4 + 4), pt[i]);
                }
                buf.writeUInt32BE(4 + i * (self.dim * 4 + 4), dataix);
                return self._writeBlock(index, buf, cb);
            }
            
            var ix = depth % self.dim;
            var pivot = buf.readFloatBE(4 + ix * (self.dim * 4 + 4));
            
            if (pt[ix] < pivot) {
                next(index * 2 + 1, depth + 1);
            }
            else {
                next((index + 1) * 2, depth + 1);
            }
        });
    })(0, 0);
};

MDDF.prototype._readBlock = function (n, cb) {
    var self = this;
    var offset = n * this.blksize;
    if (offset >= this.size) {
        this.size = (n + 1) * this.blksize;
        var buf = Buffer(this.blksize);
        buf.writeUInt32BE(0, 0);
        return cb(null, buf);
    }
    var buf = Buffer(this.blksize);
    this._read(buf, offset, this.blksize, 0, null, function (err, buf) {
        if (err) return cb(err);
        else cb(err);
    });
};

MDDF.prototype._writeBlock = function (n, buf, cb) {
    this._write(buf, n * this.blksize, this.blksize, cb);
};

MDDF.prototype.knn = function (pt, k, maxDistance, cb) {
    // k closest points
};

MDDF.prototype.nn = function (pt, maxDistance, cb) {
    // closest point to `point`
};

MDDF.prototype.rnn = function (pt, radius, visit) {
};
