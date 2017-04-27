'use strict';

let {
    fsm, stateGraphDSL
} = require('../../src/fsm');

let assert = require('assert');

let {
    g, c, repeat, union, left, range, sequence, circle
} = stateGraphDSL;

let {
    QUIT, WAIT, MATCH
} = require('../../src/const');

describe('fsm', () => {
    it('base', () => {
        let m = fsm(g(c('a', 'accept')), ['accept']);
        assert.equal(m('a').type, MATCH);
        assert.equal(m('b').type, QUIT);
    });

    it('two', () => {
        let m = fsm(g(
            c('a', g(
                c('b', 'accept')
            ))
        ), ['accept']);
        assert.equal(m('a').type, WAIT);
        assert.equal(m('b').type, MATCH);
    });

    it('left', () => {
        let m = fsm(g(
            c('a', 'state1'),
            c(left(), 'state2')
        ), ['accept']);
        assert.equal(m('a').state, 'state1');
    });

    it('left2', () => {
        let m = fsm(g(
            c('a', 'state1'),
            c(left(), 'state2')
        ), ['accept']);
        assert.equal(m('b').state, 'state2');
    });

    it('range', () => {
        assert.equal(fsm(g(
            c(range('1', '9'), 'go')
        ), ['accept'])('1').state, 'go');

        assert.equal(fsm(g(
            c(range('1', '9'), 'go')
        ), ['accept'])('5').state, 'go');

        assert.equal(fsm(g(
            c(range('1', '9'), 'go')
        ), ['accept'])('9').state, 'go');

        assert.equal(fsm(g(
            c(range('1', '9'), 'go')
        ), ['accept'])('a').type, QUIT);
    });

    it('epsilon', () => {
        assert.deepEqual(fsm(g(
            c(null, g(
                c('b', 'accept')
            )),
            c('a', 'go')
        ), ['accept'])('a'), {
            type: WAIT,
            state: 'go'
        });

        assert.deepEqual(fsm(g(
            c(null, g(
                c('b', 'accept')
            )),
            c('a', 'go')
        ), ['accept'])('b'), {
            type: MATCH,
            state: 'accept'
        });

        assert.deepEqual(fsm(g(
            c(null, g(
                c('b', 'accept')
            )),
            c('a', 'go')
        ), ['accept'])('c').type, QUIT);
    });

    it('union', () => {
        assert.deepEqual(fsm(g(
            c(union('a', 'b'), 'accept')
        ), ['accept'])('a'), {
            type: MATCH,
            state: 'accept'
        });

        assert.deepEqual(fsm(g(
            c(union('a', 'b'), 'accept')
        ), ['accept'])('b'), {
            type: MATCH,
            state: 'accept'
        });

        assert.deepEqual(fsm(g(
            c(union('a', 'b'), 'accept')
        ), ['accept'])('c').type, QUIT);
    });

    it('repeat', () => {
        let m = fsm(g(
            repeat('a', 3, g('accept'))
        ), ['accept']);

        assert.deepEqual(m('a').type, WAIT);
        assert.deepEqual(m('a').type, WAIT);
        assert.deepEqual(m('a').type, MATCH);
        assert.deepEqual(m('a').type, QUIT);
    });

    it('sequence', () => {
        let m = fsm(g(
            sequence('a', 'b', 'c', g('accept'))
        ), ['accept']);

        assert.deepEqual(m('a').type, WAIT);
        assert.deepEqual(m('b').type, WAIT);
        assert.deepEqual(m('c').type, MATCH);
        assert.deepEqual(m('d').type, QUIT);
    });

    it('circle', () => {
        let m = fsm(circle('a', g('accept')), ['accept']);

        for (let i = 0; i < 10; i++) {
            assert.deepEqual(m('a').type, MATCH);
        }
    });
});
