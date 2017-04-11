'use strict';

let {
    parser, MATCH, WAIT, QUIT
} = require('..');

let extractToken = (token) => {
    return {
        text: token.text,
        name: token.tokenType.name
    };
};

describe('json', () => {
    it('string', () => {
        console.log(parser.parse('{"a": 1, "b": "a"}', [{
            priority: 1,
            match: (prefix) => {
                // TODO
                if (/"(([^"\\])|(\\["\\/bfnrt])|(\\u[0-9A-Fa-f]{4}))*"/.test(prefix)) return MATCH;
                return WAIT;
            },
            name: 'string'
        }, {
            priority: 0,
            match: (prefix) => {
                if(/^.$/.test(prefix)) return MATCH;
                return QUIT;
            },
            name: 'trash'
        }]).map(extractToken));
    });
});
