namespace NeuralNet.Utils {
    export type ValueGenerator = number[] | (() => number);
    
    export function ArrayValueGenerator(values: number[]) : ValueGenerator {
        let i = 0;
        return () => values[i++];
    }

    export function RandomValueGenerator() : ValueGenerator {
        return () => Math.random();
    }
}