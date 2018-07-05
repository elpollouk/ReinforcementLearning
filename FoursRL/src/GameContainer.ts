namespace Fours {
    export class GameContainer {
        public readonly game: Game;
        public readonly agentRed: Agent;
        public readonly agentBlue: Agent;
        public readonly element: HTMLElement;
        public redScore: number = 0;
        public blueScore: number = 0;

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

        public act() {
            if (this.game.currentPlayer === PLAYER_RED)
                this.agentRed.act(this.game);
            else
                this.agentBlue.act(this.game);

            if (this.game.gameover) {
                if (this.game.winner === PLAYER_RED) {
                    this.redScore += 3;
                }
                else if (this.game.winner === PLAYER_BLUE) {
                    this.blueScore += 3;
                }
                else {
                    this.redScore++;
                    this.blueScore++;
                }
            }
        }

        public reset() {
            this.game.reset();
            this.agentRed.mutate();
            this.agentBlue.mutate();
        }
    }
}