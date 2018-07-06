namespace NeuralNet {
    export class NormalisingLayer implements ILayer {
        public readonly type = "normalising";
        public inputs: number[] = [];
        public outputs: number[] = [];

        public setInputs(inputs: number[]) {
            this.inputs = inputs;
            this.outputs = new Array(inputs.length).fill(0);
        }

        public activate(): number[] {
            let max = this.inputs[0];
            for (let i = 1; i < this.inputs.length; i++)
                if (max < this.inputs[i])
                    max = this.inputs[i];

            for (let i = 0; i < this.inputs.length; i++)
                this.outputs[i] = this.inputs[i] / max;

            return this.outputs;
        }

        public toJson(): any {
            return {};
        }

        public fromJson(json: any) {
            
        }
    }
}