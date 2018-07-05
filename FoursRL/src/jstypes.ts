namespace Fours {
    export const PLAYER_RED = "playerRed";
    export const PLAYER_BLUE = "playerBlue";

    export declare class Game {
        container: HTMLElement;
        width: number;
        height: number;
        winLength: number;
        currentPlayer: string;
        gameover: boolean;
        winner: string;
        state: string[][];

        reset();
        action(column: number): boolean;
        undo();
    }
}