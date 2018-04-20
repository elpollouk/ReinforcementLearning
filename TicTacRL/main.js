(function () {
"use strict";

var cells = [];

function init() {
    cells = [
        '', '', '',
        '', '', '',
        '', '', '',
    ];
}

function encodeState() {
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

function place(player, cell) {
    cells[cell] = player;
    let el = document.getElementById("cell" + cell);
    el.innerText = player;

    console.log(`Encoded state: ${encodeState()}`);
}

function bindInput() {
    for (let i = 0; i < 9; i++) {
        let el = document.getElementById("cell" + i);
        el.innerText = '';
        el.onclick = () => {
            place('X', i);
        };
    }

    document.getElementById("reset").onclick = main;
}

function main() {
    init();
    bindInput();
}

window.onload = main;

})();