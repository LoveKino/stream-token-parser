'use strict';

let {
    isString, funType, listType, isFunction, mapType, isFalsy, isNumber, or
} = require('basetype');

let {
    WAIT, MATCH, QUIT
} = require('./const');

let {
    map
} = require('bolzano');

let {
    getMatch
} = require('./match');

let {
    findToken,
    filterTypes
} = require('./findToken');

/**
 *
 * A token spliter used to split stream string.
 *
 * When accept a chunk, parsing it at the same time.
 *
 * ## options
 *
 * tokenTypes = [
 *  {
 *      name,
 *      priority,
 *      match
 *  }
 * ]
 *
 * - priority
 *
 *    When meets ambiguity, priority will be helpful.
 *
 *    Assume we got two types: \w*, \s. When split "today is a good day". If we set \s has a higher priority, we will get ["t", "o", "d", "a", "y", " ", "i", "s", " ", "a", " ", "g", "o", "o", "d", " ", "d", "a", "y"], just one token. If we set \w* has a higher priority, we will get ["today", " ", "is", " ", "a", " ", "good", " ", "day"].
 *
 * - match (letter, prefix) -> WAIT | MATCH | QUIT
 *
 *     Because we are handling chunks, we need to know finished a chunk or not.
 *
 * ## rules
 *
 * - priority rule
 *
 * - longest matching
 *
 * eg: four rules a(def, 1), b(default[s?], 2), c(/\w\w+/, 0), d(_, 2)
 *
 * ```
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
 * ```
 *
 * When empty situation happend, analysis the process.
 *
 * ```
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
 * ```
 */

let parser = funType((tokenTypes) => {
    tokenTypes = map(tokenTypes, (tokenType) => {
        let {
            priority, name, independent, match
        } = tokenType;

        name = name || (match && match.toString());

        match = getMatch(match);

        if (!isFunction(match)) {
            throw new Error(`Error match in token type ${strTokenType(tokenType)}`);
        }

        return {
            priority: priority || 0,
            name: name,
            match,
            independent
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
        name: or(isFalsy, isString)
    }))
]);

let strTokenType = ({
    priority, match, name, independent
}) => {
    return `{
        priority: ${priority},
        match: ${match},
        name: ${name},
        independent: ${independent}
    }`;
};

parser.parse = (str, tokenTypes) => {
    let parse = parser(tokenTypes);
    return parse(str).concat(parse(null));
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

    while (next) {
        prefix += next[0];

        // shorten next
        next = next.substring(1);
        let [partTypes, matchTypes, independentType] = filterTypes(prefix, tokenTypes);

        // see if there is a independent token type
        // find independent token

        if (independentType) {
            return splitTokenRet(
                assembleToken(independentType, prefix),
                stock
            );
        }

        // obey longest match rule
        // no matchs futher, means look forward more won't get any matchs
        if (!partTypes.length && !matchTypes.length) {
            return fetchToken(stock, retMatrix, prefix);
        } else {
            retMatrix.push({
                partTypes,
                matchTypes,
                prefix
            });
        }
    }

    // if this is end, fetchToken
    if (prefix === stock && type === 'end') { // match stop point
        return fetchToken(stock, retMatrix, prefix);
    }

    return null;
};

let fetchToken = (stock, retMatrix, prefix) => {
    // empty
    let token = findToken(retMatrix);
    if (!token) {
        throw new Error(`Can not find token from prefix "${prefix}". And prefix is not any part of token. stock is "${stock}".`);
    }
    return splitTokenRet(token, stock);
};

let splitTokenRet = (token, stock) => {
    return {
        token,
        rest: stock.substring(token.text.length)
    };
};

let assembleToken = (tokenType, prefix) => {
    return {
        tokenType,
        text: prefix
    };
};

module.exports = {
    parser, WAIT, QUIT, MATCH
};
