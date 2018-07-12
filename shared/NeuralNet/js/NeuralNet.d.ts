declare namespace NeuralNet.ActivationFunctions {
    interface ActivationFunction {
        transfer(activation: number): number;
        derivative(activation: number): number;
    }
    class _ReLU implements ActivationFunction {
        transfer(activation: number): number;
        derivative(activation: number): number;
    }
    class _Linear implements ActivationFunction {
        transfer(activation: number): number;
        derivative(activation: number): number;
    }
    function ReLU(): _ReLU;
    function Linear(): _Linear;
}
declare namespace NeuralNet {
    class Neuron {
        protected _activationFunc: ActivationFunctions.ActivationFunction;
        private _output;
        private _activationValue;
        inputs: number[];
        weights: number[];
        constructor(_activationFunc?: ActivationFunctions.ActivationFunction);
        readonly output: number;
        readonly activation: number;
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
        protected constructNeuron(activation: ActivationFunctions.ActivationFunction): Neuron;
        activate(): number[];
        addNeuron(neuron: Neuron): void;
        setInputs(inputs: number[]): void;
        initialiseWeights(weights?: Utils.ValueGenerator): void;
        toJson(): any;
        fromJson(json: any): void;
    }
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
        fromJson(json: any): void;
    }
}
declare namespace NeuralNet.Backprop {
    class Network extends NeuralNet.Network {
        private _backpropLayers;
        addNeuronLayer(size?: number, activation?: ActivationFunctions.ActivationFunction): NeuronLayer;
        train(target: number[], learningRate: number): void;
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
        fromJson(json: any): any;
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
        fromJson(json: any): void;
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
    function RandomValueGenerator(min?: number, max?: number): ValueGenerator;
}
