namespace NeuralNet.Utils {
    export type ValueGenerator = number[] | (() => number);
    
    export function ArrayValueGenerator(values: number[]) : ValueGenerator {
        let i = 0;
        return () => values[i++];
    }

    export function RandomValueGenerator(min: number = 0, max: number = 1) : ValueGenerator {
        let range = max - min;
        return () => (Math.random() * range) + min;
    }
}