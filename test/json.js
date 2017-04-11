'use strict';

let Spliter = require('..');

let extractToken = (token) => {
    return {
        text: token.text,
        name: token.tokenType.name
    };
};

describe('json', () => {
    it('string', () => {
        console.log(Spliter.parse('{"a": 1, "b": "a"}', [{
            priority: 1,
            word: /"(([^"\\])|(\\["\\/bfnrt])|(\\u[0-9A-Fa-f]{4}))*"/,
            isPart: (prefix) => {},
            name: 'string'
        }, {
            priority: 0,
            word: /./,
            isPart: /./,
            name: 'trash'
        }]).map(extractToken));
    });
});
