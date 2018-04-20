(function () {
"use strict";

var LEARNING_RATE = 0.05;
var AI_VS_AI = false;
var requestAiVsAi = AI_VS_AI;
var gameCount = 1;

var cells;
var currentPlayer;
var gameState;
var previousAiState;

var GameStates = {
    WaitForHuman: 1,
    AgentActing: 2,
    GameOver: 3,
};

//-----------------------------------------------------------------------------------------------------------------------------//
// Initialisation
//-----------------------------------------------------------------------------------------------------------------------------//
function main() {
    bindInput();
    init();

    if (gameState === GameStates.AgentActing)
        aiAction();
}

function bindInput() {
    for (let i = 0; i < 9; i++) {
        let el = document.getElementById("cell" + i);
        el.innerText = '';
        el.onclick = () => {
            if (gameState === GameStates.WaitForHuman) {
                place(i);
            }
        };
    }

    document.getElementById("reset").onclick = main;
    document.getElementById("toggle").onclick = toggleAiVsAI;
}

function init() {
    cells = [
        null, null, null,
        null, null, null,
        null, null, null,
    ];
    currentPlayer = 'X';

    //gameState = GameStates.AgentActing;
    gameState = AI_VS_AI ? GameStates.AgentActing : GameStates.WaitForHuman;
    previousAiState = {
        X: 0,
        O: 0
    };
}

function toggleAiVsAI() {
    let el = document.getElementById("toggle");
    requestAiVsAi = !requestAiVsAi;
    el.innerText = requestAiVsAi ? "AI vs AI" : "Human vs AI";
}
//-----------------------------------------------------------------------------------------------------------------------------//
// State Management
//-----------------------------------------------------------------------------------------------------------------------------//
function encodeState(cells) {
    let encodedState = 0;
    for (let i = 0; i < 9; i++) {
        let v;
        switch (cells[i]) {
            case 'X':
                v = 1;
                break;

            case 'O':
                v = 2;
                break;

            default:
                v = 0;
                break;
        }

        encodedState <<= 2;
        encodedState += v;
    }

    return encodedState;
}

function decodeState(state) {
    let cells = [];
    for (let i = 0; i < 9; i++) {
        let v = state & 3;
        state >>= 2;

        switch (v) {
            case 1:
                cells.unshift('X');
                break;

            case 2:
                cells.unshift('O');
                break;

            default:
                cells.unshift(null);
                break;
        }
    }

    return cells;
}

function cloneCells() {
    let clone = [];
    for (let i = 0; i < cells.length; i++)
        clone.push(cells[i]);

    return clone;
}

//-----------------------------------------------------------------------------------------------------------------------------//
// Game Rules
//-----------------------------------------------------------------------------------------------------------------------------//
function place(cell) {
    if (!cells[cell]) {
        cells[cell] = currentPlayer;
        let el = document.getElementById("cell" + cell);
        el.innerText = currentPlayer;

        endTurn();
    }
}

function endTurn() {
    let otherPlayer = currentPlayer === 'X' ? 'O' : 'X';

    if (checkWin(cells, currentPlayer)) {
        console.log(`Game ${gameCount++}: ${currentPlayer} Wins!`);
        updateForLoss(otherPlayer);
        endGame();
    }
    else if (checkDraw(cells)) {
        console.log(`Game ${gameCount++}: Draw`);
        endGame();
    }
    else {
        currentPlayer = otherPlayer;
        if (gameState === GameStates.WaitForHuman) {
            gameState = GameStates.AgentActing;
        }
        else if (!AI_VS_AI) {
            gameState = GameStates.WaitForHuman;
        }

        if (gameState === GameStates.AgentActing)
            aiAction();
    }
}

function endGame() {
    gameState = GameStates.GameOver;

    if (requestAiVsAi != AI_VS_AI)
        AI_VS_AI = requestAiVsAi;

    if (AI_VS_AI)
        setTimeout(main, 1);
}

function checkWinCells(cells, player, a, b, c) {
    return (cells[a] === player && cells[b] === player && cells[c] === player);
}

function checkWin(cells, player) {
    return checkWinCells(cells, player, 0, 1, 2)
        || checkWinCells(cells, player, 3, 4, 5)
        || checkWinCells(cells, player, 6, 7, 8)
        || checkWinCells(cells, player, 0, 3, 6)
        || checkWinCells(cells, player, 1, 4, 7)
        || checkWinCells(cells, player, 2, 5, 8)
        || checkWinCells(cells, player, 0, 4, 8)
        || checkWinCells(cells, player, 2, 4, 6);
}

function checkLose(cells, player) {
    player = player === 'X' ? 'O' : 'X';
    return checkWin(cells, player);
}

function checkDraw(cells) {
    for (let i = 0; i < 9; i++) {
        if (!cells[i]) return false;
    }
    return true;
}

//-----------------------------------------------------------------------------------------------------------------------------//
// AI
//-----------------------------------------------------------------------------------------------------------------------------//
var stateValues = {};

function aiAction() {
    setTimeout(() => {
        makeBestMove();
    }, 1);
}

function getPotentialMoves() {
    let moves = [];

    for (let i = 0; i < 9; i++) {
        if (!cells[i])
            moves.push(i);
    }

    return moves;
}

function getStateValue(cells) {
    if (checkWin(cells, currentPlayer))
        return 1;

    let state = encodeState(cells);
    if (!(state in stateValues))
        return 0.5;

    return stateValues[state];
}

function makePotentialMove(move) {
    let future = cloneCells();
    future[move] = currentPlayer;
    return future;
}


function shuffle(arr) {
    let shuffled = [];
    while (arr.length) {
        let r = Math.floor(Math.random() * arr.length);
        shuffled.push(arr[r])
        arr.splice(r, 1);
    }
    return shuffled;
}

function makeRandomMove() {
    let moves = getPotentialMoves();
    let r = Math.floor(Math.random() * moves.length);
    place(moves[r]);
}

function makeBestMove() {
    let moves = getPotentialMoves();
    moves = shuffle(moves);

    let potential = makePotentialMove(moves[0]);
    let bestIndex = 0;
    let bestValue = getStateValue(potential);
    let bestState = encodeState(potential);

    for (let i = 1; i < moves.length; i++) {
        potential = makePotentialMove(moves[i]);
        let value = getStateValue(potential);

        if (bestValue < value) {
            bestIndex = i;
            bestValue = value;
            bestState = encodeState(potential);
        }
    }

    let previousState = previousAiState[currentPlayer];
    if (previousState) {
        let previousValue = getStateValue(previousState);
        let updatedValue = previousValue + LEARNING_RATE * (bestValue - previousValue);
        if (updatedValue != 0.5) stateValues[previousState] = updatedValue;
    }
    previousAiState[currentPlayer] = bestState;

    place(moves[bestIndex]);
}

function updateForLoss(player) {
    let previousState = previousAiState[player];
    let previousValue = getStateValue(previousState);
    let updatedValue = previousValue - (LEARNING_RATE * previousValue);
    stateValues[previousState] = updatedValue;
}

window.onload = main;

})();