const gameBoard = document.getElementById('gameBoard')
const context = gameBoard.getContext('2d')
const scoreText = document.getElementById('scoreVal')

const highScoreText = document.getElementById('highScoreVal');

let highScore = parseInt(localStorage.getItem('snakeHighScore'), 10) || 0;

if (highScoreText) {
    highScoreText.textContent = highScore;
}

const UNIT = 25;
let foodX;
let foodY;
let xVel = 25;
let yVel = 0;
let score = 0;
const startBtn = document.getElementById('startBtn');
let paused = false;
let active = false;
let started = false;
let timerId = null;

let snake = [
    { x: UNIT * 3, y: 0 },
    { x: UNIT * 2, y: 0 },
    { x: UNIT, y: 0 },
    { x: 0, y: 0 }
]  // snake size


window.addEventListener('keydown', keyPress)

startBtn.addEventListener('click', () => {
    startBtn.blur();
    startGame();
});

function startGame() {
    clearTimeout(timerId);
    clearBoard();
    score = 0;
    scoreText.textContent = score;
    xVel = 25;
    yVel = 0;
    active = true;
    paused = false;
    snake = [
        { x: UNIT * 3, y: 0 },
        { x: UNIT * 2, y: 0 },
        { x: UNIT, y: 0 },
        { x: 0, y: 0 }
    ];
    createFood();
    displayFood();
    drawSnake();
    nextTick();
}

function clearBoard() {
    context.fillStyle = '#212121'
    //fillRectangle(xstart,ystart,width,height)
    context.fillRect(0, 0, 500, 500)
}

function createFood() {
    let foodOnSnake;
    do {
        foodX = Math.floor(Math.random() * 500 / UNIT) * UNIT;
        foodY = Math.floor(Math.random() * 500 / UNIT) * UNIT;
        foodOnSnake = snake.some(part => part.x === foodX && part.y === foodY);
    } while (foodOnSnake);
}

function displayFood(){
    context.fillStyle = '#ff3333';
    context.beginPath();
    // arc(centerX, centerY, radius, startAngle, endAngle)
    context.arc(foodX + UNIT / 2, foodY + UNIT / 2, UNIT / 2 - 2, 0, 2 * Math.PI);
    context.fill();
}

function drawSnake(){
    const r = UNIT / 2; 

    snake.forEach((snakePart, index) => {
        context.strokeStyle = '#212121';

        if (index === 0) {
            context.fillStyle = 'aqua'; 

            let radii = [0, 0, 0, 0];

            if (xVel > 0) {
                radii = [0, r, r, 0];
            } else if (xVel < 0) {
                radii = [r, 0, 0, r];
            } else if (yVel < 0) {
                radii = [r, r, 0, 0];
            } else if (yVel > 0) {
                radii = [0, 0, r, r];
            }

            context.beginPath();
            context.roundRect(snakePart.x, snakePart.y, UNIT, UNIT, radii);
            context.fill();
            context.stroke();
        } else {
            context.fillStyle = 'aqua';
            context.fillRect(snakePart.x, snakePart.y, UNIT, UNIT);
            context.strokeRect(snakePart.x, snakePart.y, UNIT, UNIT);
        }
    });
}

function moveSnake(){
    const head = {x: snake[0].x + xVel, y: snake[0].y + yVel};
    snake.unshift(head);

    if (snake[0].x == foodX && snake[0].y == foodY){
        score += 1;
        scoreText.textContent = score;

        if (score > highScore) {
            highScore = score; 
            localStorage.setItem('snakeHighScore', highScore);
            if (highScoreText) {
                highScoreText.textContent = highScore;
            }
        }

        createFood();
    }
    else {
        snake.pop();
    }
}

function nextTick() {
    if (active && !paused) {
        const speed = Math.max(70, 200 - (score * 5));
        timerId = setTimeout(() => {
            clearBoard();
            displayFood();
            moveSnake();
            drawSnake();
            checkGameOver();
            nextTick();
        }, speed);
    }
    else if (!active) {
        clearBoard();
        context.font = 'bold 50px serif';
        context.fillStyle = "white";
        context.textAlign = "center";
        context.fillText("Game Over", 500 / 2, 500 / 2);

        context.font = '20px sans-serif';
        context.fillStyle = "#aaaaaa"; 
        context.fillText("Click Start for New Game", 500 / 2, (500 / 2) + 30)
    }
}

function keyPress(event) {
    //  ADD SPACEBAR CHECK:
    if (event.keyCode === 32 || event.code === "Space") {
        event.preventDefault();
        if (!active) return;
        paused = !paused;
        if (!paused) {
            nextTick();
        } else {
            clearTimeout(timerId);
            context.font = "bold 28px sans-serif";
            context.fillStyle = "white";
            context.textAlign = "center";
            context.fillText("Press Space to Continue", 500 / 2, 500 / 2);
        }
        return;
    }

    if (paused) return;

    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;   // default arrow key values
    const DOWN = 40;

    switch (true) {
        case (event.keyCode == LEFT && xVel !== UNIT):
            xVel = -UNIT;
            yVel = 0;
            break;
        case (event.keyCode == RIGHT && xVel !== -UNIT):
            xVel = UNIT;
            yVel = 0;
            break;
        case (event.keyCode == UP && yVel !== UNIT):
            xVel = 0;
            yVel = -UNIT;
            break;
        case (event.keyCode == DOWN && yVel !== -UNIT):
            xVel = 0;
            yVel = UNIT;
            break;
    }
}


function checkGameOver() {
    // Check wall collisions
    switch (true) {
        case (snake[0].x < 0):
        case (snake[0].x >= 500):
        case (snake[0].y < 0):
        case (snake[0].y >= 500):
            active = false;
            return;
    }

    // Check body collision
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            active = false;
            break;
        }
    }
}