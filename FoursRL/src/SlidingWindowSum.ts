namespace Fours {
    export class SlidingWindowSum {
        public values: number[];

        private _window: number[][] = [];

        public constructor(public windowSize: number, initial: number[] = null) {
            if (initial)
                this.add(initial);
        }

        public add(values: number[]) {
            if (!this.values) {
                this.values = values.slice(0);
            }
            else {
                for (let i = 0; i < values.length; i++)
                    this.values[i] += values[i];

                if (this._window.length == this.windowSize) {
                    let old = this._window.shift();
                    for (let i = 0; i < old.length; i++)
                        this.values[i] -= old[i];
                }
            }

            this._window.push(values);
        }
    }
}