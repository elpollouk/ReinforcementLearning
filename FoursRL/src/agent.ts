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
        public net: NeuralNet.Network;
        private _featureWriter: NeuralNet.Utils.ArrayWriter<number>;

        public constructor(public readonly game: Game) {
            this.net = this.buildNetwork();
            this._featureWriter = new NeuralNet.Utils.ArrayWriter(this.net.inputs);
        }

        private buildNetwork(): NeuralNet.Network {
            let net = new NeuralNet.Network();
            
            net.setInputSize(86);
            net.addNeuronLayer(43);
            net.addNormalisingLayer();
            net.addNeuronLayer(20);
            net.addNormalisingLayer();
            net.addNeuronLayer(1);

            return net;
        }

        public act() {
            if (this.game.winner)
                return;

            let maxPosition = 0;
            let maxPositionValue = 0;

            for (let i = 0; i < this.game.width; i++) {

                let value: number;
                if (this.game.state[i].length < this.game.height) {
                    this.game.action(i);
                    if (this.game.winner) {
                        value = 1000;
                    }
                    else {
                        this.featuriseGame();
                        value = this.net.activate()[0];
                    }
                    this.game.undo();
                }
                else {
                    value = -1000;
                }

                if (maxPositionValue < value) {
                    maxPositionValue = value;
                    maxPosition = i;
                }
            }

            this.game.action(maxPosition);
        }

        private featuriseGame() {
            this._featureWriter.seek(0);
            writeRedOrBlueFeature(this._featureWriter, this.game.currentPlayer);
            for (let i = 0; i < this.game.state.length; i++) {
                let column = this.game.state[i];
                let emptyRows = this.game.height - column.length;

                for (let j = 0; j < column.length; j++)
                    writeRedOrBlueFeature(this._featureWriter, column[i]);

                while (emptyRows --> 0)
                    writeRedOrBlueFeature(this._featureWriter, null);
            }
        }
    }
}