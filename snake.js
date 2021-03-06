document.addEventListener("DOMContentLoaded", function () {
    var interval = null;
    var date = null;

    var snake = [];
    var food = {};
    var score = 0;
    var walls = 0;

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

    /*
     * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
     * http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
     */
    (function() {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                       || window[vendors[x]+'CancelRequestAnimationFrame'];
        }
     
        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                  timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
     
        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
    }());

    function init() {
        score = 0;
        walls = 0;
        paused = false;
        dir = DIRECTION.RIGHT;
        directions = [];
        bounds = true;
        cells = { x: 0, y: 0, height: canvas.height / cellWidth, 
            width: canvas.width / cellWidth };

        createSnake(5);
        createFood();
        startGame();
    }

    function startGame() {
        if (interval == null) {
            date = null;
            interval = requestAnimationFrame(loop);
            draw();
        }
    }

    function endGame() {
        if (interval != null) {
            cancelAnimationFrame(interval);
            draw();
            interval = null;
        }
    }

    function createSnake(length) {
        if (length) {
            snake = [{ x: 0, y: 0 }];
            grow(length - 1);
        }
    }

    function createFood() {
        food = { x: Math.floor(Math.random() * (cells.width)),
            y: Math.floor(Math.random() * (cells.height)) };
    }

    function draw() {
        clearCanvas();
        drawFood();
        drawSnake();
        drawInfo();
    }

    function loop(newDate) {
        var speed = 500 / snake.length;

        if (!date) {
            date = newDate;
        }

        var diff = newDate - date;
        if (diff >= speed) {
            draw();

            date = newDate;
            
            if (checkFood()) {
                eat();
                createFood();
            }

            for (var i = 0; i < Math.floor((diff) / speed); i++) {
                moveSnake();
            }

            if (bounds && checkEdge() || checkSuicide()) {
                endGame();
                setTimeout(init, 1000);
                return;
            }
        }

        interval = requestAnimationFrame(loop);
    }

    function drawSnake() {
        for (var i = 0; i < snake.length; i++) {
            drawCell(snake[i].x, snake[i].y, "#0000FF");
        }
    }

    function drawFood() {
        drawCell(food.x, food.y, "#FF0000");
    }

    function drawInfo() {
        ctx.lineWidth = 1;
        ctx.strokeStyle = bounds ? "#000000" : "#BBBBBB";
        ctx.strokeRect(0.5, 0.5, cells.width * cellWidth - 1, cells.height * cellWidth - 1);
        ctx.fillStyle = "#000000";
        ctx.font = "Bold " + cellWidth + "px Roboto";
        setText("score", pad(score * 50, 6));
        setText("walls", pad(walls, 6));
    }

    function setText(id, value) {
        var el = document.getElementById(id);
        if (el !== null) {
            el.textContent = el.innerText = value;
        }
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
        grow(1);
        snake.pop();
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
                var x = head.x, y = head.y;
                head.x = (head.x + cells.width) % cells.width;
                head.y = (head.y + cells.height)  % cells.height;
                if (x != head.x || y != head.y) {
                    walls++;
                }
            }
            snake.unshift(head);
        }
    }

    document.addEventListener("keydown", function (e) {
        var char = e.keycode || e.which || e.charCode;
        var ndir = null;

        if (!paused) {
            e.preventDefault();
        }

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
                if (paused) {
                    endGame();
                } else {
                    startGame();
                }
                break;
            case KEY.BOUNDS:
                bounds = !bounds;
                break;
            case KEY.RESET:
                endGame();
                init();
                break;
            default:
                return;
        }

        if (ndir != null && ndir != dir && !paused) {
            directions.push(ndir);
        }

        draw();
    });
});
