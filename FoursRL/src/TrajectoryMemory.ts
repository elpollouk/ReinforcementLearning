namespace Fours {
    export class TrajectorySample {
        public constructor(public inputs: number[], public output: number) {
            this.inputs = this.inputs.slice(0);
        }
    }

    export class TrajectoryMemory {
        public memory: TrajectorySample[] = [];

        public reset() {
            this.memory = [];
        }

        public record(inputs: number[], output: number) {
            let sample = new TrajectorySample(inputs, output);
            this.recordSample(sample);
        }

        public recordSample(sample: TrajectorySample) {
            this.memory.push(sample);
        }

        public pop(): TrajectorySample {
            return this.memory.pop();
        }
    }
}