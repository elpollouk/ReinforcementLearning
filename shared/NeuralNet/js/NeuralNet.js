var NeuralNet;
(function (NeuralNet) {
    var ActivationFunctions;
    (function (ActivationFunctions) {
        function ReLU(inputs, weights) {
            let sum = 0;
            for (let i = 0; i < inputs.length; i++)
                sum += (inputs[i] * weights[i]);
            return sum;
        }
        ActivationFunctions.ReLU = ReLU;
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
    }
    NeuralNet.Network = Network;
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
            weights = weights || NeuralNet.Utils.RandomValueGenerator();
            if (typeof weights === "function") {
                this.weights = Array(this.inputs.length);
                for (let i = 0; i < this.weights.length; i++)
                    this.weights[i] = weights();
            }
            else {
                this.weights = weights;
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
            this._neurons = [];
            while (size-- > 0) {
                let neuron = new NeuralNet.Neuron(activation);
                this.addNeuron(neuron);
            }
            this.initialiseWeights();
        }
        activate() {
            for (let i = 0; i < this._neurons.length; i++)
                this.outputs[i] = this._neurons[i].activate();
            return this.outputs;
        }
        addNeuron(neuron) {
            this._neurons.push(neuron);
            this.outputs.push(0);
            neuron.setInputs(this.inputs);
        }
        setInputs(inputs) {
            this.inputs = inputs;
            for (let i = 0; i < this._neurons.length; i++)
                this._neurons[i].setInputs(inputs);
        }
        initialiseWeights(weights = null) {
            for (let i = 0; i < this._neurons.length; i++)
                this._neurons[i].initialiseWeights(weights);
        }
        toJson() {
            let neurons = [];
            for (let i = 0; i < this._neurons.length; i++) {
                neurons.push({
                    "weights": this._neurons[i].weights
                });
            }
            return {
                "neurons": neurons
            };
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
    }
    NeuralNet.NormalisingLayer = NormalisingLayer;
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
        function RandomValueGenerator() {
            return () => Math.random();
        }
        Utils.RandomValueGenerator = RandomValueGenerator;
    })(Utils = NeuralNet.Utils || (NeuralNet.Utils = {}));
})(NeuralNet || (NeuralNet = {}));
//# sourceMappingURL=NeuralNet.js.map