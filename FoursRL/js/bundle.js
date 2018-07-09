var Fours;
(function (Fours) {
    class GameContainer {
        constructor(parent, agentRed = null, agentBlue = null) {
            this.memoryRed = new Fours.TrajectoryMemory();
            this.memoryBlue = new Fours.TrajectoryMemory();
            let gameArea = parent.ownerDocument.createElement("div");
            gameArea.classList.add("gameArea");
            this.element = parent.ownerDocument.createElement("div");
            this.element.classList.add("gameContainer");
            this.game = window["createGame"](7, 6);
            gameArea.appendChild(this.game.container);
            this.element.appendChild(gameArea);
            parent.appendChild(this.element);
            this.agentRed = agentRed || new Fours.Agent();
            this.agentBlue = agentBlue || new Fours.Agent();
        }
        actWithAgent(agent, memory) {
            let sample = agent.act(this.game);
            memory.recordSample(sample);
        }
        act() {
            if (this.game.currentPlayer === Fours.PLAYER_RED)
                this.actWithAgent(this.agentRed, this.memoryRed);
            else
                this.actWithAgent(this.agentBlue, this.memoryBlue);
        }
        reset() {
            this.game.reset();
            this.memoryRed.reset();
            this.memoryBlue.reset();
        }
    }
    Fours.GameContainer = GameContainer;
})(Fours || (Fours = {}));
var Fours;
(function (Fours) {
    class SlidingWindowSum {
        constructor(windowSize, initial = null) {
            this.windowSize = windowSize;
            this._window = [];
            if (initial)
                this.add(initial);
        }
        add(values) {
            if (!this.sum) {
                this.sum = values.slice(0);
                this.average = values.slice(0);
            }
            else {
                let sampleSize = values.length;
                let numSamples = this._window.length;
                for (let i = 0; i < sampleSize; i++)
                    this.sum[i] += values[i];
                if (numSamples == this.windowSize) {
                    let old = this._window.shift();
                    for (let i = 0; i < sampleSize; i++)
                        this.sum[i] -= old[i];
                }
                for (let i = 0; i < sampleSize; i++)
                    this.average[i] = this.sum[i] / numSamples;
            }
            this._window.push(values);
        }
    }
    Fours.SlidingWindowSum = SlidingWindowSum;
})(Fours || (Fours = {}));
/// <reference path="../../shared/NeuralNet/js/NeuralNet.d.ts" />
var Fours;
(function (Fours) {
    function writeRedOrBlueFeature(output, value) {
        if (value === Fours.PLAYER_RED) {
            output.write(1, 0);
        }
        else if (value === Fours.PLAYER_BLUE) {
            output.write(0, 1);
        }
        else {
            output.write(0, 0);
        }
    }
    class Agent {
        constructor(explorationRate = 0, net = null) {
            this.explorationRate = explorationRate;
            this.metadata = {};
            this.net = net || Agent.buildNetwork();
        }
        static buildNetwork() {
            let net = new NeuralNet.Backprop.Network();
            net.setInputSize(86);
            net.addNeuronLayer(86);
            net.addNormalisingLayer();
            net.addNeuronLayer(43);
            net.addNormalisingLayer();
            net.addNeuronLayer(1, NeuralNet.ActivationFunctions.Linear);
            return net;
        }
        act(game) {
            let currentPlayer = game.currentPlayer;
            if (Math.random() < this.explorationRate)
                this.random(game);
            else
                this.greedy(game);
            Agent.featuriseGame(this.net, game, currentPlayer);
            return new Fours.TrajectorySample(this.net.inputs);
        }
        greedy(game) {
            if (game.gameover)
                return;
            let currentPlayer = game.currentPlayer;
            let maxPosition = 0;
            let maxPositionValue = Number.NEGATIVE_INFINITY;
            for (let i = 0; i < game.width; i++) {
                let value;
                if (game.state[i].length < game.height) {
                    game.action(i);
                    Agent.featuriseGame(this.net, game, currentPlayer);
                    value = this.net.activate()[0];
                    game.undo();
                }
                else {
                    value = Number.NEGATIVE_INFINITY;
                }
                if (maxPositionValue < value) {
                    maxPositionValue = value;
                    maxPosition = i;
                }
            }
            game.action(maxPosition);
        }
        random(game) {
            let action = Math.floor(Math.random() * game.state.length);
            game.action(action);
        }
        static featuriseGame(net, game, currentPlayer) {
            let writer = new NeuralNet.Utils.ArrayWriter(net.inputs);
            writeRedOrBlueFeature(writer, currentPlayer);
            for (let i = 0; i < game.state.length; i++) {
                let column = game.state[i];
                let emptyRows = game.height - column.length;
                for (let j = 0; j < column.length; j++)
                    writeRedOrBlueFeature(writer, column[j]);
                while (emptyRows-- > 0)
                    writeRedOrBlueFeature(writer, null);
            }
        }
    }
    Fours.Agent = Agent;
})(Fours || (Fours = {}));
/// <reference path="agent.ts" />
/// <reference path="SlidingWindowSum.ts" />
var Fours;
(function (Fours) {
    const VIZWIDTH = 5;
    const VIZHEIGHT = 4;
    const DISCOUNT = 0.9;
    const LEARNING_RATE = 0.1;
    let gameContainers = [];
    let paused = false;
    let numGames = 0;
    let results = "";
    let averageError = new Fours.SlidingWindowSum(250, [0]);
    let statsOutput;
    let network = Fours.Agent.buildNetwork();
    let agentEvaluator = new Fours.Agent(0, network);
    let agentExplorer = new Fours.Agent(0.1, network);
    resetMetadata(agentEvaluator);
    resetMetadata(agentExplorer);
    let matchUps = [];
    for (let i = 0; i < VIZWIDTH * VIZHEIGHT; i++) {
        let match;
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
    function TrainMain() {
        statsOutput = document.getElementById("stats");
        let root = document.getElementById("gamesHolder");
        for (let y = 0; y < VIZHEIGHT; y++) {
            let row = document.createElement("div");
            for (let i = 0; i < VIZWIDTH; i++) {
                let agents = matchUps.shift();
                let container = new Fours.GameContainer(row, agents[0], agents[1]);
                gameContainers.push(container);
            }
            root.appendChild(row);
        }
        bindUi();
        step();
    }
    Fours.TrainMain = TrainMain;
    function bindUi() {
        document.getElementById("fetch").onclick = () => {
            let json = agentEvaluator.net.toJson();
            json = JSON.stringify(json);
            console.log(json);
        };
        let stepButton = document.getElementById("step");
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
        };
        stepButton.onclick = () => {
            step();
        };
    }
    function resetMetadata(agent) {
        agent.metadata.results = new Fours.SlidingWindowSum(100, [0, 0, 0]);
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
    function trainWithContainer(gameContainer, discount) {
        let game = gameContainer.game;
        let rewardRed = 0;
        let rewardBlue = 0;
        if (game.winner === Fours.PLAYER_RED) {
            rewardRed = 1;
            rewardBlue = -1;
        }
        else if (game.winner === Fours.PLAYER_BLUE) {
            rewardRed = -1;
            rewardBlue = 1;
        }
        trainWithMemory(gameContainer.memoryRed, rewardRed, discount);
        trainWithMemory(gameContainer.memoryBlue, rewardBlue, discount);
    }
    function trainWithMemory(memory, reward, discount) {
        while (memory.hasSamples) {
            let sample = memory.pop();
            for (let i = 0; i < sample.inputs.length; i++)
                network.inputs[i] = sample.inputs[i];
            let value = network.activate()[0];
            network.train([reward], LEARNING_RATE);
            let error = value - reward;
            averageError.add([error * error * 0.5]);
            reward *= discount;
        }
    }
    function updateEvaluatorStats() {
        let data = agentEvaluator.metadata.results.sum;
        results = `W=${data[0]}, `
            + `L=${data[1]}, `
            + `D=${data[2]}`;
    }
    function updateAgentStats(container) {
        let agentRedResults = container.agentRed.metadata.results;
        let agentBlueResults = container.agentBlue.metadata.results;
        if (container.game.winner === Fours.PLAYER_RED) {
            agentRedResults.add([1, 0, 0]);
            agentBlueResults.add([0, 1, 0]);
        }
        else if (container.game.winner === Fours.PLAYER_BLUE) {
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
            + `Results = ${results}<br />`
            + `Average error = ${averageError.average[0].toFixed(3)}`;
    }
})(Fours || (Fours = {}));
var Fours;
(function (Fours) {
    class TrajectorySample {
        constructor(inputs) {
            this.inputs = inputs;
            this.inputs = this.inputs.slice(0);
        }
    }
    Fours.TrajectorySample = TrajectorySample;
    class TrajectoryMemory {
        constructor() {
            this.memory = [];
        }
        reset() {
            this.memory = [];
        }
        get hasSamples() {
            return this.memory.length != 0;
        }
        record(inputs) {
            let sample = new TrajectorySample(inputs);
            this.recordSample(sample);
        }
        recordSample(sample) {
            this.memory.push(sample);
        }
        pop() {
            return this.memory.pop();
        }
    }
    Fours.TrajectoryMemory = TrajectoryMemory;
})(Fours || (Fours = {}));
var Fours;
(function (Fours) {
    Fours.PLAYER_RED = "playerRed";
    Fours.PLAYER_BLUE = "playerBlue";
})(Fours || (Fours = {}));
//# sourceMappingURL=bundle.js.map