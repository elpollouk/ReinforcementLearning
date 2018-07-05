/// <reference path="agent.ts" />

namespace Fours {

    let gameContainers: GameContainer[] = [];

    let numGames = 0;
    let numGenerations = 0;
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

    let agentStats = [];
    for (let i = 0; i < agents.length; i++)
        agentStats.push({
            score: 0
        });
    
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
        let hasActed = false;
        for (let i = 0; i < gameContainers.length; i++) {
            if (!gameContainers[i].game.gameover) {
                gameContainers[i].act();
                hasActed = true;

                if (gameContainers[i].game.gameover) {
                    numGames++;
                    updateAgentStats(gameContainers[i]);
                    updateStats();
                }
            }
        }

        if (!hasActed)
            nextGeneration();

        window.requestAnimationFrame(step);
    }

    function nextGeneration() {
        for (let i = 0; i < agentStats.length; i++)
            agentStats[i].score = 0;

        for (let i = 0; i < agents.length; i++)
            agents[i].mutate();

        for (let i = 0; i < gameContainers.length; i++) {
            gameContainers[i].reset();
            gameContainers[i].act();
        }

        numGenerations++;
        updateStats();
    }

    function updateAgentStats(container: GameContainer) {
        let agentRedStats = agentStats[agents.indexOf(container.agentRed)];
        let agentBlueStats = agentStats[agents.indexOf(container.agentBlue)];

        if (container.game.winner === PLAYER_RED) {
            agentRedStats.score += 3;
        }
        else if (container.game.winner === PLAYER_BLUE) {
            agentBlueStats.score += 3;
        }
        else {
            agentRedStats.score += 1;
            agentBlueStats.score += 1;
        }
    }

    function updateStats() {
        statsOutput.innerHTML = `Generation = ${numGenerations}<br/>Num games = ${numGames}`;
    }
}