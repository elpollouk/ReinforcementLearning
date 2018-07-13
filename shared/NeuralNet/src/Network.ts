namespace NeuralNet {
    export class Network {
        private _layers: ILayer[] = [];
        public inputs: number[] = [];

        public get outputs(): number[] {
            return this._layers[this._layers.length - 1].outputs;
        }

        public activate() {
            for (let i = 0; i < this._layers.length; i++)
                this._layers[i].activate();

            return this.outputs;
        }

        public setInputSize(size: number) {
            this.inputs = new Array<number>(size).fill(0);
        }

        public addLayer(layer: ILayer) {
            let inputs = this.inputs;
            if (this._layers.length != 0) {
                inputs = this.outputs;
            }

            layer.setInputs(inputs);

            this._layers.push(layer);
        }

        public addNeuronLayer(size: number = 0, activation: ActivationFunctions.ActivationFunction = null, addBias = true): NeuronLayer {
            let layer = new NeuronLayer(size, activation, addBias);
            this.addLayer(layer);
            layer.initialiseWeights();
            return layer;
        }

        public addNormalisingLayer(): NormalisingLayer {
            let layer = new NormalisingLayer();
            this.addLayer(layer);
            return layer;
        }

        public toJson(): any {
            let layers = [];
            for (let i = 0; i < this._layers.length; i++) {
                let data = this._layers[i].toJson();
                data["type"] = this._layers[i].type;
                layers.push(data);
            }

            return {
                "layers" : layers
            };
        }

        public fromJson(json: any) {
            let layers = json["layers"] as any[];
            if (layers.length != this._layers.length)
                throw new Error("Incorrect number of layers");

            for (let i = 0; i < layers.length; i++) {
                let layerData = layers[i];
                if (layerData["type"] != this._layers[i].type)
                    throw new Error(`Layer types don't match. Expected ${this._layers[i].type} but got ${layerData["type"]}`);

                this._layers[i].fromJson(layerData);
            }
        }
    }
}