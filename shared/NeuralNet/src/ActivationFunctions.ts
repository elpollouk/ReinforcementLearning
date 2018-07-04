namespace NeuralNet.ActivationFunctions {
    
    export type ActivationFunction = (inputs: number[], weights: number[]) => number;

    export function ReLU(inputs: number[], weights: number[]) {
        let sum: number = 0;
        for (let i = 0; i < inputs.length; i++)
            sum += (inputs[i] * weights[i]);

        return sum;
    }
}