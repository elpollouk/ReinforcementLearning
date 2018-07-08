namespace Fours {
    export class SlidingWindowSum {
        public sum: number[];
        public average: number[];

        private _window: number[][] = [];

        public constructor(public windowSize: number, initial: number[] = null) {
            if (initial)
                this.add(initial);
        }

        public add(values: number[]) {
            if (!this.sum) {
                this.sum = values.slice(0);
                this.average = values.slice(0);
            }
            else {
                let sampleSize = values.length;
                let numSamples = this._window.length

                for (let i = 0; i < sampleSize; i++)
                    this.sum[i] += values[i];

                if (numSamples == this.windowSize) {
                    let old = this._window.shift();
                    for (let i = 0; i < sampleSize; i++)
                        this.sum[i] -= old[i];
                }

                for (let i = 0; i < sampleSize; i++)
                    this.average[i] = this.sum[i] / numSamples;
            }

            this._window.push(values);
        }
    }
}