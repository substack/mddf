var Buffer = require('buffer').Buffer;
var pbuf = require('protocol-buffers');

module.exports = MDDF;

function MDDF (opts) {
    if (!(this instanceof MDDF)) return new MDDF(opts);
    this.B = opts.B || 8;
    this._read = opts.read;
    this._write = opts.write;
}

MDDF.prototype.add = function (pt, data, cb) {
    if (!this._write) {
        throw new Error('cannot add points: no write function defined');
    }
    if (typeof data === 'string') {
        data = Buffer(data);
    }
    this._indexOf(pt, function (err, ix) {
        
    });
};

MDDF.prototype._indexOf = function (pt, cb) {
    var self = this;
    this._readBlock(0, function (err, buf) {
        
    });
};

MDDF.prototype._readBlock = function (n, cb) {
};

MDDF.prototype.knn = function (pt, k, maxDistance, cb) {
    // k closest points
};

MDDF.prototype.nn = function (pt, maxDistance, cb) {
    // closest point to `point`
};

MDDF.prototype.rnn = function (pt, radius, visit) {
    
};
