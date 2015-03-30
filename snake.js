document.addEventListener("DOMContentLoaded", function () {
    var interval = null;

    var snake = [];
    var food = {};
    var score = 0;

    var paused = false;

    var DIRECTION = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40 };
    var KEY = { PAUSE: 80, BOUNDS: 66, RESET: 82 };

    var dir = DIRECTION.RIGHT;
    var directions = [];

    var bounds = true;

    var canvas = document.getElementById("game");
    var ctx = canvas.getContext("2d");

    var cellWidth = 10;
    var cells = {};

    init();

    function init() {
        score = 0;
        paused = false;
        dir = DIRECTION.RIGHT;
        directions = [];
        bounds = true;
        cells = { x: 0, y: 0, height: canvas.height / cellWidth - 2, 
            width: canvas.width / cellWidth };

        createSnake(5);
        createFood();
        startGame();
    }

    function startGame() {
        if (interval == null) {
            interval = setInterval(paint, 100);
        }
    }

    function endGame() {
        if (interval != null) {
            clearInterval(interval);
            interval = null;
        }
    }

    function createSnake(length) {
        snake = [];
        for (var i = length; i > 0; i--) {
            snake.push({ x: i, y: 0 });
        }
    }

    function createFood() {
        food = { x: Math.floor(Math.random() * (cells.width)),
            y: Math.floor(Math.random() * (cells.height)) };
    }

    function paint() {
        if (paused) {
            return;
        }
        clearCanvas();
        drawSnake();
        if (checkFood()) {
            eat();
            createFood();
        }
        moveSnake();
        drawFood();
        drawInfo();
        if (bounds && checkEdge() || checkSuicide()) {
            endGame();
            setTimeout(init, 1000);
        }
    }

    function drawSnake() {
        for (var i = 0; i < snake.length; i++) {
            drawCell(snake[i].x, snake[i].y, "blue");
        }
    }

    function drawFood() {
        drawCell(food.x, food.y, "red");
    }

    function drawInfo() {
        ctx.lineWidth = 1;
        ctx.strokeStyle = bounds ? "black" : "red";
        ctx.strokeRect(0.5, 0.5, cells.width * cellWidth - 1, cells.height * cellWidth - 1);
        ctx.fillStyle = "black";
        ctx.font = "Bold " + cellWidth + "px Roboto";
        var scoreText = "Score: " + pad(score * 1000, 20);
        ctx.fillText(scoreText, cellWidth, cellWidth * (cells.height + 1.5) );
    }
	
	function pad(num, digits)  {
		var str = num.toString();
		while (str.length < digits) {
			str = "0" + str;
		}
		return str;
	}

    function moveSnake() {
		var ndir = directions.pop();
		switch (ndir) {
			case DIRECTION.LEFT:
				dir = (dir == DIRECTION.RIGHT ? dir : ndir);
				break;
			case DIRECTION.UP:
				dir = (dir == DIRECTION.DOWN ? dir : ndir);
				break;
			case DIRECTION.RIGHT:
				dir = (dir == DIRECTION.LEFT ? dir : ndir);
				break;
			case DIRECTION.DOWN:
				dir = (dir == DIRECTION.UP ? dir : ndir);
				break;
			default:
				break;
		}
        snake.pop();
        grow(1);
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function drawCell(x, y, fill) {
        ctx.fillStyle = fill;
        ctx.fillRect((cells.x + x) * cellWidth, (cells.y + y) * cellWidth, cellWidth, cellWidth);
    }

    function checkEdge() {
        for (var i = 0; i < snake.length; i++) {
            if ((snake[i].x < 0) || (snake[i].x >= cells.width) 
                    || (snake[i].y < 0) || (snake[i].y >= cells.height)) {
                return true;
            }
        }
        return false;
    }

    function checkFood() {
        for (var i = 0; i < snake.length; i++) {
            if ((snake[i].x == food.x) && (snake[i].y == food.y)) {
                return true;
            }
        }
        return false;
    }

    function checkSuicide() {
        for (var i = 0; i < snake.length; i++) {
            for (var j = 0; j < snake.length; j++) {
                if ((snake[i].x == snake[j].x) && (snake[i].y == snake[j].y)
                        && (i != j)) {
                            return true;
                        }
            }
        }
        return false;
    }

    function eat() {
        score++;
        grow(1);
    }

    function grow(length) {
        for (var i = 0; i < length; i++) {
            var head = { x: snake[0].x, y: snake[0].y };
            switch (dir) {
                case DIRECTION.LEFT:
                    head.x--;
                    break;
                case DIRECTION.UP:
                    head.y--;
                    break;
                case DIRECTION.RIGHT:
                    head.x++;
                    break;
                case DIRECTION.DOWN:
                    head.y++;
                    break;
                default:
                    return;
            }
            if (!bounds) {
                head.x = (head.x + cells.width) % cells.width;
                head.y = (head.y + cells.height)  % cells.height;
            }
            snake.unshift(head);
        }
    }

    document.addEventListener("keydown", function (e) {
        e.preventDefault();
        var char = e.keycode || e.which || e.charCode;
        var ndir = null;
        if (interval != null) {
            switch (char) {
                case DIRECTION.LEFT:
                    ndir = DIRECTION.LEFT;
                    break;
                case DIRECTION.UP:
                    ndir = DIRECTION.UP;
                    break;
                case DIRECTION.RIGHT:
                    ndir = DIRECTION.RIGHT;
                    break;
                case DIRECTION.DOWN:
                    ndir = DIRECTION.DOWN;
                    break;
                case KEY.PAUSE:
                    paused = !paused;
                    break;
                case KEY.BOUNDS:
                    bounds = false;
                    break;
                case KEY.RESET:
                    endGame();
                    init();
                    break;
                default:
                    return false;
            }
            if (ndir != null && ndir != dir && !paused) {
                directions.push(ndir);
            }
        }
    });
});
