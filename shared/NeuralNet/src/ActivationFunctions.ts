namespace NeuralNet.ActivationFunctions {
    
    export type ActivationFunction = (inputs: number[], weights: number[]) => number;

    export function ReLU(inputs: number[], weights: number[]): number {
        let sum = Linear(inputs, weights);

        if (sum < 0)
            sum = 0;

        return sum;
    }

    export function Linear(inputs: number[], weights: number[]): number {
        let sum: number = 0;
        for (let i = 0; i < inputs.length; i++)
            sum += (inputs[i] * weights[i]);

        return sum;
    }

    export function Sigmoid(scale: number = 1): ActivationFunction {
        return (inputs: number[], weights: number[]) => {
            let value: number = 0;
            for (let i = 0; i < inputs.length; i++)
                value += (inputs[i] * weights[i]);

            value = 1 / (1 + Math.exp(-value * scale));

            return value;
        }
    }
}