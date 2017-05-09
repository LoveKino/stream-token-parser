# stream-token-parser

[中文文档](./README_zh.md)   [document](./README.md)

基于流特性设计的token解析器，接受一个chunk的字符串，同时解析成tokens。
- [安装](#%E5%AE%89%E8%A3%85)
- [使用方法](#%E4%BD%BF%E7%94%A8%E6%96%B9%E6%B3%95)
  * [API 快速运行](#api-%E5%BF%AB%E9%80%9F%E8%BF%90%E8%A1%8C)
- [开发](#%E5%BC%80%E5%8F%91)
  * [文件结构](#%E6%96%87%E4%BB%B6%E7%BB%93%E6%9E%84)
  * [运行测试用例](#%E8%BF%90%E8%A1%8C%E6%B5%8B%E8%AF%95%E7%94%A8%E4%BE%8B)
- [许可证](#%E8%AE%B8%E5%8F%AF%E8%AF%81)

## 安装

`npm i stream-token-parser --save` 或者 `npm i stream-token-parser --save-dev`

全局安装, 使用 `npm i stream-token-parser -g`



## 使用方法








### API 快速运行



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
输出

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


## 开发

### 文件结构

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


### 运行测试用例

`npm test`

## 许可证

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
