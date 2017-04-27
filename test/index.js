'use strict';

let {
    parser, WAIT, QUIT, MATCH
} = require('..');

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
        let spliter = parser([{
            priority: 1,
            match: (prefix) => {
                if (/^\w*$/.test(prefix)) return MATCH;
                return QUIT;
            },
            name: 'word'
        }, {
            priority: 0,
            match: (prefix) => {
                if (/^.$/.test(prefix)) return MATCH;
                return QUIT;
            },
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
        assert.deepEqual(map(parser.parse('default_', [{
            priority: 10,
            match: 'def',
            name: 'def'
        }, {
            priority: 8,
            match: 'default'
        }, {
            priority: 0,
            match: (prefix) => {
                if (/^.$/.test(prefix)) return MATCH;
                return QUIT;
            },
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

        assert.deepEqual(map(parser.parse('default_', [{
            priority: 4,
            match: 'def'
        }, {
            priority: 8,
            match: 'default'
        }, {
            priority: 0,
            match: (prefix) => {
                if (/^.$/.test(prefix)) return MATCH;
                return QUIT;
            },
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
        assert.deepEqual(map(parser.parse('todayisagoodday', [{
            match: (prefix) => {
                if (/^\w+$/.test(prefix)) return MATCH;
                return QUIT;
            },
            name: 'any word'
        }, {
            match: 'today'
        }]), extractToken), [{
            text: 'todayisagoodday',
            name: 'any word'
        }]);
    });

    it('closing tag', () => {
        assert.deepEqual(map(parser.parse('<html>e<body></body></html>', [{
            name: 'start',

            match: (v) => {
                if (v === '<') return WAIT;
                if (/^<[^/][^>]*$/.test(v)) return WAIT;
                if (/^<[^/].*>$/.test(v)) return MATCH;
                return QUIT;
            },

            priority: 10,
        }, {
            name: 'end',
            priority: 10,
            match: (v) => {
                if (v === '<') return WAIT;
                if (/^<\/[^>]*$/.test(v)) return WAIT;
                if (/^<\/.*>$/.test(v)) return MATCH;
                return QUIT;
            }
        }, {
            name: 'trash',
            match: (v) => {
                if (/^.$/.test(v)) {
                    return MATCH;
                }
                return QUIT;
            },
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
        assert.deepEqual(map(parser.parse('today is a good day', [{
            match: (v) => {
                if (/^\w+$/.test(v)) return MATCH;
                return QUIT;
            },
            name: 'word'
        }, {
            match: (v) => {
                if (/^\s+$/.test(v)) return MATCH;
                return QUIT;
            },
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
        assert.deepEqual(map(parser.parse('(_01234_ _0123_ _1_', [{
            name: 'len',
            match: (v) => {
                if (v === '_') return WAIT;
                if (v[0] === '_' && v.length < 8 && v[v.length - 1] !== '_') return WAIT;
                if (v[0] === '_' && v[v.length - 1] === '_' && v.length < 8 && v.length > 4) return MATCH;
                return QUIT;
            }
        }, {
            name: 'trash',
            match: (v) => {
                if (/^.$/.test(v)) return MATCH;
                return QUIT;
            }
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

    it('missing match', (done) => {
        try {
            parser.parse('a', [{}]);
        } catch (err) {
            assert.equal(err.toString().indexOf('Error match in token type') !== -1, true);
            done();
        }
    });

    it('missing prefix', () => {
        try {
            parser.parse('abc(d', [{
                match: (v) => {
                    if (/\w+/.test(v)) return MATCH;
                    return QUIT;
                }
            }]);
        } catch (err) {
            assert.equal(err.toString().indexOf('Can not find token from prefix') !== -1, true);
        }
    });

    it('missing word', () => {
        assert.deepEqual(map(parser.parse('abc(d', [{
            match: (v) => {
                if (/^[a-z]+$/.test(v)) return MATCH;
                return QUIT;
            },
            name: 'word'
        }, {
            match: (v) => {
                if (/^.$/.test(v)) return MATCH;
                return QUIT;
            },
            name: 'trash'
        }]), extractToken), [{
            text: 'abc',
            name: 'word'
        }, {
            text: '(',
            name: 'trash'
        }, {
            text: 'd',
            name: 'word'
        }]);
    });

    it('independent', () => {
        let spliter = parser([{
            match: (v) => {
                if (/^\w+$/.test(v)) return MATCH;
                return QUIT;
            },
            name: 'word'
        }, {
            match: (v) => {
                if (/^\n$/.test(v)) return MATCH;
                return QUIT;
            },
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
        let spliter = parser([{
            match: (v) => {
                if (/^\w+$/.test(v)) return MATCH;
                return QUIT;
            },

            name: 'word'
        }, {
            match: (v) => {
                if (/^\n$/.test(v)) return MATCH;
                return QUIT;
            },

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
