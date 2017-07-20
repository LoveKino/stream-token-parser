'use strict';

let assembleToken = (tokenType, prefix) => {
    return {
        tokenType,
        name: tokenType.name,
        text: prefix
    };
};

module.exports = {
    assembleToken
};
