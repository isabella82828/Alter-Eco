let score = 0;

function getTimeRemaining(endtime) {
    var t = Date.parse(endtime) - Date.parse(new Date());
    var seconds = Math.floor((t / 1000) % 60);

    return {
        'total': t,

        'seconds': seconds
    };
}

/* timer */
function initializeClock(id, endtime) {
    var clock = document.getElementById(id);
    var secondsSpan = clock.querySelector('.seconds');

    function updateClock() {
        var t = getTimeRemaining(endtime);

        secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

        if (t.total <= -1) {
            clearInterval(timeinterval);
            alert('Game Ended! Click "OK" to play again.');
            location.reload();
        }
    }

    updateClock();
    var timeinterval = setInterval(updateClock, 1000);
  }
  
  var deadline = new Date(Date.parse(new Date()) +  45 * 1000);

initializeClock('clockdiv', deadline);

/*game*/
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 500;


const keys = []


const player = {
    x: 50,
    y: canvas.height - 96,
    width: 96,
    height: 96,
    frameX: 0,
    frameY: 0,
    speed: 9,
    moving: false
};

const playerSprite = new Image();
// left_turtle0 = document.getElementById('left_turtle');
playerSprite.src = "img/spritesheet_turtle.png";

const background = new Image();
background.src = "img/background.png";

// const playerSprite = new Image();
// playerSprite.src = "unknown.png";

function drawSprite(img, sX, sY, sW, sH, dX, dY, dW, dH) {
    ctx.drawImage(img, sX, sY, sW, sH, dX, dY, dW, dH);
}

setInterval(function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    // ctx.drawSprite(playerSprite, 0, 0, player.width, player.height, 0, 0);
    drawSprite(playerSprite, player.width * player.frameX, player.height * player.frameY, player.width, player.height, player.x, player.y, player.width, player.height);
    movePlayer();
    handlePlayerFrame();
}, 50);

// Keyboard listeners
window.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
});

window.addEventListener("keyup", function (e) {
    delete keys[e.keyCode];
    player.moving = false;
});

function movePlayer() {
    if (keys[37] && player.x > 0) {
        player.x -= player.speed;
        player.frameY = 1
        player.moving = true;
    }
    if (keys[39] && player.x < canvas.width - player.width) {
        player.x += player.speed;
        player.frameY = 0
        player.moving = true;
    }
}

function handlePlayerFrame() {
    if (player.frameX < 3 && player.moving) player.frameX++
    else player.frameX = 0;
}

// Falling objects declarations
const bottle = new Image();
bottle.src = "img/fall_objects/object_bottle.png";
const bag = new Image();
bag.src = "img/fall_objects/object_bag.png";
const messy_can = new Image();
messy_can.src = "img/fall_objects/object_can_messy.png";
const can = new Image();
can.src = "img/fall_objects/object_can.png";
const battery = new Image();
battery.src = "img/fall_objects/object_battery.png";
const banana = new Image();
banana.src = "img/fall_objects/object_banana.png";

let objectX = [], objectY = [], objectDy = []; // Dy is change in y
let object = [bottle, bag, can, messy_can, banana, battery];

// Call before objects fall
function startGame() {
    for (let l = 0; l < 6; l++) {
        objectY[l] = -100;
        objectX[l] = Math.random() * canvas.width - 60;
        objectDy[l] = 1.5 + Math.random() * 5;
    }
}

// Initialize object specs
startGame();

// Loop objects falling
setInterval(function () {

    // initialze (x, y) and falling speed for two recyclables
    // the recyclables
    for (let i = 0; i < 6; i++) {
        if (objectY[i] > canvas.height) {
            objectY[i] = -100;
            objectX[i] = 30 + Math.random() * canvas.width - 60;
            objectDy[i] = 2 + Math.random() * 5;
        } else { // or else just move down the object by the Dy
            objectY[i] += objectDy[i];
        }
        if (turtleHit(objectX[i], objectY[i], 40, 60)) {
            objectY[i] = canvas.height + 100;
            if(i < 3) {
                score += 5;
            } else {
                score -= 10;
            }
            console.log(score);
            document.getElementById("score").innerHTML = score;
        }

        ctx.drawImage(object[i], objectX[i], objectY[i]);
    }

}, 50);

function turtleHit(nX, nY, nW, nH) {
    if (nX >= player.x && nX <= (player.x + 96) && (nY + nH) >= player.y && nY <= player.y) {
        return true;
    } else {
        return false;
    }
  }

 