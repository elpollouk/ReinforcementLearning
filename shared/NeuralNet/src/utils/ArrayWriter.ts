namespace NeuralNet.Utils {
    export class ArrayWriter<T> {
        public _position: number;

        public get position(): number {
            return this._position;
        }

        public get availableSpace(): number {
            return this.size - this._position;
        }

        public constructor(public readonly array: T[], private _offset: number = 0, public readonly size: number = array.length) {
            this._position = 0;
        }

        public write(...values: T[]) {
            if (this.availableSpace < values.length)
                throw new Error("Not enough space in buffer");

            let offset = this._offset + this._position;
            for (let i = 0; i < values.length; i++)
                this.array[offset + i] = values[i];
            
            this._position += values.length;
        }

        public seek(position: number) {
            this._position = position;
        }
    }
}