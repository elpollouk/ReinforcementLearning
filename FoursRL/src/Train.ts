/// <reference path="agent.ts" />

namespace Fours {

    let gameContainers: GameContainer[] = [];
    let paused = false;

    let numGames = 0;
    let results = "";
    let statsOutput: HTMLElement;

    const vizWidth = 5;
    const vizHeight = 4;

    let network = Agent.buildNetwork();
    let agentEvaluator = new Agent(0, network);
    let agentExplorer = new Agent(0.1, network);

    resetMetadata(agentEvaluator);
    resetMetadata(agentExplorer);
    
    let matchUps: Agent[][] = [];
    for (let i = 0; i < vizWidth * vizHeight; i++) {
        let match: Agent[];
        switch (i % 4) {
            case 0:
                match = [agentEvaluator, agentExplorer];
                break;

            case 1:
                match = [agentExplorer, agentEvaluator];
                break;

            default:
                match = [agentExplorer, agentExplorer];
        }

        matchUps.push(match);
    }

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

        bindUi();

        step();
    }

    function bindUi() {
        document.getElementById("fetch").onclick = () => {
            let json = agentEvaluator.net.toJson();
            json = JSON.stringify(json);
            console.log(json);
        }

        let stepButton = document.getElementById("step") as HTMLButtonElement;
        let pauseButton = document.getElementById("pause");
        pauseButton.onclick = () => {
            paused = !paused;

            if (paused) {
                pauseButton.innerText = "Unpause";
            }
            else {
                pauseButton.innerText = "Pause";
                step();
            }

            stepButton.disabled = !paused;
        }

        stepButton.onclick = () => {
            step();
        }
    }

    function resetMetadata(agent: Agent) {
        agent.metadata.win = 0;
        agent.metadata.lose = 0;
        agent.metadata.draw = 0;
    }

    function step() {
        for (let i = 0; i < gameContainers.length; i++) {
            if (gameContainers[i].game.gameover) {
                numGames++;
                updateAgentStats(gameContainers[i]);
                updateEvaluatorStats();
                updateStats();
                gameContainers[i].reset();
            }

            gameContainers[i].act();
        }

        if (!paused)
            window.requestAnimationFrame(step);
    }

    function updateEvaluatorStats() {
        let data = agentEvaluator.metadata;
        results = `W=${data.win}, `
                + `L=${data.lose}, `
                + `D=${data.draw}`;
    }

    function updateAgentStats(container: GameContainer) {
        let agentRedStats = container.agentRed.metadata;
        let agentBlueStats = container.agentBlue.metadata;

        if (container.game.winner === PLAYER_RED) {
            agentRedStats.win++;
            agentBlueStats.lose++;
        }
        else if (container.game.winner === PLAYER_BLUE) {
            agentBlueStats.win++;
            agentRedStats.lose++;
        }
        else {
            agentBlueStats.draw++;
            agentRedStats.draw++;
        }
    }

    function updateStats() {
        statsOutput.innerHTML = `Num games = ${numGames}<br/>`
                              + `Results = ${results}`;
    }
}