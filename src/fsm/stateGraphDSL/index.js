'use strict';

let {
    isString, isObject
} = require('basetype');

let actionDSL = require('./actionDSL');

let {
    toAction, isNormalAction, isRangeAction, isUnionAction, isLeftAction, isEpsilonAction
} = actionDSL;

let {
    mergeMap
} = require('bolzano');

/**
 * graph definition DSL
 *
 * state    action
 *
 * transition: (startState, action, nextState)
 *
 */

/**
 * graph(s1,
 *     connect(a1, graph(s2,
 *         connect(a3, s4),
 *         connect(a4, s5)
 *     )),
 *
 *     connect(a2, s3)
 *  )
 */

let count = 0;
let autoGraphState = () => {
    return `__auto_state_name_${count++}`;
};

/**
 * graph data = {
 *    transitions: [
 *      [action, nextGraph]
 *    ],
 *    state
 * }
 */
let graph = (...args) => {
    let state = null,
        lines = null;

    if (isString(args[0])) {
        state = args[0];
        lines = args.slice(1);
    } else {
        state = autoGraphState();
        lines = args;
    }

    let transitionMap = {};

    transitionMap[state] = [];

    for (let i = 0; i < lines.length; i++) {
        let {
            action, nextGraph
        } = lines[i];

        let nextState = isString(nextGraph) ? nextGraph : nextGraph.state;

        transitionMap[state].push({
            action,
            state: nextState
        });

        // merge transitionMap
        for (let name in nextGraph.transitionMap) {
            if (transitionMap[name]) {
                throw new Error(`repeated state name for different state, name is ${name}`);
            }
            transitionMap[name] = nextGraph.transitionMap[name];
        }
    }

    return {
        state,
        transitionMap
    };
};

let connect = (action, nextGraph) => {
    action = toAction(action);
    return {
        action,
        nextGraph
    };
};

/**
 * circle: repeat at least 0 times
 */
let circle = (action, nextGraph) => {
    let stateName = autoGraphState();

    return graph(stateName,
        connect(action, stateName),
        connect(null, nextGraph)
    );
};

let repeat = (action, times, nextGraph) => {
    let args = [];
    for (let i = 0; i < times; i++) {
        args.push(action);
    }
    args.push(nextGraph);

    return sequence(...args);
};

let sequence = (...args) => {
    let actions = args.slice(0, -1);
    let nextGraph = args[args.length - 1];
    let action = actions[0];
    if (actions.length <= 1) {
        return connect(action, nextGraph);
    }

    let nexts = actions.slice(1).concat([nextGraph]);

    return connect(action, graph(sequence(...nexts)));
};

let transitionMaper = (graph, accepts) => {
    let transitions = {};
    let {
        transitionMap
    } = graph;

    let leftMap = getLeftActionMap(transitionMap);
    let epsilonMap = getEpsilonActionMap(transitionMap);

    for (let stateName in transitionMap) {
        let transitList = transitionMap[stateName];

        transitions[stateName] = (letter) => {
            for (let i = transitList.length - 1; i >= 0; i--) {
                let {
                    state, action
                } = transitList[i];

                if (matchAction(action, letter)) return state;
            }

            // check rest
            if (leftMap[stateName]) return leftMap[stateName];

            if (epsilonMap[stateName]) {
                return {
                    type: 'deliver',
                    state: epsilonMap[stateName]
                };
            }
        };
    }

    return {
        transitions,
        acceptStateMap: getAcceptStateMap(epsilonMap, accepts)
    };
};

let getAcceptStateMap = (epsilonMap, accepts) => {
    let acceptStateMap = {};

    let reverseEpsilonMap = {};
    for (let name in epsilonMap) {
        let tar = epsilonMap[name];
        reverseEpsilonMap[tar] = reverseEpsilonMap[tar] || [];
        reverseEpsilonMap[tar].push(name);
    }
    for (let i = 0; i < accepts.length; i++) {
        let accept = accepts[i];
        acceptStateMap[accept] = true;
        if (reverseEpsilonMap[accept]) {
            acceptStateMap[reverseEpsilonMap[accept]] = true;
        }
    }

    return acceptStateMap;
};

let isEpsilonTransition = (v) => {
    return isObject(v) && v.type === 'deliver';
};

let matchAction = (action, letter) => {
    if (isNormalAction(action) && action.content === letter) return true;
    if (isRangeAction(action) && action.start <= letter && letter <= action.end) return true;
    if (isUnionAction(action)) {
        let {
            actions
        } = action;
        for (let i = 0; i < actions.length; i++) {
            if (matchAction(actions[i], letter)) return true;
        }
    }

    return false;
};

let getEpsilonActionMap = (transitionMap) => {
    let map = {};

    for (let stateName in transitionMap) {
        let transitList = transitionMap[stateName];
        let tarState = findActionState(transitList, isEpsilonAction);
        if (tarState) {
            map[stateName] = tarState;
        }
    }

    return map;
};

let getLeftActionMap = (transitionMap) => {
    let map = {};
    for (let stateName in transitionMap) {
        let transitList = transitionMap[stateName];
        let tarState = findActionState(transitList, isLeftAction);
        if (tarState) {
            map[stateName] = tarState;
        }
    }
    return map;
};

let findActionState = (transitList, type) => {
    for (let i = transitList.length - 1; i >= 0; i--) {
        let {
            action, state
        } = transitList[i];
        if (type(action)) {
            return state;
        }
    }
};

module.exports = mergeMap(actionDSL, {
    graph,
    connect,

    transitionMaper,
    repeat,
    sequence,

    circle,

    isEpsilonTransition,

    g: graph, c: connect
});
