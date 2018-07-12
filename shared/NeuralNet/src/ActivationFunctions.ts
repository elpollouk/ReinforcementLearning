namespace NeuralNet.ActivationFunctions {
    
    export interface ActivationFunction {
        transfer(activation: number): number;
        derivative(activation: number): number;
    }

    class _ReLU implements ActivationFunction {
        public transfer(activation: number): number {
            if (activation < 0)
                return 0;

            return activation;
        }

        public derivative(activation: number): number {
            if (activation < 0)
                return 0;

            return 1;
        }
    }

    class _Linear implements ActivationFunction {
        public transfer(activation: number): number {
            return activation;
        }

        public derivative(activation: number): number {
            return 1;
        }
    }

    export function ReLU() {
        return new _ReLU();
    }

    export function Linear() {
        return new _Linear();
    }

    /*export function Sigmoid(scale: number = 1): ActivationFunction {
        return (inputs: number[], weights: number[]) => {
            let value: number = 0;
            for (let i = 0; i < inputs.length; i++)
                value += (inputs[i] * weights[i]);

            value = 1 / (1 + Math.exp(-value * scale));

            return value;
        }
    }*/
}