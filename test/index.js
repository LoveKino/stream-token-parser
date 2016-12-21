'use strict';

let Spliter = require('..');

let {
    map
} = require('bolzano');
let assert = require('assert');

let extractToken = (token) => {
    return {
        text: token.text,
        name: token.tokenType.name
    };
};

describe('index', () => {
    it('base', () => {
        let spliter = Spliter([{
            priority: 1,
            word: /\w*/,
            name: 'word'
        }, {
            priority: 0,
            word: /./,
            name: 'trash'
        }]);

        // chunk1
        let tokens1 = spliter('today=is __');
        let tokens2 = spliter('a good day');
        let tokens3 = spliter(null); // null means end of stream

        assert.deepEqual(map(tokens1, extractToken), [{
            text: 'today',
            name: 'word'
        }, {
            text: '=',
            name: 'trash'
        }, {
            text: 'is',
            name: 'word'
        }, {
            text: ' ',
            name: 'trash'
        }]);

        assert.deepEqual(map(tokens2, extractToken), [{
            text: '__a',
            name: 'word'
        }, {
            text: ' ',
            name: 'trash'
        }, {
            text: 'good',
            name: 'word'
        }, {
            text: ' ',
            name: 'trash'
        }]);

        assert.deepEqual(map(tokens3, extractToken), [{
            text: 'day',
            name: 'word'
        }]);
    });

    it('priority', () => {
        assert.deepEqual(map(Spliter.parse('default_', [{
            priority: 10,
            word: 'def'
        }, {
            priority: 8,
            word: 'default'
        }, {
            priority: 0,
            word: /./,
            name: 'trash'
        }]), extractToken), [{
            text: 'def',
            name: 'def'
        }, {
            text: 'a',
            name: 'trash'
        }, {
            text: 'u',
            name: 'trash'
        }, {
            text: 'l',
            name: 'trash'
        }, {
            text: 't',
            name: 'trash'
        }, {
            text: '_',
            name: 'trash'
        }]);

        assert.deepEqual(map(Spliter.parse('default_', [{
            priority: 4,
            word: 'def'
        }, {
            priority: 8,
            word: 'default'
        }, {
            priority: 0,
            word: /./,
            name: 'trash'
        }]), extractToken), [{
            text: 'default',
            name: 'default'
        }, {
            text: '_',
            name: 'trash'
        }]);
    });

    it('longest match rule', () => {
        assert.deepEqual(map(Spliter.parse('todayisagoodday', [{
            word: /\w+/,
            name: 'any word'
        }, {
            word: 'today'
        }]), extractToken), [{
            text: 'todayisagoodday',
            name: 'any word'
        }]);
    });

    it('closing tag', () => {
        assert.deepEqual(map(Spliter.parse('<html>e<body></body></html>', [{
            name: 'start',
            word: /<.*>/,
            priority: 10,
            isPart: (v) => {
                return v.indexOf('<') === 0 && (v.indexOf('>') === -1 || v.indexOf('>') === v.length - 1) && v.indexOf('</') !== 0;
            }
        }, {
            name: 'end',
            word: /<\/.*>/,
            priority: 10,
            isPart: (v) => {
                return v.indexOf('</') === 0 && (v.indexOf('>') === -1 || v.indexOf('>') === v.length - 1);
            }
        }, {
            name: 'trash',
            word: /./,
            priority: 0
        }]), extractToken), [{
            text: '<html>',
            name: 'start'
        }, {
            text: 'e',
            name: 'trash'
        }, {
            text: '<body>',
            name: 'start'
        }, {
            text: '</body>',
            name: 'end'
        }, {
            text: '</html>',
            name: 'end'
        }]);
    });

    it('simple sentence', () => {
        assert.deepEqual(map(Spliter.parse('today is a good day', [{
            word: /\w+/,
            name: 'word'
        }, {
            word: /\s+/,
            name: 'space'
        }]), extractToken), [{
            text: 'today',
            name: 'word'
        }, {
            text: ' ',
            name: 'space'
        }, {
            text: 'is',
            name: 'word'
        }, {
            text: ' ',
            name: 'space'
        }, {
            text: 'a',
            name: 'word'
        }, {
            text: ' ',
            name: 'space'
        }, {
            text: 'good',
            name: 'word'
        }, {
            text: ' ',
            name: 'space'
        }, {
            text: 'day',
            name: 'word'
        }]);
    });

    it('fun', () => {
        assert.deepEqual(map(Spliter.parse('(_01234_ _0123_ _1_', [{
            name: 'len',
            word: (v) => {
                return v[0] === '_' && v[v.length - 1] === '_' && v.length < 8 && v.length > 4;
            },
            isPart: (v) => {
                return v[0] === '_' && v.length < 8;
            }
        }, {
            name: 'trash',
            word: /./
        }]), extractToken), [{
            text: '(',
            name: 'trash'
        }, {
            text: '_01234_',
            name: 'len'
        }, {
            text: ' ',
            name: 'trash'
        }, {
            text: '_0123_',
            name: 'len'
        }, {
            text: ' ',
            name: 'trash'
        }, {
            text: '_',
            name: 'trash'
        }, {
            text: '1',
            name: 'trash'
        }, {
            text: '_',
            name: 'trash'
        }]);
    });

    it('missing isPart', () => {
        assert.deepEqual(map(Spliter.parse('a', [{
            word: () => true
        }, {
            word: /./,
            name: 'trash'
        }]), extractToken), [{
            text: 'a',
            name: 'trash'
        }]);
    });

    it('missing prefix', () => {
        try {
            Spliter.parse('abc(d', [{
                word: /\w+/
            }]);
        } catch (err) {
            assert.equal(err.toString().indexOf('Can not find token from prefix') !== -1, true);
        }
    });

    it('missing word', () => {
        assert.deepEqual(map(Spliter.parse('abc(d', [{
            isPart: (v) => {
                return /^[a-z]+$/.test(v);
            },
            name: 'word'
        }, {
            word: /./,
            name: 'trash'
        }]), extractToken), [{
            text: 'abc',
            name: 'word'
        }, {
            text: '(',
            name: 'trash'
        }, {
            text: 'd',
            name: 'trash'
        }]);
    });

    it('independent', () => {
        let spliter = Spliter([{
            word: /\w+/,
            name: 'word'
        }, {
            word: /\n/,
            name: 'linefeed',
            independent: true
        }]);

        let rets = spliter('abc\n');
        assert.deepEqual(map(rets, extractToken), [{
            text: 'abc',
            name: 'word'
        }, {
            text: '\n',
            name: 'linefeed'
        }]);
    });

    it('independent:2', () => {
        let spliter = Spliter([{
            word: /\w+/,
            name: 'word'
        }, {
            word: /\n/,
            name: 'linefeed',
            independent: true
        }]);

        let rets = spliter('abc\n\ncde');
        assert.deepEqual(map(rets, extractToken), [{
            text: 'abc',
            name: 'word'
        }, {
            text: '\n',
            name: 'linefeed'
        }, {
            text: '\n',
            name: 'linefeed'
        }]);
    });
});
