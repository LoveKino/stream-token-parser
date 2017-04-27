'use strict';

const START_STATE = '__start__state__';

let {
    stateGraphDSL, DFA
} = require('./fsm');

/**
 * build a fda to do the matching work
 *
 * transit: (currentState, letter) -> nextState
 */
module.exports = (stateMap, accepts) => {
    let m = null;

    // parse stateMap
    let {
        transitions, acceptStateMap
    } = stateGraphDSL.transitionMaper(
        stateGraphDSL.g(START_STATE,
            stateGraphDSL.c(null, stateMap)),
        accepts);

    return (prefix, letter) => {
        if (prefix.length === 1) {
            m = new DFA(transitions, acceptStateMap);
            return m.transit(letter).type;
        } else {
            return m.transit(letter).type;
        }
    };
};
