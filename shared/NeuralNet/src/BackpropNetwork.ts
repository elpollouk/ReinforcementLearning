/// <reference path="Neuron.ts" />
/// <reference path="NeuronLayer.ts" />
/// <reference path="Network.ts" />

// NOTE TO SELF:
//    This only really works for linear activation currently

namespace NeuralNet.Backprop {
    class BackpropNeuron extends Neuron {
        public backDelta: number;

        private updateWeights(backDelta: number, learningRate: number) {
            this.backDelta = backDelta;

            for (let i = 0; i < this.weights.length; i++)
                this.weights[i] += learningRate * backDelta * this.inputs[i];
        }

        public trainAsOutput(target: number, learningRate: number) {
            let error = target - this.output;
            this.updateWeights(error, learningRate);
        }

        public trainAsHidden(index: number, forwardLayer: NeuronLayer, learningRate: number) {
            let backDelta = 0;
            for (let i = 0; i < forwardLayer.neurons.length; i++) {
                let neuron = forwardLayer.neurons[i] as BackpropNeuron;
                backDelta += neuron.backDelta * neuron.weights[index];
            }

            this.updateWeights(backDelta, learningRate);
        }
    }

    class BackpropLayer extends NeuronLayer {
        protected constructNeuron(activation: ActivationFunctions.ActivationFunction) {
            return new BackpropNeuron(activation);
        }

        public trainAsOutput(target: number[], learningRate: number) {
            for (let i = 0; i < this.neurons.length; i++) {
                let neuron = this.neurons[i] as BackpropNeuron;
                neuron.trainAsOutput(target[i], learningRate);
            }
        }

        public trainAsHidden(forwardLayer: NeuronLayer, learningRate: number) {
            for (let i = 0; i < this.neurons.length; i++) {
                let neuron = this.neurons[i] as BackpropNeuron;
                neuron.trainAsHidden(i, forwardLayer, learningRate);
            }
        }
    }

    export class Network extends NeuralNet.Network {
        private backpropLayers: BackpropLayer[] = [];

        public addNeuronLayer(size: number = 0, activation: ActivationFunctions.ActivationFunction = null): NeuronLayer {
            let layer = new BackpropLayer(size, activation);
            this.addLayer(layer);
            layer.initialiseWeights();

            this.backpropLayers.push(layer);

            return layer;
        }

        public train(target: number[], learningRate: number) {
            let layerIndex = this.backpropLayers.length - 1;

            this.backpropLayers[layerIndex].trainAsOutput(target, learningRate);
            while (layerIndex > 0) {
                let forwardLayer = this.backpropLayers[layerIndex];
                layerIndex--;
                this.backpropLayers[layerIndex].trainAsHidden(forwardLayer, learningRate);
            }
        }
    }
}
