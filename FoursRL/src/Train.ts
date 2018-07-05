namespace Fours {

    let gameContainers: GameContainer[] = [];

    let numGames = 0;
    let statsOutput: HTMLElement;

    export function TrainMain() {
        statsOutput = document.getElementById("stats");
        let root = document.getElementById("gamesHolder");

        for (let y = 0; y < 4; y++) {
            let row = document.createElement("div");
            for (let i = 0; i < 5; i++) {
                let container = new GameContainer(row);
                gameContainers.push(container);
            }
            root.appendChild(row);
        }

        step();
    }

    function step() {
        for (let i = 0; i < gameContainers.length; i++) {
            if (gameContainers[i].game.gameover) {
                numGames++;
                updateStats();
                gameContainers[i].reset();
            }
            else {
                gameContainers[i].act();
            }
        }

        window.requestAnimationFrame(step);
    }

    function updateStats() {
        statsOutput.innerText = `Num games =${numGames}`;
    }
}