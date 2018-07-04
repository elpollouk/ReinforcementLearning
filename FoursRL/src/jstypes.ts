namespace Fours {
    export const PLAYER_RED = "playerRed";
    export const PLAYER_BLUE = "playerBlue";

    export interface Game {
        width: number;
        height: number;
        winLength: number;
        currentPlayer: string;
        winner: string;
        state: string[][];

        reset();
        action(column: number): boolean;
        undo();
    }
}