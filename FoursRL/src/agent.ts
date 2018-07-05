/// <reference path="../../shared/NeuralNet/js/NeuralNet.d.ts" />

namespace Fours {
    function writeRedOrBlueFeature(output: NeuralNet.Utils.ArrayWriter<number>, value: string) {
        if (value === PLAYER_RED) {
            output.write(1, 0);
        }
        else if (value === PLAYER_BLUE) {
            output.write(0, 1);
        }
        else {
            output.write(0, 0);
        }
    }

    export class Agent {
        public net: NeuralNet.Genetic.Network;
        private _featureWriter: NeuralNet.Utils.ArrayWriter<number>;

        public constructor() {
            this.net = this.buildNetwork();
            this._featureWriter = new NeuralNet.Utils.ArrayWriter(this.net.inputs);
        }

        private buildNetwork(): NeuralNet.Genetic.Network {
            let net = new NeuralNet.Genetic.Network();

            net.setInputSize(86);
            net.addNeuronLayer(43);
            net.addNormalisingLayer();
            net.addNeuronLayer(20);
            net.addNormalisingLayer();
            net.addNeuronLayer(1, NeuralNet.ActivationFunctions.Sigmoid(1/20));

            return net;
        }

        public mutate() {
            this.net.mutate(0.05, 0.02);
        }

        public act(game: Game) {
            if (game.gameover)
                return;

            let currentPlayer = game.currentPlayer;

            let maxPosition = 0;
            let maxPositionValue = 0;

            for (let i = 0; i < game.width; i++) {
                let value: number;
                
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

        private featuriseGame(game: Game, currentPlayer: string) {
            this._featureWriter.seek(0);

            writeRedOrBlueFeature(this._featureWriter, currentPlayer);
            for (let i = 0; i < game.state.length; i++) {
                let column = game.state[i];
                let emptyRows = game.height - column.length;

                for (let j = 0; j < column.length; j++)
                    writeRedOrBlueFeature(this._featureWriter, column[j]);

                while (emptyRows --> 0)
                    writeRedOrBlueFeature(this._featureWriter, null);
            }
        }
    }
}