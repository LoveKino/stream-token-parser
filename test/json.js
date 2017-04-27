'use strict';

let {
    parser, buildFSM, stateGraphDSL
} = require('..');

let {
    g, c, repeat, union, left, range, sequence, circle
} = stateGraphDSL;

let assert = require('assert');

let extractToken = (token) => {
    return {
        text: token.text,
        name: token.tokenType.name
    };
};

let hexDigit = union(range('0', '9'), range('A', 'F'), range('a', 'f'));

let escapeSymbols = union('\"', '\\', '\/', 'b', 'f', 'n', 'r', 't');

let whiteSpace = union(' ', '\f', '\n', '\r', '\t', '\v', '\u00a0', '\u1680', '\u180e', '\u2000-', '\u200a', '\u2028', '\u2029', '\u202f', '\u205f', '\u3000', '\ufeff');

let stringDFA = buildFSM(g(
    c('"', g('enter',
        c('\\', g(
            c(escapeSymbols, 'enter'),
            c('u',
                repeat(hexDigit, 4, 'enter')
            ))),
        c('"', 'accept'),
        c(left(), 'enter')
    ))), ['accept']);

// TODO accept transitivity by epsilon
let numberDFA = buildFSM(g(
    c(union(null, '-'),
        g(
            c('0', g('decimal',
                c(null, g('science',
                    c(null, 'accept'),
                    sequence(
                        union('e', 'E'),
                        union('+', '-', null),
                        circle(range('0', '9'), 'accept')
                    )
                )),
                c('.', circle(range('0', '9'), 'science'))
            )),

            c(range('1', '9'), circle(range('0', '9'), 'decimal'))
        )
    )
), ['accept']);

let jsonTokenTypes = [{
    priority: 1,
    match: stringDFA,
    name: 'string'
}, {
    priority: 1,
    match: numberDFA,
    name: 'number'
}, {
    priority: 1,
    match: '{',
    name: 'obejctLeftBracket'
}, {
    priority: 1,
    match: '}',
    name: 'obejctRightBracket'
}, {
    priority: 1,
    match: '[',
    name: 'arrayLeftBracket'
}, {
    priority: 1,
    match: ']',
    name: 'arrayRightBracket'
}, {
    priority: 1,
    match: ':',
    name: 'mapDelimiter'
}, {
    priority: 1,
    match: 'true',
    name: 'true'
}, {
    priority: 1,
    match: 'false',
    name: 'false'
}, {
    priority: 1,
    match: 'null',
    name: 'null'
}, {
    priority: 1,
    match: buildFSM(g(
        c(whiteSpace, 'accept')
    ), ['accept']),
    name: 'whiteSpace'
}];

describe('json', () => {
    it('string', () => {
        assert.deepEqual(
            parser.parse('{"a": 1, "b": "a"}', jsonTokenTypes).map(extractToken),

            [{
                text: '{',
                name: 'trash'
            }, {
                text: '"a"',
                name: 'string'
            }, {
                text: ':',
                name: 'trash'
            }, {
                text: ' ',
                name: 'trash'
            }, {
                text: '1',
                name: 'trash'
            }, {
                text: ',',
                name: 'trash'
            }, {
                text: ' ',
                name: 'trash'
            }, {
                text: '"b"',
                name: 'string'
            }, {
                text: ':',
                name: 'trash'
            }, {
                text: ' ',
                name: 'trash'
            }, {
                text: '"a"',
                name: 'string'
            }, {
                text: '}',
                name: 'trash'
            }]
        );
    });
});
