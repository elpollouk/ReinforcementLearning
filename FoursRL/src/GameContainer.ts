namespace Fours {
    export class GameContainer {
        public readonly game: Game;
        public readonly agentRed: Agent;
        public readonly agentBlue: Agent;
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

            this.agentRed = agentRed || new Agent(0);
            this.agentBlue = agentBlue || new Agent(0);
        }

        public act() {
            if (this.game.currentPlayer === PLAYER_RED)
                this.agentRed.act(this.game);
            else
                this.agentBlue.act(this.game);
        }

        public reset() {
            this.game.reset();
        }
    }
}