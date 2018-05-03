"use strict"

var learningRate = 0.8;
var propabilityHeads = 0.4;
var propabilityTails = 1.0 - propabilityHeads;
var numStates = 101;
var deltaThreshold = 0.01;

var stateValues = Array(numStates);

function initStateValues() {
    for (let i = 0; i < numStates; i++)
        stateValues[i] = 0.5;

    stateValues[0] = 0;
    stateValues[numStates - 1] = 0;
}

function reward(state) {
    return state === 100 ? 1 : 0;
}

function maxActionValue(state) {
    let availableActions = Math.min(state, numStates - 1 - state);
    let maxValue = 0;

    for (let a = 1; a <= availableActions; a++) {
        let winState = state + a;
        let loseState = state - a;
        let value = (propabilityHeads * (reward(winState) + (learningRate * stateValues[winState])))
                  + (propabilityTails * (reward(loseState) + (learningRate * stateValues[loseState])));

        if (maxValue < value)
            maxValue = value;
    }

    return maxValue;
}

function sweep() {
    let delta = 0;

    for (let s = 1; s < numStates - 1; s++) {
        let v = stateValues[s];
        stateValues[s] = maxActionValue(s);
        delta = Math.max(delta, Math.abs(v - stateValues[s]))
    }

    return delta;
}

function bestAction(state) {
    let availableActions = Math.min(state, numStates - 1 - state);
    let maxAction = 0;
    let maxValue = 0;

    for (let a = 1; a <= availableActions; a++) {
        let winState = state + a;
        let loseState = state - a;

        let value = (propabilityHeads * (reward(winState) + (learningRate * stateValues[winState])))
                    + ((1.0 - propabilityHeads) * learningRate * stateValues[loseState]);

        if (maxValue < value) {
            maxValue = value;
            maxAction = a;
        }
    }

    return maxAction;
}

function calculatePolicy() {
    let policy = Array(numStates);
    policy[0] = 0;
    policy[numStates - 1] = 0;

    for (let s = 1; s < numStates - 1; s++) {
        policy[s] = bestAction(s);
    }

    return policy;
}

function main() {
    console.log("Hello Gambler");
    initStateValues();

    for (let i = 0; i < 100; i++) {
        var delta = sweep();
    }
    //while (deltaThreshold < delta);

    let policy = calculatePolicy();
    console.log("Done.");

    for (let i = 1; i < policy.length - 1; i++)
        console.log(`Capital ${i} -> Stake ${policy[i]}`);
}

window.onload = main;
