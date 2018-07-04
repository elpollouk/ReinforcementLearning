// All the interfaces in a single file to help the TypeScript compiler not generate lots of useless code
namespace NeuralNet {
    export interface ILayer {
        readonly type: string;
        outputs: number[];
        setInputs(inputs: number[]);
        activate(): number[];

        toJson(): any;
    }
}