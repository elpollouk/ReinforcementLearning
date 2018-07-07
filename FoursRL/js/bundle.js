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
            this.agentRed = agentRed || new Fours.Agent(0);
            this.agentBlue = agentBlue || new Fours.Agent(0);
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
            let net = new NeuralNet.Genetic.Network();
            net.setInputSize(86);
            net.addNeuronLayer(43);
            net.addNormalisingLayer();
            net.addNeuronLayer(20);
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
            let value = this.net.activate()[0];
            return new Fours.TrajectorySample(this.net.inputs, value);
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
var Fours;
(function (Fours) {
    let gameContainers = [];
    let paused = false;
    let numGames = 0;
    let results = "";
    let statsOutput;
    const vizWidth = 5;
    const vizHeight = 4;
    let network = Fours.Agent.buildNetwork();
    let agentEvaluator = new Fours.Agent(0, network);
    let agentExplorer = new Fours.Agent(0.1, network);
    resetMetadata(agentEvaluator);
    resetMetadata(agentExplorer);
    let matchUps = [];
    for (let i = 0; i < vizWidth * vizHeight; i++) {
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
        for (let y = 0; y < vizHeight; y++) {
            let row = document.createElement("div");
            for (let i = 0; i < vizWidth; i++) {
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
    function updateAgentStats(container) {
        let agentRedStats = container.agentRed.metadata;
        let agentBlueStats = container.agentBlue.metadata;
        if (container.game.winner === Fours.PLAYER_RED) {
            agentRedStats.win++;
            agentBlueStats.lose++;
        }
        else if (container.game.winner === Fours.PLAYER_BLUE) {
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
})(Fours || (Fours = {}));
var Fours;
(function (Fours) {
    class TrajectorySample {
        constructor(inputs, output) {
            this.inputs = inputs;
            this.output = output;
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
        record(inputs, output) {
            let sample = new TrajectorySample(inputs, output);
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