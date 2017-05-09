'use strict';

/**
 *
 * @readme-quick-run
 *
 * ## test tar=js r_c=streamTokenSpliter
 *
 * let {
 *     parser, WAIT, QUIT, MATCH
 * } = streamTokenSpliter;

 * let spliter = parser([{
 *     priority: 1,
 *     match: (prefix) => {
 *         if (/^\w*$/.test(prefix)) return MATCH;
 *         return QUIT;
 *     },
 *     name: 'word'
 * }, {
 *     priority: 0,
 *     match: (prefix) => {
 *         if (/^.$/.test(prefix)) return MATCH;
 *         return QUIT;
 *     },
 *     name: 'trash'
 * }]);
 *
 * let tokens1 = spliter('today=is __'); // chunk1
 * let tokens2 = spliter('a good day'); // chunk2
 * let tokens3 = spliter(null); // null means end of stream
 *
 * console.log(tokens1);
 * console.log('\n');
 * console.log(tokens2);
 * console.log('\n');
 * console.log(tokens3);
 */
module.exports = require('./src');
