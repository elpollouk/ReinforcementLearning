(function () {

var PLAYER_RED = "playerRed";
var PLAYER_BLUE = "playerBlue";

function Game(width, height, winLength) {
    this.width = width;
    this.height = height;
    this.winLength = winLength || 4;
    this.container = document.createElement("div");
    this.elements = window.CreateGrid(this.container, width, height, true);
    this.onColumnClicked = null;

    let that = this;
    for (var i = 0; i < this.elements.length; i++) {
        let element = this.elements[i];
        let cellIndex = i
        element.onclick = function () {
            var col = cellIndex % width;
            that._handleClick(col)
        }
    }

    this.reset();
}

Game.prototype.reset = function () {
    this.currentPlayer = PLAYER_RED;
    this.winner = null;
    this._undoBuffer = []

    this.state = [];
    for (var i = 0; i < this.width; i++)
        this.state.push([]);

    for (var i = 0; i < this.elements.length; i++) {
        let element = this.elements[i];
        element.classList.remove(PLAYER_RED);
        element.classList.remove(PLAYER_BLUE);
    }
}

Game.prototype.action = function (columnIndex) {
    if (this.winner) return false;

    let column = this.state[columnIndex];
    if (this.height <= column.length) return false;

    let rowIndex = column.length;
    column.push(this.currentPlayer);
    let element = this.elements[(this.width * rowIndex) + columnIndex];
    element.classList.add(this.currentPlayer);

    this.currentPlayer = this.currentPlayer == PLAYER_BLUE ? PLAYER_RED : PLAYER_BLUE;

    this._checkForWinner();

    this._undoBuffer.push(columnIndex);

    return true;
}

Game.prototype.undo = function () {
    if (this._undoBuffer.length === 0)
        return;

    let columnIndex = this._undoBuffer.pop();
    this.state[columnIndex].pop();
    let rowIndex = this.state[columnIndex].length;

    let element = this.elements[(this.width * rowIndex) + columnIndex];
    element.classList.remove(PLAYER_RED);
    element.classList.remove(PLAYER_BLUE);

    this.currentPlayer = this.currentPlayer == PLAYER_BLUE ? PLAYER_RED : PLAYER_BLUE;

    this.winner = null;
}

Game.prototype._checkForWinner = function () {
    for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
            if (this.state[x].length <= y)
                continue;

            if (this._checkForWinnerFromLocation(x, y)) {
                this.winner = this.state[x][y];
                return;
            }
        }
    }
}

Game.prototype._checkForWinnerFromLocation = function (x, y) {
    return this._checkForWinnerVertically(x, y)
        || this._checkForWinnerHorizontally(x, y)
        || this._checkForWinnerDiagonalLeft(x, y)
        || this._checkForWinnerDiagonalRight(x, y);
}

Game.prototype._checkForWinnerVertically = function (x, y) {
    let player = this.state[x][y];

    for (let i = 1; i < this.winLength; i++) {
        if (this.state[x].length <= (y + i))
            return false;

        if (this.state[x][y + i] != player)
            return false;
    }

    return true;
}

Game.prototype._checkForWinnerHorizontally = function (x, y) {
    let player = this.state[x][y];

    for (let i = 1; i < this.winLength; i++) {
        if (this.width <= (x + i))
            return false;

        if (this.state[x + i].length <= y)
            return false;

        if (this.state[x + i][y] != player)
            return false;
    }

    return true;
}

Game.prototype._checkForWinnerDiagonalLeft = function (x, y) {
    let player = this.state[x][y];

    for (let i = 1; i < this.winLength; i++) {
        if ((x - i) < 0)
            return false;

        if (this.state[x - i].length <= y + i)
            return false;

        if (this.state[x - i][y + i] != player)
            return false;
    }

    return true;
}

Game.prototype._checkForWinnerDiagonalRight = function (x, y) {
    let player = this.state[x][y];

    for (let i = 1; i < this.winLength; i++) {
        if (this.width <= (x + i))
            return false;

        if (this.state[x + i].length <= y + i)
            return false;

        if (this.state[x + i][y + i] != player)
            return false;
    }

    return true;
}

Game.prototype._handleClick = function (column) {
    if (this.onColumnClicked)
        this.onColumnClicked(this, column)
}

window.Game = Game;

})();