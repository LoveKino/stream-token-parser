# stream-token-parser

[中文文档](./README_zh.md)   [document](./README.md)

Token parser designed based on stream property. Accept chunk string and parse it into tokens simultaneously.
- [install](#install)
- [usage](#usage)
  * [API quick run](#api-quick-run)
- [develop](#develop)
  * [file structure](#file-structure)
  * [run tests](#run-tests)
- [license](#license)

## install

`npm i stream-token-parser --save` or `npm i stream-token-parser --save-dev`

Install on global, using `npm i stream-token-parser -g`



## usage








### API quick run



```js
let streamTokenSpliter = require('stream-token-parser')
let {
    parser, WAIT, QUIT, MATCH
} = streamTokenSpliter;

let spliter = parser([{
    priority: 1,
    match: (prefix) => {
        if (/^\w*$/.test(prefix)) return MATCH;
        return QUIT;
    },
    name: 'word'
}, {
    priority: 0,
    match: (prefix) => {
        if (/^.$/.test(prefix)) return MATCH;
        return QUIT;
    },
    name: 'trash'
}]);

let tokens1 = spliter('today=is __'); // chunk1
let tokens2 = spliter('a good day'); // chunk2
let tokens3 = spliter(null); // null means end of stream

console.log(tokens1);
console.log('\n');
console.log(tokens2);
console.log('\n');
console.log(tokens3);
```

```
output

    [ { tokenType: 
         { priority: 1,
           name: 'word',
           match: [Function: match],
           independent: undefined },
        text: 'today' },
      { tokenType: 
         { priority: 0,
           name: 'trash',
           match: [Function: match],
           independent: undefined },
        text: '=' },
      { tokenType: 
         { priority: 1,
           name: 'word',
           match: [Function: match],
           independent: undefined },
        text: 'is' },
      { tokenType: 
         { priority: 0,
           name: 'trash',
           match: [Function: match],
           independent: undefined },
        text: ' ' } ]
    
    
    [ { tokenType: 
         { priority: 1,
           name: 'word',
           match: [Function: match],
           independent: undefined },
        text: '__a' },
      { tokenType: 
         { priority: 0,
           name: 'trash',
           match: [Function: match],
           independent: undefined },
        text: ' ' },
      { tokenType: 
         { priority: 1,
           name: 'word',
           match: [Function: match],
           independent: undefined },
        text: 'good' },
      { tokenType: 
         { priority: 0,
           name: 'trash',
           match: [Function: match],
           independent: undefined },
        text: ' ' } ]
    
    
    [ { tokenType: 
         { priority: 1,
           name: 'word',
           match: [Function: match],
           independent: undefined },
        text: 'day' } ]

```


## develop

### file structure

```
.    
│──LICENSE    
│──README.md    
│──README_zh.md    
│──apply    
│   └──jsonTokenTypes.js    
│──bin    
│──coverage    
│   │──coverage.json    
│   │──lcov-report    
│   │   │──base.css    
│   │   │──index.html    
│   │   │──prettify.css    
│   │   │──prettify.js    
│   │   │──sort-arrow-sprite.png    
│   │   │──sorter.js    
│   │   └──stream-token-parser    
│   │       │──apply    
│   │       │   │──index.html    
│   │       │   └──jsonTokenTypes.js.html    
│   │       │──index.html    
│   │       └──index.js.html    
│   └──lcov.info    
│──example    
│   └──mess    
│       └──index.js    
│──index.js    
│──package.json    
└──src    
    │──buildFSM.js    
    │──const.js    
    │──findToken.js    
    │──index.js    
    └──match.js     
```


### run tests

`npm test`

## license

MIT License

Copyright (c) 2016 chenjunyu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
