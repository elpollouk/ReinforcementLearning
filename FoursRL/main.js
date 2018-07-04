(function () {
"use strict";

var BOARD_ROWS = 6;
var BOARD_COLUMNS = 7;
var game = null;

function main() {
    game = new window.Game(BOARD_COLUMNS, BOARD_ROWS);
    game.onColumnClicked = (g, c) => {
        g.action(c);
        if (g.winner) {
            document.getElementById("gameArea").classList.add("gameover");
        }
    };

    document.getElementById("gameArea").appendChild(game.container);
    document.getElementById("reset").onclick = function () {
        game.reset();
        document.getElementById("gameArea").classList.remove("gameover");
    };
    document.getElementById("undo").onclick = function () {
        game.undo();
        document.getElementById("gameArea").classList.remove("gameover");
    }
}

var net = new NeuralNet.Network();
net.setInputSize(86);
net.addNeuronLayer(43);
net.addNormalisingLayer();
net.addNeuronLayer(20);
net.addNormalisingLayer();
net.addNeuronLayer(1);

window.onload = main;

})()