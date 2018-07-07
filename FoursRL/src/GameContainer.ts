namespace Fours {
    export class GameContainer {
        public readonly game: Game;
        public readonly agentRed: Agent;
        public readonly agentBlue: Agent;
        public readonly memoryRed: TrajectoryMemory = new TrajectoryMemory();
        public readonly memoryBlue: TrajectoryMemory = new TrajectoryMemory();
        public readonly element: HTMLElement;

        public constructor(parent: HTMLElement, agentRed: Agent = null, agentBlue: Agent = null) {
            let gameArea = parent.ownerDocument.createElement("div");
            gameArea.classList.add("gameArea");

            this.element = parent.ownerDocument.createElement("div");
            this.element.classList.add("gameContainer");

            this.game = window["createGame"](7, 6);

            gameArea.appendChild(this.game.container);
            this.element.appendChild(gameArea);
            parent.appendChild(this.element);

            this.agentRed = agentRed || new Agent();
            this.agentBlue = agentBlue || new Agent();
        }

        private actWithAgent(agent: Agent, memory: TrajectoryMemory) {
            let sample = agent.act(this.game);
            memory.recordSample(sample);
        }

        public act() {
            if (this.game.currentPlayer === PLAYER_RED)
                this.actWithAgent(this.agentRed, this.memoryRed);
            else
                this.actWithAgent(this.agentBlue, this.memoryBlue);
        }

        public reset() {
            this.game.reset();
            this.memoryRed.reset();
            this.memoryBlue.reset();
        }
    }
}