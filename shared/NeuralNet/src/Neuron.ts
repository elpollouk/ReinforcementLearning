namespace NeuralNet {
    export class Neuron {
        private _output: number = 0;
        public inputs: number[] = [];
        public weights: number[] = [];

        public constructor(private _activation : ActivationFunctions.ActivationFunction = null) {
            this._activation = this._activation || ActivationFunctions.ReLU;
        }

        public get output() : number {
            return this._output;
        }

        public activate(): number {
            this._output = this._activation(this.inputs, this.weights);
            return this._output;
        }

        public setInputs(inputs: number[], weights: Utils.ValueGenerator = null) {
            this.inputs = inputs;
            if (weights)
                this.initialiseWeights(weights);
        }

        public initialiseWeights(weights: Utils.ValueGenerator = null) {
            weights = weights || Utils.RandomValueGenerator(-1, 1);
            
            if (typeof weights !== "function") {
                weights = Utils.ArrayValueGenerator(weights);
                this.initialiseWeights(weights);
            }
            else {
                this.weights = new Array<number>(this.inputs.length);
                for (let i = 0; i < this.weights.length; i++)
                    this.weights[i] = weights();
            }
        }
    }
}