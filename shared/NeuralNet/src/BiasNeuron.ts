namespace NeuralNet {
    export class BiasNeuron extends Neuron {
        public constructor() {
            super(ActivationFunctions.Constant());
            this._output = 1;
            this._activationValue = 1;
        }

        public activate(): number {
            return this._output;
        }

        public initialiseWeights(weights: Utils.ValueGenerator = null) {
            weights = () => 0;
            super.initialiseWeights(weights);
        }
    }
}