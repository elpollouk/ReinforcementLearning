/// <reference path="agent.ts" />

namespace Fours {

    let gameContainers: GameContainer[] = [];

    let numGames = 0;
    let statsOutput: HTMLElement;

    const vizWidth = 5;
    const vizHeight = 4;
    let agents: Agent[] = [
        new Agent(),
        new Agent(),
        new Agent(),
        new Agent(),
        new Agent()
    ];

    let matchUps = [];

    for (let i = 0; i < agents.length; i++)
        for (let j = 0; j < agents.length; j++)
            if (i != j)
                matchUps.push([agents[i], agents[j]]);

    export function TrainMain() {
        statsOutput = document.getElementById("stats");
        let root = document.getElementById("gamesHolder");

        for (let y = 0; y < vizHeight; y++) {
            let row = document.createElement("div");
            for (let i = 0; i < vizWidth; i++) {
                let agents = matchUps.shift();
                let container = new GameContainer(row, agents[0], agents[1]);
                gameContainers.push(container);
            }
            root.appendChild(row);
        }

        step();
    }

    function step() {
        for (let i = 0; i < gameContainers.length; i++) {
            if (gameContainers[i].game.gameover) {
                numGames++;
                updateStats();
                gameContainers[i].reset();
            }

            gameContainers[i].act();
        }

        window.requestAnimationFrame(step);
    }

    function updateStats() {
        statsOutput.innerText = `Num games =${numGames}`;
    }
}