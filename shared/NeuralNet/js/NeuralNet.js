var NeuralNet;
(function (NeuralNet) {
    var ActivationFunctions;
    (function (ActivationFunctions) {
        function ReLU(inputs, weights) {
            let sum = Linear(inputs, weights);
            if (sum < 0)
                sum = 0;
            return sum;
        }
        ActivationFunctions.ReLU = ReLU;
        function Linear(inputs, weights) {
            let sum = 0;
            for (let i = 0; i < inputs.length; i++)
                sum += (inputs[i] * weights[i]);
            return sum;
        }
        ActivationFunctions.Linear = Linear;
        function Sigmoid(scale = 1) {
            return (inputs, weights) => {
                let value = 0;
                for (let i = 0; i < inputs.length; i++)
                    value += (inputs[i] * weights[i]);
                value = 1 / (1 + Math.exp(-value * scale));
                return value;
            };
        }
        ActivationFunctions.Sigmoid = Sigmoid;
    })(ActivationFunctions = NeuralNet.ActivationFunctions || (NeuralNet.ActivationFunctions = {}));
})(NeuralNet || (NeuralNet = {}));
var NeuralNet;
(function (NeuralNet) {
    class Network {
        constructor() {
            this._layers = [];
            this.inputs = [];
        }
        get outputs() {
            return this._layers[this._layers.length - 1].outputs;
        }
        activate() {
            for (let i = 0; i < this._layers.length; i++)
                this._layers[i].activate();
            return this.outputs;
        }
        setInputSize(size) {
            this.inputs = new Array(size).fill(0);
        }
        addLayer(layer) {
            let inputs = this.inputs;
            if (this._layers.length != 0) {
                inputs = this.outputs;
            }
            layer.setInputs(inputs);
            this._layers.push(layer);
        }
        addNeuronLayer(size = 0, activation = null) {
            let layer = new NeuralNet.NeuronLayer(size, activation);
            this.addLayer(layer);
            layer.initialiseWeights();
            return layer;
        }
        addNormalisingLayer() {
            let layer = new NeuralNet.NormalisingLayer();
            this.addLayer(layer);
            return layer;
        }
        toJson() {
            let layers = [];
            for (let i = 0; i < this._layers.length; i++) {
                let data = this._layers[i].toJson();
                data["type"] = this._layers[i].type;
                layers.push(data);
            }
            return {
                "layers": layers
            };
        }
        fromJson(json) {
            let layers = json["layers"];
            if (layers.length != this._layers.length)
                throw new Error("Incorrect number of layers");
            for (let i = 0; i < layers.length; i++) {
                let layerData = layers[i];
                if (layerData["type"] != this._layers[i].type)
                    throw new Error(`Layer types don't match. Expected ${this._layers[i].type} but got ${layerData["type"]}`);
                this._layers[i].fromJson(layerData);
            }
        }
    }
    NeuralNet.Network = Network;
})(NeuralNet || (NeuralNet = {}));
/// <reference path="Network.ts" />
var NeuralNet;
(function (NeuralNet) {
    var Genetic;
    (function (Genetic) {
        class Mutator {
            constructor(_target) {
                this._target = _target;
            }
            mutate(probability, scale) {
                let weights = this._target.weights;
                for (let i = 0; i < weights.length; i++) {
                    if (Math.random() < probability) {
                        let delta = (Math.random() * scale * 2) - scale;
                        weights[i] += delta;
                    }
                }
            }
        }
        class Network extends NeuralNet.Network {
            constructor() {
                super(...arguments);
                this._mutators = [];
            }
            addNeuronLayer(size = 0, activation = null) {
                let layer = super.addNeuronLayer(size, activation);
                for (let i = 0; i < layer.neurons.length; i++) {
                    let mutator = new Mutator(layer.neurons[i]);
                    this._mutators.push(mutator);
                }
                return layer;
            }
            mutate(probability, scale) {
                for (let i = 0; i < this._mutators.length; i++)
                    this._mutators[i].mutate(probability, scale);
            }
        }
        Genetic.Network = Network;
    })(Genetic = NeuralNet.Genetic || (NeuralNet.Genetic = {}));
})(NeuralNet || (NeuralNet = {}));
var NeuralNet;
(function (NeuralNet) {
    class Neuron {
        constructor(_activation = null) {
            this._activation = _activation;
            this._output = 0;
            this.inputs = [];
            this.weights = [];
            this._activation = this._activation || NeuralNet.ActivationFunctions.ReLU;
        }
        get output() {
            return this._output;
        }
        activate() {
            this._output = this._activation(this.inputs, this.weights);
            return this._output;
        }
        setInputs(inputs, weights = null) {
            this.inputs = inputs;
            if (weights)
                this.initialiseWeights(weights);
        }
        initialiseWeights(weights = null) {
            weights = weights || NeuralNet.Utils.RandomValueGenerator(-1, 1);
            if (typeof weights !== "function") {
                weights = NeuralNet.Utils.ArrayValueGenerator(weights);
                this.initialiseWeights(weights);
            }
            else {
                this.weights = new Array(this.inputs.length);
                for (let i = 0; i < this.weights.length; i++)
                    this.weights[i] = weights();
            }
        }
    }
    NeuralNet.Neuron = Neuron;
})(NeuralNet || (NeuralNet = {}));
var NeuralNet;
(function (NeuralNet) {
    class NeuronLayer {
        constructor(size = 0, activation = null) {
            this.type = "neuron";
            this.inputs = [];
            this.outputs = [];
            this.neurons = [];
            while (size-- > 0) {
                let neuron = new NeuralNet.Neuron(activation);
                this.addNeuron(neuron);
            }
            this.initialiseWeights();
        }
        activate() {
            for (let i = 0; i < this.neurons.length; i++)
                this.outputs[i] = this.neurons[i].activate();
            return this.outputs;
        }
        addNeuron(neuron) {
            this.neurons.push(neuron);
            this.outputs.push(0);
            neuron.setInputs(this.inputs);
        }
        setInputs(inputs) {
            this.inputs = inputs;
            for (let i = 0; i < this.neurons.length; i++)
                this.neurons[i].setInputs(inputs);
        }
        initialiseWeights(weights = null) {
            for (let i = 0; i < this.neurons.length; i++)
                this.neurons[i].initialiseWeights(weights);
        }
        toJson() {
            let neurons = [];
            for (let i = 0; i < this.neurons.length; i++) {
                neurons.push({
                    "weights": this.neurons[i].weights
                });
            }
            return {
                "neurons": neurons
            };
        }
        fromJson(json) {
            let neurons = json["neurons"];
            if (neurons.length != this.neurons.length)
                throw new Error("Invalid number of neurons for layer.");
            for (let i = 0; i < neurons.length; i++) {
                let weights = neurons[i]["weights"];
                this.neurons[i].initialiseWeights(weights);
            }
        }
    }
    NeuralNet.NeuronLayer = NeuronLayer;
})(NeuralNet || (NeuralNet = {}));
var NeuralNet;
(function (NeuralNet) {
    class NormalisingLayer {
        constructor() {
            this.type = "normalising";
            this.inputs = [];
            this.outputs = [];
        }
        setInputs(inputs) {
            this.inputs = inputs;
            this.outputs = new Array(inputs.length).fill(0);
        }
        activate() {
            let max = this.inputs[0];
            for (let i = 1; i < this.inputs.length; i++)
                if (max < this.inputs[i])
                    max = this.inputs[i];
            for (let i = 0; i < this.inputs.length; i++)
                this.outputs[i] = this.inputs[i] / max;
            return this.outputs;
        }
        toJson() {
            return {};
        }
        fromJson(json) {
        }
    }
    NeuralNet.NormalisingLayer = NormalisingLayer;
})(NeuralNet || (NeuralNet = {}));
var NeuralNet;
(function (NeuralNet) {
    var Utils;
    (function (Utils) {
        class ArrayWriter {
            constructor(array, _offset = 0, size = array.length) {
                this.array = array;
                this._offset = _offset;
                this.size = size;
                this._position = 0;
            }
            get position() {
                return this._position;
            }
            get availableSpace() {
                return this.size - this._position;
            }
            write(...values) {
                if (this.availableSpace < values.length)
                    throw new Error("Not enough space in buffer");
                let offset = this._offset + this._position;
                for (let i = 0; i < values.length; i++)
                    this.array[offset + i] = values[i];
                this._position += values.length;
            }
            seek(position) {
                this._position = position;
            }
        }
        Utils.ArrayWriter = ArrayWriter;
    })(Utils = NeuralNet.Utils || (NeuralNet.Utils = {}));
})(NeuralNet || (NeuralNet = {}));
var NeuralNet;
(function (NeuralNet) {
    var Utils;
    (function (Utils) {
        function ArrayValueGenerator(values) {
            let i = 0;
            return () => values[i++];
        }
        Utils.ArrayValueGenerator = ArrayValueGenerator;
        function RandomValueGenerator(min = 0, max = 1) {
            let range = max - min;
            return () => (Math.random() * range) + min;
        }
        Utils.RandomValueGenerator = RandomValueGenerator;
    })(Utils = NeuralNet.Utils || (NeuralNet.Utils = {}));
})(NeuralNet || (NeuralNet = {}));
//# sourceMappingURL=NeuralNet.js.map