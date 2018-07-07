/// <reference path="agent.ts" />

namespace Fours {
    const VIZWIDTH = 5;
    const VIZHEIGHT = 4;
    const DISCOUNT = 0.9;

    let gameContainers: GameContainer[] = [];
    let paused = false;

    let numGames = 0;
    let results = "";
    let statsOutput: HTMLElement;

    let network = Agent.buildNetwork();
    let agentEvaluator = new Agent(0, network);
    let agentExplorer = new Agent(0.1, network);

    resetMetadata(agentEvaluator);
    resetMetadata(agentExplorer);
    
    let matchUps: Agent[][] = [];
    for (let i = 0; i < VIZWIDTH * VIZHEIGHT; i++) {
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

        for (let y = 0; y < VIZHEIGHT; y++) {
            let row = document.createElement("div");
            for (let i = 0; i < VIZWIDTH; i++) {
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
        agent.metadata.results = new SlidingWindowSum(100, [0, 0, 0]);
    }

    function step() {
        for (let i = 0; i < gameContainers.length; i++) {
            if (gameContainers[i].game.gameover) {
                numGames++;
                updateAgentStats(gameContainers[i]);
                updateEvaluatorStats();
                updateStats();

                trainWithContainer(gameContainers[i], DISCOUNT);
                gameContainers[i].reset();
            }

            gameContainers[i].act();
        }

        if (!paused)
            window.requestAnimationFrame(step);
    }

    function trainWithContainer(gameContainer: GameContainer, discount: number) {
        let game = gameContainer.game;
        let rewardRed = 0;
        let rewardBlue = 0;

        if (game.winner === PLAYER_RED) {
            rewardRed = 1;
            rewardBlue = -1;
        }
        else if (game.winner === PLAYER_BLUE) {
            rewardRed = -1;
            rewardBlue = 0;
        }

        train(gameContainer.memoryRed, rewardRed, discount);
        train(gameContainer.memoryBlue, rewardBlue, discount);
    }

    function train(memory: TrajectoryMemory, reward: number, discount: number) {
        while (memory.hasSamples) {
            let sample = memory.pop();
            for (let i = 0; i < sample.inputs.length; i++)
                network.inputs[i] = sample.inputs[i];

            let value = network.activate()[0];
            let error = reward - value;

            // Back prop

            reward *= discount;
        }
    }

    function updateEvaluatorStats() {
        let data = agentEvaluator.metadata.results.values as number[];
        results = `W=${data[0]}, `
                + `L=${data[1]}, `
                + `D=${data[2]}`;
    }

    function updateAgentStats(container: GameContainer) {
        let agentRedResults = container.agentRed.metadata.results as SlidingWindowSum;
        let agentBlueResults = container.agentBlue.metadata.results as SlidingWindowSum;

        if (container.game.winner === PLAYER_RED) {
            agentRedResults.add([1, 0, 0]);
            agentBlueResults.add([0, 1, 0]);
        }
        else if (container.game.winner === PLAYER_BLUE) {
            agentBlueResults.add([1, 0, 0]);
            agentRedResults.add([0, 1, 0]);
        }
        else {
            agentBlueResults.add([0, 0, 1]);
            agentRedResults.add([0, 0, 1]);
        }
    }

    function updateStats() {
        statsOutput.innerHTML = `Num games = ${numGames}<br/>`
                              + `Results = ${results}`;
    }
}