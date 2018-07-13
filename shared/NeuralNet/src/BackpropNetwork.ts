/// <reference path="Neuron.ts" />
/// <reference path="NeuronLayer.ts" />
/// <reference path="Network.ts" />

namespace NeuralNet.Backprop {
    function getScaleFactor(from: number, to: number): number {
        if (from === to) return 1;
        if (to == 0) return 0;
        return to / from;
    }

    function asBackpropNeuron(neuron: Neuron): BackpropNeuron {
        if (neuron.constructor === BackpropNeuron)
            return neuron as BackpropNeuron;
        return null;
    }

    class BackpropNeuron extends Neuron {
        public backDelta: number;
        private _previousWeightDeltas: number[] = [];

        public initialiseWeights(weights: Utils.ValueGenerator = null) {
            super.initialiseWeights(weights);

            this._previousWeightDeltas = new Array<number>(this.weights.length);
            for (let i = 0; i < this._previousWeightDeltas.length; i++)
                this._previousWeightDeltas[i] = 0;
        }

        public updateWeights(learningRate: number, momentum: number) {
            for (let i = 0; i < this.weights.length; i++) {
                let delta = learningRate * this.backDelta * this.inputs[i];
                this.weights[i] += delta + (momentum * this._previousWeightDeltas[i]);
                this._previousWeightDeltas[i] = delta;
            }
        }

        public trainAsOutput(target: number) {
            let error = this._activationFunc.derivative(this.activation) * (target - this.output);

            this.backDelta = error;
        }

        public trainAsHidden(index: number, forwardLayer: NeuronLayer) {
            let backDelta = 0;
            for (let i = 0; i < forwardLayer.neurons.length; i++) {
                let neuron = asBackpropNeuron(forwardLayer.neurons[i]);
                if (neuron) {
                    let contribution = neuron.backDelta * neuron.weights[index]
                    let normalisationScale = getScaleFactor(this.output, neuron.inputs[index]);
                    contribution *= normalisationScale;
                    backDelta += contribution;
                }
            }

            backDelta *= this._activationFunc.derivative(this.activation);

            this.backDelta = backDelta
        }
    }

    class BackpropLayer extends NeuronLayer {
        protected constructNeuron(activation: ActivationFunctions.ActivationFunction) {
            return new BackpropNeuron(activation);
        }

        private forEachBackPropNeuron(callback: (index: number, neuron: BackpropNeuron) => void) {
            for (let i = 0; i < this.neurons.length; i++) {
                let neuron = asBackpropNeuron(this.neurons[i]);
                if (neuron)
                    callback(i, neuron);
            }
        }

        public trainAsOutput(target: number[]) {
            this.forEachBackPropNeuron((i, n) => n.trainAsOutput(target[i]));
        }

        public trainAsHidden(forwardLayer: NeuronLayer) {
            this.forEachBackPropNeuron((i, n) => n.trainAsHidden(i, forwardLayer));
        }

        public updateWeights(learningRate: number, momentum: number) {
            this.forEachBackPropNeuron((_, n) => n.updateWeights(learningRate, momentum));
        }
    }

    export class Network extends NeuralNet.Network {
        private _backpropLayers: BackpropLayer[] = [];

        public addNeuronLayer(size: number = 0, activation: ActivationFunctions.ActivationFunction = null, addBias = true): NeuronLayer {
            let layer = new BackpropLayer(size, activation, addBias);
            this.addLayer(layer);
            layer.initialiseWeights();

            this._backpropLayers.push(layer);

            return layer;
        }

        public train(target: number[], learningRate: number, momentum: number) {
            let layerIndex = this._backpropLayers.length - 1;

            this._backpropLayers[layerIndex].trainAsOutput(target);
            while (layerIndex > 0) {
                let forwardLayer = this._backpropLayers[layerIndex];
                layerIndex--;
                this._backpropLayers[layerIndex].trainAsHidden(forwardLayer);
            }

            for (let i = 0; i <  this._backpropLayers.length; i++)
                this._backpropLayers[i].updateWeights(learningRate, momentum);
        }
    }
}
