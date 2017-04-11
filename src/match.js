'use strict';

let {
    isString, isFunction
} = require('basetype');

let {
    MATCH, WAIT, QUIT
} = require('./const');

let stringMatch = (word) => (prefix) => {
    if (word === prefix) return MATCH;
    if (word.indexOf(prefix) !== -1) return WAIT;
    return QUIT;
};

let getMatch = (match) => {
    if (isFunction(match)) return match;
    if (isString(match)) return stringMatch(match);
    // TODO analysis regular expression
};

module.exports = {
    getMatch
};
