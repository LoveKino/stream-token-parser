'use strict';

let {
    isString, funType, listType, isFunction, mapType, isFalsy, isNumber, or, isRegExp
} = require('basetype');

let {
    map, reduce
} = require('bolzano');

/**
 *
 * Token spliter used to split stream.
 *
 * When accept a chunk, parsing it at the same time.
 *
 *
 * tokenTypes = [
 *  {
 *      name,
 *      priority,
 *      word, // string || regular expression || function
 *      isPart // only works when word's type is regular expression or function
 *  }
 * ]
 *
 * 1. priority
 *    Assume we got two types: \w*, \s. When split "today is a good day". If we set \s has a higher priority, we will get ["t", "o", "d", "a", "y", " ", "i", "s", " ", "a", " ", "g", "o", "o", "d", " ", "d", "a", "y"], just one token. If we set \w* has a higher priority, we will get ["today", " ", "is", " ", "a", " ", "good", " ", "day"].
 *
 * 2. isPart string -> boolean
 *     Because we are handling chunks, we need to know finished a chunk or not.
 *
 *
 * eg: four rules a(def, 1), b(default[s?], 2), c(\w\w+, 0), d(_, 2)
 *
 * input     isPart     match
 * d         (a, b, c)  ()
 * de        (a, b, c)  (c:0)
 * def       (a, b, c)  (a:1, c:0)
 * defa      (b, c)     (c:0)
 * defau     (b, c)     (c:0)
 * defaul    (b, c)     (c:0)
 * default   (b, c)     (b:2, c:0)
 * defaults  (b, c)     (b:2, c:0)
 * defaults_ ()         ()
 *
 * empty happend, analysis process.
 *
 * 1. possible situations
 *    de        (a, b, c)  (c:0)
 *    def       (a, b, c)  (a:1, c:0)
 *    defa      (b, c)     (c:0)
 *    defau     (b, c)     (c:0)
 *    defaul    (b, c)     (c:0)
 *    default   (b, c)     (b:2, c:0)
 *    defaults  (b, c)     (b:2, c:0)
 *
 * 2. for any rule (a, b, c) only consider it's biggest matching situation. (longest matching rule)
 *    def       (a, b, c)  (a:1)
 *    defaults  (b, c)     (b:2, c:0)
 *
 * 3. chose the highest priority rule. (priority rule)
 *    defaults (b:2)
 */

let Parser = funType((tokenTypes) => {
    tokenTypes = map(tokenTypes, ({
        priority, word, isPart, name
    }) => {
        if (isString(word)) {
            isPart = stringPart(word);
        }
        if (isRegExp(word) && !isPart) {
            isPart = execReg(word);
        }

        isPart = isPart || isFalsy;

        return {
            priority: priority || 0,
            word,
            name: name || word.toString(),
            match: getMatch(word, isPart),
            isPart
        };
    });

    let stock = '';

    return (chunk) => {
        if (chunk === null) { // means finished
            let tokens = splitTokensToEnd(stock, tokenTypes);

            stock = '';
            return tokens;
        }
        stock += chunk.toString();
        let {
            rest, tokens
        } = splitTokens(stock, tokenTypes);

        stock = rest;

        return tokens;
    };
}, [
    listType(mapType({
        priority: or(isFalsy, isNumber),
        word: or(isString, isFunction, isRegExp, isFalsy),
        isPart: or(isFalsy, isFunction),
        name: or(isFalsy, isString)
    }))
]);

Parser.parse = (str, tokenTypes) => {
    let parser = Parser(tokenTypes);
    return parser(str).concat(parser(null));
};

let splitTokensToEnd = (stock, tokenTypes) => {
    let {
        tokens
    } = splitTokens(stock, tokenTypes, 'end');
    return tokens;
};

let splitTokens = (stock, tokenTypes, type) => {
    let ret;
    let tokens = [];
    while (stock && (ret = getToken(stock, tokenTypes, type))) {
        let {
            token, rest
        } = ret;
        stock = rest;

        tokens.push(token);
    }

    return {
        tokens,
        rest: stock
    };
};

/**
 * type = 'mid' | 'end'
 */
let getToken = (stock, tokenTypes, type = 'mid') => {
    let next = stock;

    let prefix = '';
    let retMatrix = [];

    let fetchToken = () => {
        // empty
        let token = filterToken(retMatrix);
        if (!token) {
            throw new Error(`Can not find token from prefix "${prefix}". And prefix is not any part of token. stock is "${stock}".`);
        }
        return {
            token,
            rest: stock.substring(token.text.length)
        };
    };

    while (next) {
        prefix += next[0];

        // shorten next
        next = next.substring(1);
        let partTypes = getPartTypes(prefix, tokenTypes);
        let matchTypes = getMatchTypes(prefix, tokenTypes);

        if (!partTypes.length && !matchTypes.length) {
            return fetchToken();
        } else {
            retMatrix.push({
                partTypes,
                matchTypes,
                prefix
            });
        }
    }

    if (prefix === stock && type === 'end') { // match stop point
        return fetchToken();
    }

    return null;
};

let filterToken = (retMatrix) => {
    return reduce(retMatrix, (prev, {
        prefix, matchTypes
    }) => {
        return reduce(matchTypes, (pre, tokenType) => {
            if (!prev ||
                // priority rule
                tokenType.priority > pre.tokenType.priority ||
                // longest matching rule
                (tokenType.priority === pre.tokenType.priority && pre.text.length < prefix.length)) {
                return {
                    tokenType,
                    text: prefix
                };
            } else {
                return pre;
            }
        }, prev);
    }, null);
};

let getMatchTypes = (prefix, tokenTypes) => {
    return reduce(tokenTypes, (prev, tokenType) => {
        if (tokenType.match(prefix)) {
            prev.push(tokenType);
        }
        return prev;
    }, []);
};

let getPartTypes = (prefix, tokenTypes) => {
    return reduce(tokenTypes, (prev, tokenType) => {
        if (tokenType.isPart(prefix)) {
            prev.push(tokenType);
        }
        return prev;
    }, []);
};

let stringPart = (word) => (v) => word.indexOf(v) !== -1;

let getMatch = (word, isPart) => {
    let matchFun = null;
    if (isFunction(word)) matchFun = word;
    if (isString(word)) matchFun = (v) => v === word;
    if (isRegExp(word)) matchFun = execReg(word);

    return (v) => {
        if (!isPart(v)) {
            return false;
        }
        if (matchFun) return matchFun(v);
        return true;
    };
};

let execReg = (reg) => (v) => {
    let ret = reg.exec(v);
    if (!ret) return false;
    if (ret[0] !== v) return false;
    return true;
};

module.exports = Parser;
