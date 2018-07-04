declare namespace NeuralNet.ActivationFunctions {
    type ActivationFunction = (inputs: number[], weights: number[]) => number;
    function ReLU(inputs: number[], weights: number[]): number;
}
declare namespace NeuralNet {
    class Network {
        private _layers;
        inputs: number[];
        readonly outputs: number[];
        activate(): number[];
        setInputSize(size: number): void;
        addLayer(layer: ILayer): void;
        addNeuronLayer(size?: number, activation?: ActivationFunctions.ActivationFunction): NeuronLayer;
        addNormalisingLayer(): NormalisingLayer;
        toJson(): any;
    }
}
declare namespace NeuralNet.Genetic {
    class Network extends NeuralNet.Network {
        private _mutators;
        addNeuronLayer(size?: number, activation?: ActivationFunctions.ActivationFunction): NeuronLayer;
        mutate(probability: number, scale: number): void;
    }
}
declare namespace NeuralNet {
    interface ILayer {
        readonly type: string;
        outputs: number[];
        setInputs(inputs: number[]): any;
        activate(): number[];
        toJson(): any;
    }
}
declare namespace NeuralNet {
    class Neuron {
        private _activation;
        private _output;
        inputs: number[];
        weights: number[];
        constructor(_activation?: ActivationFunctions.ActivationFunction);
        readonly output: number;
        activate(): number;
        setInputs(inputs: number[], weights?: Utils.ValueGenerator): void;
        initialiseWeights(weights?: Utils.ValueGenerator): void;
    }
}
declare namespace NeuralNet {
    class NeuronLayer implements ILayer {
        readonly type: string;
        inputs: number[];
        outputs: number[];
        neurons: Neuron[];
        constructor(size?: number, activation?: ActivationFunctions.ActivationFunction);
        activate(): number[];
        addNeuron(neuron: Neuron): void;
        setInputs(inputs: number[]): void;
        initialiseWeights(weights?: Utils.ValueGenerator): void;
        toJson(): any;
    }
}
declare namespace NeuralNet {
    class NormalisingLayer implements ILayer {
        readonly type: string;
        inputs: number[];
        outputs: number[];
        setInputs(inputs: number[]): void;
        activate(): number[];
        toJson(): any;
    }
}
declare namespace NeuralNet.Utils {
    class ArrayWriter<T> {
        readonly array: T[];
        private _offset;
        readonly size: number;
        _position: number;
        readonly position: number;
        readonly availableSpace: number;
        constructor(array: T[], _offset?: number, size?: number);
        write(...values: T[]): void;
        seek(position: number): void;
    }
}
declare namespace NeuralNet.Utils {
    type ValueGenerator = number[] | (() => number);
    function ArrayValueGenerator(values: number[]): ValueGenerator;
    function RandomValueGenerator(): ValueGenerator;
}
