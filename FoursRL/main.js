(function () {
"use strict";

var BOARD_ROWS = 6;
var BOARD_COLUMNS = 7;
var game = null;
var agent = null;

function main() {
    game = new window.Game(BOARD_COLUMNS, BOARD_ROWS);
    game.onColumnClicked = (g, c) => {
        g.action(c);
        if (g.gameover) {
            document.getElementById("gameArea").classList.add("gameover");
        }
    };
    
    agent = new Fours.Agent();

    document.getElementById("gameArea").appendChild(game.container);
    document.getElementById("reset").onclick = function () {
        game.reset();
        document.getElementById("gameArea").classList.remove("gameover");
    };
    document.getElementById("act").onclick = function () {
        agent.act(game);
        if (game.gameover) {
            document.getElementById("gameArea").classList.add("gameover");
        }
    };
    document.getElementById("undo").onclick = function () {
        game.undo();
        document.getElementById("gameArea").classList.remove("gameover");
    };
    document.getElementById("setWeights").onclick = function () {
        let json = document.getElementById("weightsJson").value;
        json = JSON.parse(json);
        agent.net.fromJson(json);
    }
}

window.onload = main;

})()