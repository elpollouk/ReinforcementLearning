(function () {
"use strict";

var BOARD_ROWS = 6;
var BOARD_COLUMNS = 7;
var game = null;
var agent = null;

function main() {
    function think() {
        agent.act();
        if (game.gameover) {
            requestAnimationFrame(reset);
        }
        else {
            requestAnimationFrame(think);
        }
    }

    function reset() {
        game.reset();
        agent.mutate();
        requestAnimationFrame(think);
    }

    game = new window.Game(BOARD_COLUMNS, BOARD_ROWS);
    game.onColumnClicked = (g, c) => {
        g.action(c);
        if (g.gameover) {
            document.getElementById("gameArea").classList.add("gameover");
        }
    };
    
    agent = new Fours.Agent(game);

    document.getElementById("gameArea").appendChild(game.container);
    document.getElementById("reset").onclick = function () {
        game.reset();
        agent.mutate();
        document.getElementById("gameArea").classList.remove("gameover");
    };
    document.getElementById("act").onclick = function () {
        agent.act();
        if (game.gameover) {
            document.getElementById("gameArea").classList.add("gameover");
        }
    };
    document.getElementById("undo").onclick = function () {
        game.undo();
        document.getElementById("gameArea").classList.remove("gameover");
    };
    document.getElementById("train").onclick = function () {
        think();
    }
}

window.onload = main;

})()