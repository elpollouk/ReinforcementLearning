(function () {
"use strict";

var AI_VS_AI = false;

var cells;
var currentPlayer;
var gameState;

var GameStates = {
    WaitForHuman: 1,
    AgentActing: 2,
    GameOver: 3,
};

//-----------------------------------------------------------------------------------------------------------------------------//
// Initialisation
//-----------------------------------------------------------------------------------------------------------------------------//
function main() {
    init();
    bindInput();

    if (AI_VS_AI)
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
}

function init() {
    cells = [
        null, null, null,
        null, null, null,
        null, null, null,
    ];
    currentPlayer = 'X';

    gameState = AI_VS_AI ? GameStates.AgentActing : GameStates.WaitForHuman;
}

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

//-----------------------------------------------------------------------------------------------------------------------------//
// Game Rules
//-----------------------------------------------------------------------------------------------------------------------------//
function place(cell) {
    if (!cells[cell]) {
        cells[cell] = currentPlayer;
        let el = document.getElementById("cell" + cell);
        el.innerText = currentPlayer;
        console.log(`Encoded state: ${encodeState(cells)}`);

        endTurn();
    }
}

function endTurn() {

    if (checkWin('X')) {
        console.log("X Wins!");
        gameState = GameStates.GameOver;
    }
    else if (checkWin('O')) {
        console.log("O Wins!");
        gameState = GameStates.GameOver;
    }
    else if (checkDraw()) {
        console.log("Draw");
        gameState = GameStates.GameOver;
    }
    else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
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

function checkWinCells(player, a, b, c) {
    return (cells[a] === player && cells[b] === player && cells[c] === player);
}

function checkWin(player) {
    return checkWinCells(player, 0, 1, 2)
        || checkWinCells(player, 3, 4, 5)
        || checkWinCells(player, 6, 7, 8)
        || checkWinCells(player, 0, 3, 6)
        || checkWinCells(player, 1, 4, 7)
        || checkWinCells(player, 2, 5, 8)
        || checkWinCells(player, 0, 4, 8)
        || checkWinCells(player, 2, 4, 6);
}

function checkDraw() {
    for (let i = 0; i < 9; i++) {
        if (!cells[i]) return false;
    }
    return true;
}

//-----------------------------------------------------------------------------------------------------------------------------//
// AI
//-----------------------------------------------------------------------------------------------------------------------------//
function aiAction() {
    setTimeout(() => {
        let moves = getPotentialMoves();
        let r = Math.floor(Math.random() * moves.length);
        place(moves[r]);
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


window.onload = main;

})();