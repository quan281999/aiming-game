const rulesButton = document.querySelector('#rules-btn');
const startButton = document.querySelector('#start-btn');
const rules = document.querySelector('#rules');
const closeButton = document.querySelector('#close-btn');
const overScoreEl = document.querySelector("#over-score");
const overContainer = document.querySelector("#over-container");
const againButton = document.querySelector("#again-btn");
const bestScoreEl = document.querySelector("#best-score");
const scoreEl = document.querySelector("#score");
const canvas = document.querySelector('#canvas');
const difficultyEl = document.querySelector('#difficulty');
const canvasLeft = canvas.offsetLeft + canvas.clientLeft;
const canvasTop = canvas.offsetTop + canvas.clientTop;
const ctx = canvas.getContext('2d');

// initial score, difficulty, best score, time between turns, number of targets
// and number of turns
let score = 0;
let difficulty = 'easy';
let bestScore = getBestScore('easy');
let timeBetweenTurns = 3300;
const numOfTurns = 20;
const numOfTargetsPerTurn = 8;

// create target properties
const targetProperties = {
    y: 0,
    size: 25,
    dy: 1.2,
    visible: true
}

// display best score and score
bestScoreEl.innerText = `Best Score: ${bestScore}`;
scoreEl.innerText = `Score: ${score}`;

// function to get best score from localStorage based on difficulty
function getBestScore(difficulty) {
    const bestScore = localStorage.getItem(difficulty + 'BestScore');
    console.log(bestScore);
    return bestScore === null ? 0 : bestScore;
}

// function to set best score from localStorage based on difficulty
function setBestScore(difficulty) {
    localStorage.setItem(difficulty + 'BestScore', score)
}

// function to update targets' speed based on difficulty
function updateTargetProperties() {
    if (difficulty === 'easy') {
        targetProperties.dy = 1.2;
    } else if (difficulty === 'medium') {
        targetProperties.dy = 1.7;
    } else if (difficulty === 'hard') {
        targetProperties.dy = 2.2;
    }
}

// function to update time between turns based on difficulty
function updateTimeBetweenTurns() {
    if (difficulty === 'easy') {
        timeBetweenTurns = 3300;
    } else if (difficulty === 'medium') {
        timeBetweenTurns = 2800;
    } else if (difficulty === 'hard') {
        timeBetweenTurns = 2300;
    }
}

// function to set targets position randomly
let targets = [];
function setTargets() {
    let count = 0;
    for (let i = 0; i < numOfTurns; i++) {
        for (let z = 0; z < numOfTargetsPerTurn; z++) {
            const max = (Math.floor(canvas.width) / numOfTargetsPerTurn) * (z + 1) - targetProperties.size;
            const min = ((Math.floor(canvas.width) / numOfTargetsPerTurn) * z) + targetProperties.size
            const x =  Math.random() * (max - min) + min;
            targets[count] = {x, ...targetProperties};
            count++;
        }
    }
}

// function the draw targets
function drawTargets(turn) {
    for (let i = turn * numOfTargetsPerTurn; i < numOfTargetsPerTurn * (turn + 1); i++) {
        ctx.beginPath();
        ctx.arc(targets[i].x, targets[i].y, targets[i].size, 0, Math.PI * 2);
        ctx.fillStyle = targets[i].visible === true ? '#ff8585': 'transparent';
        ctx.fill();
        ctx.closePath();
    }
}

// function to move targets
function moveTargets(turn) {
    for (let i = turn * numOfTargetsPerTurn; i < numOfTargetsPerTurn * (turn + 1); i++) {
        targets[i].y += targets[i].dy;
    }
}

// function to display the countdown before the game begins
function drawCountDown() {
    ctx.font = '200px Arial';
    ctx.fillStyle = '#ff8585';
    ctx.fillText(`3`, (canvas.width / 2) - 40, (canvas.height / 2) + 65);
    setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '200px Arial';
        ctx.fillText(`2`, (canvas.width / 2) - 40, (canvas.height / 2) + 65);
        setTimeout(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = '200px Arial';
            ctx.fillText(`1`, (canvas.width / 2) - 40, (canvas.height / 2) + 65);
            setTimeout(() => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }, 1000)
        }, 1000)
    }, 1000)
}

let stop = 1;
// function to start the game
function startGame() {
    // set cursor to crosshair
    canvas.style.cursor = 'crosshair';
    setTargets();
    startButton.removeEventListener('click', startGame);
    // draw countdown and score
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCountDown();
    // draw targets
    setTimeout(() => {
        update(0, true);
        repeatUpdate();
    }, 3200)
    // interval to check whether the game is over
    const interval = setInterval(() => {
        if (targets[numOfTurns * numOfTargetsPerTurn - 1].y > canvas.height) {
            overScoreEl.innerText = `SCORE: ${score}`;
            overContainer.style.display = 'flex';
            if (score > bestScore) {
                setBestScore(difficulty);
            }
            clearInterval(interval);
        }
    }, 500);
}

// function to keep update multiple the targets turns
function repeatUpdate() {
    if (stop < numOfTurns) {
        setTimeout(() => {
            update(stop, false);
            stop++;
            repeatUpdate();
        }, timeBetweenTurns);        
    }
}

// function to keep update the targets turn
function update(turn, check) {
    moveTargets(turn);
    if (check == true) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    drawTargets(turn);
    requestAnimationFrame(() => {
        update(turn, check);
    });
}

// open rules eventlistener
rulesButton.addEventListener('click', () => {
    rules.classList.add('show')
})

// close rules eventlistener
closeButton.addEventListener('click', () => {
    rules.classList.remove('show')
})

// start game eventlistener
startButton.addEventListener('click', startGame);

// canvas eventlistener
canvas.addEventListener("click", (e) => {
    const x = e.pageX;
    const y = e.pageY - canvasTop;
    console.log(x, y);
    console.log(targets[0].x, targets[0].y);
    // check if user clicked a targert
    targets.forEach((target,index) => {
        if (y > target.y - target.size && y < target.y + target.size
            && x > target.x && x < target.x + (target.size * 2)) {
            // increase score
            score++;
            // erase target
            target.visible = false;
            target.y = canvas.height;
            // update score
            scoreEl.innerText = `Score: ${score}`;
        }
    })
})

// play again eventlistener
againButton.addEventListener('click', () => {
    location.reload();
})

// difficulty selection eventlistener
difficultyEl.addEventListener('change', () => {
    difficulty = difficultyEl.value;
    bestScore = getBestScore(difficulty);
    bestScoreEl.innerText = `Best Score: ${bestScore}`;
    updateTargetProperties();
    updateTimeBetweenTurns();
})
