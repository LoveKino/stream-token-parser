'use strict';

let {
    WAIT, MATCH
} = require('./const');

let filterTypes = (nextLetter, prefix, tokenTypes) => {
    let parts = [],
        matchs = [],
        independentType = null;

    let len = tokenTypes.length;

    for (let i = 0; i < len; i++) {
        let tokenType = tokenTypes[i];
        let ret = tokenType.match(prefix, nextLetter);

        if (ret === WAIT) {
            parts.push(tokenType);
        } else if (ret === MATCH) { // matched
            matchs.push(tokenType);
            parts.push(tokenType);
            if (!independentType && tokenType.independent) {
                independentType = tokenType;
            }
        }
    }

    return [parts, matchs, independentType];
};

let findToken = (retMatrix) => {
    let prev = null;

    for (let i = 0; i < retMatrix.length; i++) {
        let {
            prefix, matchTypes
        } = retMatrix[i];

        for (let j = 0; j < matchTypes.length; j++) {
            let tokenType = matchTypes[j];
            if (!prev ||
                tokenType.priority > prev.tokenType.priority ||
                (tokenType.priority === prev.tokenType.priority && prefix.length > prev.text.length)
            ) {
                prev = {
                    tokenType,
                    text: prefix
                };
            }
        }
    }

    return prev;
};

module.exports = {
    findToken,
    filterTypes
};
