namespace NeuralNet {
    export class NeuronLayer implements ILayer {
        public readonly type = "neuron";
        public inputs: number[] = [];
        public outputs: number[] = [];
        public neurons: Neuron[] = [];

        public constructor(size = 0, activation: ActivationFunctions.ActivationFunction = null) {
            while (size --> 0) {
                let neuron = new Neuron(activation);
                this.addNeuron(neuron);
            }

            this.initialiseWeights();
        }

        public activate(): number[] {
            for (let i = 0; i < this.neurons.length; i++)
                this.outputs[i] = this.neurons[i].activate();

            return this.outputs;
        }

        public addNeuron(neuron: Neuron) {
            this.neurons.push(neuron);
            this.outputs.push(0);

            neuron.setInputs(this.inputs);
        }

        public setInputs(inputs: number[]) {
            this.inputs = inputs;
            for (let i = 0; i < this.neurons.length; i++)
                this.neurons[i].setInputs(inputs);
        }

        public initialiseWeights(weights: Utils.ValueGenerator = null) {
            for (let i = 0; i < this.neurons.length; i++)
                this.neurons[i].initialiseWeights(weights);
        }

        public toJson(): any {
            let neurons = [];
            for (let i = 0; i < this.neurons.length; i++) {
                neurons.push({
                    "weights": this.neurons[i].weights
                });
            }

            return {
              "neurons" : neurons
            };
        }
    }
}