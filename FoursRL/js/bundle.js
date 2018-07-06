var Fours;
(function (Fours) {
    class GameContainer {
        constructor(parent, agentRed = null, agentBlue = null) {
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
        act() {
            if (this.game.currentPlayer === Fours.PLAYER_RED)
                this.agentRed.act(this.game);
            else
                this.agentBlue.act(this.game);
        }
        reset() {
            this.game.reset();
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
        constructor() {
            this.metadata = {};
            this.net = this.buildNetwork();
            this._featureWriter = new NeuralNet.Utils.ArrayWriter(this.net.inputs);
        }
        buildNetwork() {
            let net = new NeuralNet.Genetic.Network();
            net.setInputSize(86);
            net.addNeuronLayer(43);
            net.addNormalisingLayer();
            net.addNeuronLayer(20);
            net.addNormalisingLayer();
            net.addNeuronLayer(1, NeuralNet.ActivationFunctions.Sigmoid(1 / 20));
            return net;
        }
        mutate() {
            this.net.mutate(0.05, 0.1);
        }
        act(game) {
            if (game.gameover)
                return;
            let currentPlayer = game.currentPlayer;
            let maxPosition = 0;
            let maxPositionValue = 0;
            for (let i = 0; i < game.width; i++) {
                let value;
                if (game.state[i].length < game.height) {
                    game.action(i);
                    if (game.winner) {
                        value = 1000;
                    }
                    else {
                        this.featuriseGame(game, currentPlayer);
                        value = this.net.activate()[0];
                    }
                    game.undo();
                }
                else {
                    value = -1000;
                }
                if (maxPositionValue < value) {
                    maxPositionValue = value;
                    maxPosition = i;
                }
            }
            game.action(maxPosition);
        }
        featuriseGame(game, currentPlayer) {
            this._featureWriter.seek(0);
            writeRedOrBlueFeature(this._featureWriter, currentPlayer);
            for (let i = 0; i < game.state.length; i++) {
                let column = game.state[i];
                let emptyRows = game.height - column.length;
                for (let j = 0; j < column.length; j++)
                    writeRedOrBlueFeature(this._featureWriter, column[j]);
                while (emptyRows-- > 0)
                    writeRedOrBlueFeature(this._featureWriter, null);
            }
        }
    }
    Fours.Agent = Agent;
})(Fours || (Fours = {}));
/// <reference path="agent.ts" />
var Fours;
(function (Fours) {
    let gameContainers = [];
    let numGames = 0;
    let numGenerations = 0;
    let maxGlobalScore = 0;
    let maxGeneration = 0;
    let lastGenerationScore = 0;
    let statsOutput;
    const vizWidth = 5;
    const vizHeight = 4;
    let agents = [
        new Fours.Agent(),
        new Fours.Agent(),
        new Fours.Agent(),
        new Fours.Agent(),
        new Fours.Agent()
    ];
    for (let i = 0; i < agents.length; i++)
        agents[i].metadata.score = 0;
    let matchUps = [];
    for (let i = 0; i < agents.length; i++)
        for (let j = 0; j < agents.length; j++)
            if (i != j)
                matchUps.push([agents[i], agents[j]]);
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
        step();
    }
    Fours.TrainMain = TrainMain;
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
    function updateAgentStats(container) {
        let agentRedStats = container.agentRed.metadata;
        let agentBlueStats = container.agentBlue.metadata;
        if (container.game.winner === Fours.PLAYER_RED) {
            agentRedStats.score += 3;
        }
        else if (container.game.winner === Fours.PLAYER_BLUE) {
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
})(Fours || (Fours = {}));
var Fours;
(function (Fours) {
    Fours.PLAYER_RED = "playerRed";
    Fours.PLAYER_BLUE = "playerBlue";
})(Fours || (Fours = {}));
//# sourceMappingURL=bundle.js.map