/// <reference path="agent.ts" />

namespace Fours {

    let gameContainers: GameContainer[] = [];

    let numGames = 0;
    let numGenerations = 0;
    let maxGlobalScore = 0;
    let maxGeneration = 0;
    let lastGenerationScore = "";
    let statsOutput: HTMLElement;

    const vizWidth = 6;
    const vizHeight = 7;

    let agents: Agent[] = [
        new Agent(),
        new Agent(),
        new Agent(),
        new Agent(),
        new Agent(),
        new Agent(),
        new Agent()
    ];

    for (let i = 0; i < agents.length; i++)
        resetMetaData(agents[i]);
    
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

        document.getElementById("fetch").onclick = () => {
            let json = agents[0].net.toJson();
            json = JSON.stringify(json);
            console.log(json);
        }

        step();
    }

    function resetMetaData(agent: Agent) {
        agent.metadata.score = 0;
        agent.metadata.win = 0;
        agent.metadata.lose = 0;
        agent.metadata.draw = 0;
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
//        else if (maxAgent.metadata.score < maxGlobalScore) {
//            // Always keep the global best agent in agents[0]
//            maxAgent = agents[0];
//        }

        lastGenerationScore = `${maxAgent.metadata.score}, `
                            + `W=${maxAgent.metadata.win}, `
                            + `L=${maxAgent.metadata.lose}, `
                            + `D=${maxAgent.metadata.draw}`;

        let maxAgentWeights = maxAgent.net.toJson();
        for (let i = 0; i < agents.length; i++) {
            let agent = agents[i];
            resetMetaData(agent);
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
            agentRedStats.score += 1;
            agentRedStats.win++;
            agentBlueStats.lose++;
        }
        else if (container.game.winner === PLAYER_BLUE) {
            agentBlueStats.score += 1;
            agentBlueStats.win++;
            agentRedStats.lose++;
        }
        else {
            agentBlueStats.score += 1;
            agentBlueStats.draw++;
            agentRedStats.draw++;
        }
    }

    function updateStats() {
        statsOutput.innerHTML = `Generation = ${numGenerations}<br/>`
                              + `Num games = ${numGames}<br/>`
                              + `Max Agent Score = ${maxGlobalScore} (${maxGeneration})<br/>`
                              + `Last Generation Score = ${lastGenerationScore}`;
    }
}