(function() {
"use strict";

function CreateGrid(container, width, height, reverseY) {
    var elements = [];

    for (var y = 0; y < height; y++) {
        var row = document.createElement("div");
        row.classList.add("gridrow");

        for (var x = 0; x < width; x++) {
            var index = elements.length
            var cell = document.createElement("div");
            cell.classList.add("gridsquare");
            cell.id = "cell" + index;
            row.appendChild(cell);
            elements.push(cell);
        }

        if (reverseY)
            container.insertBefore(row, container.firstChild)
        else
            container.appendChild(row);
    }
    
    return elements;
}

window.CreateGrid = CreateGrid;

})();