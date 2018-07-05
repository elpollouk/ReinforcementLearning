var Fours;
(function (Fours) {
    class GameContainer {
        constructor(parent, agentRed = null, agentBlue = null) {
            this.redScore = 0;
            this.blueScore = 0;
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
            if (this.game.gameover) {
                if (this.game.winner === Fours.PLAYER_RED) {
                    this.redScore += 3;
                }
                else if (this.game.winner === Fours.PLAYER_BLUE) {
                    this.blueScore += 3;
                }
                else {
                    this.redScore++;
                    this.blueScore++;
                }
            }
        }
        reset() {
            this.game.reset();
            this.agentRed.mutate();
            this.agentBlue.mutate();
        }
    }
    Fours.GameContainer = GameContainer;
})(Fours || (Fours = {}));
var Fours;
(function (Fours) {
    let gameContainers = [];
    let numGames = 0;
    let statsOutput;
    function TrainMain() {
        statsOutput = document.getElementById("stats");
        let root = document.getElementById("gamesHolder");
        for (let y = 0; y < 4; y++) {
            let row = document.createElement("div");
            for (let i = 0; i < 5; i++) {
                let container = new Fours.GameContainer(row);
                gameContainers.push(container);
            }
            root.appendChild(row);
        }
        step();
    }
    Fours.TrainMain = TrainMain;
    function step() {
        for (let i = 0; i < gameContainers.length; i++) {
            if (gameContainers[i].game.gameover) {
                numGames++;
                updateStats();
                gameContainers[i].reset();
            }
            else {
                gameContainers[i].act();
            }
        }
        window.requestAnimationFrame(step);
    }
    function updateStats() {
        statsOutput.innerText = `Num games =${numGames}`;
    }
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
            this.net.mutate(0.05, 0.02);
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
var Fours;
(function (Fours) {
    Fours.PLAYER_RED = "playerRed";
    Fours.PLAYER_BLUE = "playerBlue";
})(Fours || (Fours = {}));
//# sourceMappingURL=bundle.js.map