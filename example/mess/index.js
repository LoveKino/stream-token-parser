'use strict';

/**
 * if your text is not clean, there are some mess.
 * For example, <div>abc</div>!!<div>def</div> is messed by !! between divs.
 *
 * There is a simple trick to solve this problem, use a "trash" token with lowest priority, see the example
 */

let Parser = require('../..');

Parser.parse('<div>abc</div>!!<div>def</div>', [{
    name: 'start',
    word: /<.*>/,
    isPart: (v) => {
        return v.indexOf('<') === 0 && (v.indexOf('>') === -1 || v.indexOf('>') === v.length - 1) && v.indexOf('</') !== 0;
    }
}, {
    name: 'end',
    word: /<\/.*>/,
    isPart: (v) => {
        return v.indexOf('</') === 0 && (v.indexOf('>') === -1 || v.indexOf('>') === v.length - 1);
    }
}, {
    name: 'content',
    word: /\w*/
}, {
    name: 'trash',
    word: /./,
    priority: -1000
}]);
