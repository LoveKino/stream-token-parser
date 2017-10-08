'use strict';

let {
    RegularExp
} = require('cl-fsm');

let {
    WAIT,
    QUIT,
    MATCH
} = require('./const');

/**
 * build a fda to do the matching work
 *
 * transit: (currentState, letter) -> nextState
 */
module.exports = (regularExpStr) => {
    let regExp = new RegularExp(regularExpStr);

    let state = -1;

    return (prefix, letter) => {
        if (prefix.length === 1) {
            state = regExp.getStartState();
        }

        let nextState = regExp.transit(state, letter);
        if (regExp.isEndState(nextState)) {
            state = nextState;
            return MATCH;
        } else if (regExp.isErrorState(nextState)) {
            return QUIT;
        } else {
            state = nextState;
            return WAIT;
        }
    };
};
