namespace NeuralNet {
    export class Neuron {
        protected _output: number = 0;
        protected _activationValue: number = 0;
        public inputs: number[] = [];
        public weights: number[] = [];

        public constructor(protected _activationFunc : ActivationFunctions.ActivationFunction = null) {
            this._activationFunc = this._activationFunc || ActivationFunctions.ReLU();
        }

        public get output(): number {
            return this._output;
        }

        public get activation(): number {
            return this._activationValue;
        }

        public activate(): number {
            this._activationValue = 0;
            for (let i = 0; i < this.inputs.length; i++)
            {
                this._activationValue += (this.inputs[i] * this.weights[i]);
            }
            this._output = this._activationFunc.transfer(this._activationValue);
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
            }
            
            this.weights = new Array<number>(this.inputs.length);
            for (let i = 0; i < this.weights.length; i++)
                this.weights[i] = (weights as Function)();            
        }
    }
}