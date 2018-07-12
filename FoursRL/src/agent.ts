/// <reference path="../../shared/NeuralNet/js/NeuralNet.d.ts" />

namespace Fours {
    function writeRedOrBlueFeature(output: NeuralNet.Utils.ArrayWriter<number>, value: string) {
        if (value === PLAYER_RED) {
            output.write(1, -1);
        }
        else if (value === PLAYER_BLUE) {
            output.write(-1, 1);
        }
        else {
            output.write(-1, -1);
        }
    }

    export class Agent {
        public readonly metadata: any = {};
        public net: NeuralNet.Network;

        public constructor(public explorationRate: number = 0, net: NeuralNet.Network = null) {
            this.net = net || Agent.buildNetwork();
        }

        public static buildNetwork(): NeuralNet.Backprop.Network {
            let net = new NeuralNet.Backprop.Network();

            net.setInputSize(86);
            net.addNeuronLayer(86, NeuralNet.ActivationFunctions.Linear());
            net.addNormalisingLayer();
            net.addNeuronLayer(43, NeuralNet.ActivationFunctions.Linear());
            net.addNormalisingLayer();
            net.addNeuronLayer(1, NeuralNet.ActivationFunctions.Linear());

            return net;
        }

        public act(game: Game): TrajectorySample {
            let currentPlayer = game.currentPlayer;

            if (Math.random() <  this.explorationRate)
                this.random(game);
            else
                this.greedy(game);


            Agent.featuriseGame(this.net, game, currentPlayer);
            return new TrajectorySample(this.net.inputs);
        }

        public greedy(game: Game) {
            if (game.gameover)
                return;

            let currentPlayer = game.currentPlayer;

            let maxPosition = 0;
            let maxPositionValue = Number.NEGATIVE_INFINITY;

            for (let i = 0; i < game.width; i++) {
                let value: number;
                
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

        public random(game: Game) {
            let action = Math.floor(Math.random() * game.state.length);
            game.action(action);
        }

        public static featuriseGame(net: NeuralNet.Network, game: Game, currentPlayer: string) {
            let writer = new NeuralNet.Utils.ArrayWriter<number>(net.inputs);

            writeRedOrBlueFeature(writer, currentPlayer);
            for (let i = 0; i < game.state.length; i++) {
                let column = game.state[i];
                let emptyRows = game.height - column.length;

                for (let j = 0; j < column.length; j++)
                    writeRedOrBlueFeature(writer, column[j]);

                while (emptyRows --> 0)
                    writeRedOrBlueFeature(writer, null);
            }
        }
    }
}