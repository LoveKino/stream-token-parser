'use strict';

let {
    createReadStream
} = require('fs');

let Parser = require('../..');

let readStream = createReadStream(__dirname + '/text.txt');

let log = console.log; // eslint-disable-line

let parse = Parser([{
    word: 'let',
    priority: 9
}, {
    word: 'left',
    priority: 10
}, {
    word: '=',
    priority: 9
}, {
    word: 'export',
    priority: 9
}, {
    word: 'it',
    priority: 9
}, {
    word: ';',
    priority: 9
}, {
    word: /\w+/,
    priority: 8,
    name: 'word'
}, {
    word: /\n/,
    name: 'linefeed'
}, {
    word: /./,
    name: 'trash'
}]);

readStream.on('data', (chunk) => {
    let tokens = parse(chunk);
    tokens.map(({
        text
    }) => {
        log(text);
    });
});

readStream.on('end', () => {
    let tokens = parse(null);
    tokens.map(({
        text
    }) => {
        log(text);
    });
});
