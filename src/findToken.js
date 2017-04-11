'use strict';

let {
    find
} = require('bolzano');

let {
    WAIT, MATCH
} = require('./const');

let filterTypes = (prefix, tokenTypes) => {
    let parts = [],
        matchs = [];
    for (let i = 0; i < tokenTypes.length; i++) {
        let tokenType = tokenTypes[i];
        let ret = tokenType.match(prefix);
        if (ret === WAIT) {
            parts.push(tokenType);
        } else if (ret === MATCH) {
            matchs.push(tokenType);
            parts.push(tokenType);
        }
    }

    return [parts, matchs];
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

let findIndependentTokenType = (matchTypes) => {
    // see if there is a independent token type
    // find independent token
    return find(matchTypes, {
        independent: true
    }, {
        eq: (v1, v2) => v1.independent === v2.independent
    });
};

module.exports = {
    findToken,
    filterTypes,
    findIndependentTokenType
};
