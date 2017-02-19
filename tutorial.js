//Create the renderer
var renderer = PIXI.autoDetectRenderer(256, 256);

//Add the canvas to the HTML document
document.body.appendChild(renderer.view);

//Create a container object called the `stage`
var stage = new PIXI.Container();

renderer.view.style.position = "absolute";
renderer.view.style.display = "block";
renderer.autoResize = true;
renderer.resize(window.innerWidth, window.innerHeight);

var counter = 0,
    triPoints = [
        [100, 100],
        [50, 150],
        [150, 150]
    ],
    triangle = new PIXI.Graphics();

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawLine(x1, y1, x2, y2) {
    var line = new PIXI.Graphics();
    line.lineStyle(1, 0xFFFFFF, 1);
    line.moveTo(x1, y1);
    line.lineTo(x2, y2);
    line.x = x1;
    line.y = y1;
    stage.addChild(line);
}

function drawShiftingTriangle(triangle, arrayOfPoints) {
    // Given arrayOfPoints, randomly shifts them by some amount, draws it, and returns new arrayOfPoints
    var newPoints = [];
    for (var i = 0; i < arrayOfPoints.length; i++) {
        newPoints[i] = [arrayOfPoints[i][0] + randomInt(-10, 10),
                        arrayOfPoints[i][1] + randomInt(-10, 10)];
    }
    triangle.lineStyle(4, 0xFF3300, 1);
    triangle.beginFill(0x66FF33);
    triangle.moveTo(newPoints[0][0], newPoints[0][1]);
    triangle.lineTo(newPoints[1][0], newPoints[1][1]);
    triangle.lineTo(newPoints[2][0], newPoints[2][1]);
    triangle.lineTo(newPoints[0][0], newPoints[0][1]);
    triangle.endFill();
    stage.addChild(triangle);
    
    return newPoints;
}

function loop(){
    requestAnimationFrame(loop);

    counter += 1;
    counter = counter % 60;

    triangle.clear();

    // drawLine(0, 0, counter, counter);
    triPoints = drawShiftingTriangle(triangle, triPoints);

    var mousePosition = renderer.plugins.interaction.mouse.global;
    triangle.x = mousePosition.x;
    triangle.y = mousePosition.y;

    //Tell the `renderer` to `render` the `stage`
    renderer.render(stage);
}

loop();
