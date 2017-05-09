'use strict';

let {
    stringGraph, numberGraph
} = require('cl-fsm/apply/json');

let {
    buildFSM
} = require('..');

let FSM = require('cl-fsm');
let {
    stateGraphDSL
} = FSM;

let {
    g, c, union
} = stateGraphDSL;

let whiteSpace = union(' ', '\f', '\n', '\r', '\t', '\v', '\u00a0', '\u1680', '\u180e', '\u2000-', '\u200a', '\u2028', '\u2029', '\u202f', '\u205f', '\u3000', '\ufeff');

module.exports = [{
    priority: 1,
    match: buildFSM(stringGraph),
    name: 'string'
}, {
    priority: 1,
    match: buildFSM(numberGraph),
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
    match: buildFSM(g(
        c(whiteSpace)
    )),
    name: 'whiteSpace'
}];
