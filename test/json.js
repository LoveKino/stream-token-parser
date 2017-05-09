'use strict';

let {
    parser
} = require('..');

let assert = require('assert');

let extractToken = (token) => {
    return {
        text: token.text,
        name: token.tokenType.name
    };
};

let jsonTokenTypes = require('../apply/jsonTokenTypes');

describe('json', () => {
    it('string', () => {
        assert.deepEqual(
            parser.parse('{"a": 1, "b": "a"}', jsonTokenTypes).map(extractToken), [{
                text: '{',
                name: 'obejctLeftBracket'
            }, {
                text: '"a"',
                name: 'string'
            }, {
                text: ':',
                name: 'mapDelimiter'
            }, {
                text: ' ',
                name: 'whiteSpace'
            }, {
                text: '1',
                name: 'number'
            }, {
                text: ',',
                name: 'comma'
            }, {
                text: ' ',
                name: 'whiteSpace'
            }, {
                text: '"b"',
                name: 'string'
            }, {
                text: ':',
                name: 'mapDelimiter'
            }, {
                text: ' ',
                name: 'whiteSpace'
            }, {
                text: '"a"',
                name: 'string'
            }, {
                text: '}',
                name: 'obejctRightBracket'
            }]
        );
    });
});
