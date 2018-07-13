namespace Fours {
    export class TrajectorySample {
        public constructor(public inputs: number[], public expected: number[] = null) {
            this.inputs = this.inputs.slice(0);
        }
    }

    export class TrajectoryMemory {
        public memory: TrajectorySample[] = [];

        constructor(public readonly limit: number = 0) {

        }

        public reset() {
            this.memory = [];
        }

        public get hasSamples(): boolean {
            return this.memory.length != 0;
        }

        public record(inputs: number[], expected: number[] = null) {
            let sample = new TrajectorySample(inputs, expected);
            this.recordSample(sample);
        }

        public recordSample(sample: TrajectorySample) {
            this.memory.push(sample);
            if (this.limit && this.memory.length > this.limit)
                this.memory.shift();
        }

        public pop(): TrajectorySample {
            return this.memory.pop();
        }

        public sample(count: number): TrajectorySample[] {
            if (this.memory.length < count)
                count = this.memory.length;
            
            let samples = new Array<TrajectorySample>(count);

            let sampleProb = count / this.memory.length;

            for (let i = 0; i < this.memory.length; i++) {
                if (i < count) {
                    samples[i] = this.memory[i];
                }
                else if (Math.random() < sampleProb) {
                    let replaceIndex = Math.floor(Math.random() * count);
                    samples[replaceIndex] = this.memory[i];
                }
            }

            return samples;
        }
    }
}