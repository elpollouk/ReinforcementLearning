/// <reference path="Network.ts" />

namespace NeuralNet.Genetic {

    class Mutator {
        public constructor(private _target: number[]) {

        }

        public mutate(probability: number, scale: number) {
            for (let i = 0; i <  this._target.length; i++) {
                if (Math.random() < probability) {
                    let delta = (Math.random() * scale * 2) - scale;
                    this._target[i] += delta;
                }
            }
        }
    }

    export class Network extends NeuralNet.Network {
        private _mutators: Mutator[] = [];

        public addNeuronLayer(size: number = 0, activation: ActivationFunctions.ActivationFunction = null): NeuronLayer {
            let layer = super.addNeuronLayer(size, activation);

            for (let i = 0; i < layer.neurons.length; i++) {
                let mutator = new Mutator(layer.neurons[i].weights);
                this._mutators.push(mutator);
            }

            return layer;
        }

        public mutate(probability: number, scale: number) {
            for (let i = 0; i < this._mutators.length; i++)
                this._mutators[i].mutate(probability, scale);
        }
    }
}