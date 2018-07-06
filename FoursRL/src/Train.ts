/// <reference path="agent.ts" />

namespace Fours {

    let gameContainers: GameContainer[] = [];

    let numGames = 0;
    let numGenerations = 0;
    let maxGlobalScore = 0;
    let maxGeneration = 0;
    let lastGenerationScore = 0;
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

    for (let i = 0; i < agents.length; i++)
        agents[i].metadata.score = 0;
    
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
        let maxAgent = agents[0];

        for (let i = 1; i < agents.length; i++)
            if (maxAgent.metadata.score < agents[i].metadata.score)
                maxAgent = agents[i];

        if (maxGlobalScore <= maxAgent.metadata.score) {
            maxGlobalScore = maxAgent.metadata.score;
            maxGeneration = numGenerations;
        }
//        else {
//            // Always keep the global best agent in agents[0]
//            maxAgent = agents[0];
//        }

        lastGenerationScore = maxAgent.metadata.score;

        let maxAgentWeights = maxAgent.net.toJson();
        for (let i = 0; i < agents.length; i++) {
            let agent = agents[i];
            agent.metadata.score = 0;
            agent.net.fromJson(maxAgentWeights);
            if (i != 0)
                agent.mutate();
        }

        for (let i = 0; i < gameContainers.length; i++) {
            gameContainers[i].reset();
            gameContainers[i].act();
        }

        numGenerations++;
        updateStats();
    }

    function updateAgentStats(container: GameContainer) {
        let agentRedStats = container.agentRed.metadata;
        let agentBlueStats = container.agentBlue.metadata;

        if (container.game.winner === PLAYER_RED) {
            agentRedStats.score += 3;
        }
        else if (container.game.winner === PLAYER_BLUE) {
            agentBlueStats.score += 7;
        }
        else {
            // As Fours is solved, really punish publish red for for losing and reward blue as if it's a win
            agentRedStats.score -= 7;
            agentBlueStats.score += 5;
        }
    }

    function updateStats() {
        statsOutput.innerHTML = `Generation = ${numGenerations}<br/>`
                              + `Num games = ${numGames}<br/>`
                              + `Max Agent Score = ${maxGlobalScore} (${maxGeneration})<br/>`
                              + `Last Generation Score = ${lastGenerationScore}`;
    }
}