#!/usr/bin/env node

var mddf = require('../');
var fs = require('fs');
var path = require('path');

var minimist = require('minimist');
var argv = minimist(process.argv.slice(2), {
    alias: {
        f: 'file',
        s: 'size',
        d: [ 'dim', 'dimension' ],
        h: 'help'
    },
    default: {
        dimension: 3,
        size: 4096
    }
});

var cmd = argv._[0];
if (argv.help || cmd === 'help') return usage(0);
if (!argv.file) return usage(1);

var fdstore = require('fd-chunk-store');
var sparse = require('sparse-chunk-store');
var df = mddf({
    size: argv.size,
    dim: argv.dim,
    store: sparse(fdstore(argv.size, argv.file))
});

if (cmd == 'nn') {
    var xyz = getxyz('nn');
    df.nn(xyz, function (err, pt, data) {
        if (err) return error(err);
        console.log(pt.join(' '));
    });
}
else if (cmd === 'knn') {
    var kxyz = getxyz('knn', 1);
    var k = kxyz[0];
    var xyz = kxyz.slice(1);
    df.knn(k, xyz, function (err, pts) {
        if (err) return error(err);
        for (var i = 0; i < pts.length; i++) {
            console.log(pts[i].point.join(' '));
        }
    });
}
else if (cmd === 'rnn') {
    var rxyz = getxyz('rnn', 1);
    var r = rxyz[0];
    var xyz = rxyz.slice(1);
    df.rnn(r, xyz, function (err, pts) {
        if (err) return error(err);
        for (var i = 0; i < pts.length; i++) {
            console.log(pts[i].point.join(' '));
        }
    });
}
else if (cmd === 'range') {
    var lo = argv.lo.split(' ').map(Number);
    var hi = argv.hi.split(' ').map(Number);
    df.range(lo, hi, function (err, pts) {
        if (err) return error(err);
        for (var i = 0; i < pts.length; i++) {
            console.log(pts[i].point.join(' '));
        }
    });
}
else if (cmd === 'data') {
    var xyz = getxyz('data');
    df.nn(xyz, function (err, pt, data) {
        if (err) error(err);
        else if (eq(xyz, pt)) {
            process.stdout.write(data);
        }
        else error(new Error('point not found'));
    });
}
else if (cmd === 'put') {
    var concat = require('concat-stream');
    var xyz = getxyz('put');
    process.stdin.pipe(concat(function (data) {
        df.put(xyz, data, function (err) {
            if (err) return error(err);
        });
    }));
}

function usage (code) {
    var r = fs.createReadStream(path.join(__dirname, 'usage.txt'));
    r.once('end', function () {
        if (code) process.exit(code);
    });
    r.pipe(process.stdout);
}

function error (err) {
    if (!err) return;
    console.error(err);
    process.exit(1);
}

function getxyz (cmd) {
    var i = process.argv.indexOf(cmd);
    var xyz = process.argv.slice(i+1)
    for (var j = 0; j < xyz.length; j++) {
        if (/^-[A-Za-z]/.test(xyz[j])) {
            return xyz.slice(0, j).map(Number);
        }
    }
    return xyz.map(Number);
}

function eq (a, b) {
    var dim = Math.max(a.length, b.length);
    for (var i = 0; i < dim; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}
