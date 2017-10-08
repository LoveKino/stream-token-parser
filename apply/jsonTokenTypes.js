'use strict';

const {
    jsonStringExpStr,
    jsonNumberExpStr
} = require('cl-fsm/lib/commonTokenReg');

const {
    buildFSM
} = require('..');

const whiteSpace = '[\\f\\n\\r\\t ]';
/*
const whiteSpace = union(' ', '\f', '\n', '\r', '\t', '\v', '\u00a0', '\u1680', '\u180e', '\u2000-', '\u200a', '\u2028', '\u2029', '\u202f', '\u205f', '\u3000', '\ufeff');
*/

module.exports = [{
    priority: 1,
    match: buildFSM(jsonStringExpStr),
    name: 'string'
}, {
    priority: 1,
    match: buildFSM(jsonNumberExpStr),
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
    match: ',',
    name: 'comma'
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
    match: buildFSM(whiteSpace),
    name: 'whiteSpace'
}];
