var traversal = require('../lib/traversal.js');
var test = require('tape');

test('proximity traversal', function (t) {
    t.plan(18);
    var next = traversal(9, 15);
    t.equal(next(), 9);
    t.equal(next(), 4);
    t.equal(next(), 1);
    t.equal(next(), 10);
    t.equal(next(), 0);
    t.equal(next(), 3);
    t.equal(next(), 2);
    t.equal(next(), 7);
    t.equal(next(), 8);
    t.equal(next(), 5);
    t.equal(next(), 6);
    t.equal(next(), 11);
    t.equal(next(), 12);
    t.equal(next(), 13);
    t.equal(next(), 14);
    t.equal(next(), null);
    t.equal(next(), null);
    t.equal(next(), null);
});
