const gameBoard = document.getElementById('gameBoard');
const context = gameBoard.getContext('2d');
const scoreText = document.getElementById('scoreVal');
const highScoreText = document.getElementById('highScoreVal');
const startBtn = document.getElementById('startBtn');

const UNIT = 25;
let foodX;
let foodY;
let xVel = UNIT;
let yVel = 0;
let score = 0;
let paused = false;
let active = false;
let timerId = null;
let changingDirection = false; // Guard flag against rapid double-key self-collisions

let highScore = parseInt(localStorage.getItem('snakeHighScore'), 10) || 0;
if (highScoreText) {
    highScoreText.textContent = highScore;
}

let snake = [
    { x: UNIT * 3, y: 0 },
    { x: UNIT * 2, y: 0 },
    { x: UNIT, y: 0 },
    { x: 0, y: 0 }
];

window.addEventListener('keydown', keyPress);

startBtn.addEventListener('click', () => {
    startBtn.blur();
    startGame();
});

function startGame() {
    clearTimeout(timerId);
    clearBoard();
    score = 0;
    scoreText.textContent = score;
    xVel = UNIT;
    yVel = 0;
    active = true;
    paused = false;
    changingDirection = false;
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
    context.fillStyle = '#212121';
    context.fillRect(0, 0, 500, 500);
}

function createFood() {
    let foodOnSnake;
    do {
        foodX = Math.floor(Math.random() * (500 / UNIT)) * UNIT;
        foodY = Math.floor(Math.random() * (500 / UNIT)) * UNIT;
        foodOnSnake = snake.some(part => part.x === foodX && part.y === foodY);
    } while (foodOnSnake);
}

function displayFood() {
    context.fillStyle = '#ff3333';
    context.beginPath();
    context.arc(foodX + UNIT / 2, foodY + UNIT / 2, UNIT / 2 - 2, 0, 2 * Math.PI);
    context.fill();
}

function drawSnake() {
    const r = UNIT / 2;

    snake.forEach((snakePart, index) => {
        context.strokeStyle = '#212121';

        if (index === 0) {
            context.fillStyle = 'aqua';
            let radii = [0, 0, 0, 0];

            if (xVel > 0) radii = [0, r, r, 0];       // Right
            else if (xVel < 0) radii = [r, 0, 0, r];  // Left
            else if (yVel < 0) radii = [r, r, 0, 0];  // Up
            else if (yVel > 0) radii = [0, 0, r, r];  // Down

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

function moveSnake() {
    const head = { x: snake[0].x + xVel, y: snake[0].y + yVel };
    snake.unshift(head);

    if (snake[0].x === foodX && snake[0].y === foodY) {
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
    } else {
        snake.pop();
    }
}

function nextTick() {
    if (active && !paused) {
        changingDirection = false;
        const speed = Math.max(70, 200 - (score * 5));

        timerId = setTimeout(() => {
            clearBoard();
            displayFood();
            moveSnake();
            drawSnake();
            checkGameOver();
            nextTick();
        }, speed);
    } else if (!active) {
        clearBoard();
        context.font = 'bold 45px serif';
        context.fillStyle = "white";
        context.textAlign = "center";
        context.fillText("Game Over", 500 / 2, (500 / 2) - 20);

        context.font = '20px sans-serif';
        context.fillStyle = "#aaaaaa";
        context.fillText("Click Start for New Game", 500 / 2, (500 / 2) + 30);
    }
}

function keyPress(event) {
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

    if (paused || changingDirection) return;

    const goingUp = yVel === -UNIT;
    const goingDown = yVel === UNIT;
    const goingRight = xVel === UNIT;
    const goingLeft = xVel === -UNIT;

    switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (!goingRight) { xVel = -UNIT; yVel = 0; changingDirection = true; }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (!goingLeft) { xVel = UNIT; yVel = 0; changingDirection = true; }
            break;
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (!goingDown) { xVel = 0; yVel = -UNIT; changingDirection = true; }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (!goingUp) { xVel = 0; yVel = UNIT; changingDirection = true; }
            break;
    }
}

function checkGameOver() {
    if (snake[0].x < 0 || snake[0].x >= 500 || snake[0].y < 0 || snake[0].y >= 500) {
        active = false;
        return;
    }

    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            active = false;
            return;
        }
    }
}

// Touch controls for mobile
let touchStartX = 0;
let touchStartY = 0;

window.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchend', (event) => {
    if (!active || paused || changingDirection) return;

    const deltaX = event.changedTouches[0].clientX - touchStartX;
    const deltaY = event.changedTouches[0].clientY - touchStartY;
    const minSwipe = 30;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipe) {
        if (deltaX > 0 && xVel !== -UNIT) {
            xVel = UNIT;
            yVel = 0;
            changingDirection = true;
        } else if (deltaX < 0 && xVel !== UNIT) {
            xVel = -UNIT;
            yVel = 0;
            changingDirection = true;
        }
    } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minSwipe) {
        if (deltaY > 0 && yVel !== -UNIT) {
            xVel = 0;
            yVel = UNIT;
            changingDirection = true;
        } else if (deltaY < 0 && yVel !== UNIT) {
            xVel = 0;
            yVel = -UNIT;
            changingDirection = true;
        }
    }
}, { passive: true });

gameBoard.addEventListener('click', () => {
    if (!active) return;
    paused = !paused;
    if (!paused) {
        nextTick();
    } else {
        clearTimeout(timerId);
        context.font = "bold 26px sans-serif";
        context.fillStyle = "white";
        context.textAlign = "center";
        context.fillText("Tap Board to Continue", 500 / 2, 500 / 2);
    }
});