const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const progressBar = document.querySelector("meter");
const highScoreTable = document.getElementById("highScores");
let enemyCount = 0;
let powerupCount = 0;
let score = 0;
startGame();

function startGame() {
  initializeHighScoresToZero();
  initializeTimers();
};

function initializeTimers() {
  enemyTimer = setInterval(addEnemy, 1000);
  powerupTimer = setInterval(addPowerup, 20000);
  shrinkCanvasTimer = setInterval(shrinkCanvas, 100);
  scoreTimer = setInterval(incrementScore, 100);
};

function initializeHighScoresToZero() {
  for (let placeNumber = 1; placeNumber <= 4; placeNumber++) {
    highScoreTable.rows[1].cells[placeNumber - 1].value = 0;
    document.getElementById(`place${placeNumber}`).innerHTML = 0;
  }
}

function restartGame() {
  if (progressBar.value === 0) {
    score = 0;
    resetCanvas();
    clearBackground();
    deleteEnemies();
    deletePowerups();
    initializeTimers();
    progressBar.value = progressBar.max;
    requestAnimationFrame(drawScene);
  }
}

function distanceBetween(sprite1, sprite2) {
  return Math.hypot(sprite1.x - sprite2.x, sprite1.y - sprite2.y);
}

function haveCollidedWithEnemies(sprite1, sprite2) {
  return distanceBetween(sprite1, sprite2) < sprite1.radius + sprite2.radius;
}

function haveCollidedWithPowerups(sprite1, sprite2) {
  return distanceBetween(sprite1, sprite2) < sprite1.width + sprite2.radius;
}

class Sprite {
  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

class Player extends Sprite {
  constructor(x, y, radius, color, speed) {
    super();
    Object.assign(this, {x, y, radius, color, speed });
  }
}

let player = new Player(250, 150, 15, "lemonchiffon", 0.5);

class Enemy extends Sprite {
  constructor(x, y, radius, color, speed) {
    super();
    Object.assign(this, { x, y, radius, color, speed });
  }
}

let enemies = [];

addEnemy();

function addEnemy() {
  enemies.push(
    new Enemy(
      Math.floor(Math.random() * 800),
      Math.floor(Math.random() * 800),
      10 + Math.floor(Math.random() * 20),
      "#" + (((1 << 24) * Math.random()) | 0).toString(16),
      Math.random() * 0.1
    )
  );
  enemyCount++;
}

function deleteEnemies() {
  enemies.splice(1, enemyCount);
  enemyCount = 0;
}

class Powerup {
  constructor(x, y, width, height, color) {
    Object.assign(this, { x, y, width, height, color });
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "white";
    ctx.fillRect(this.x, this.y, this.width / 2, this.height);
    ctx.stroke();
  }
}

let powerups = [];

function addPowerup() {
  powerups.push(
    new Powerup(
      Math.floor(Math.random() * canvas.width),
      Math.floor(Math.random() * canvas.height),
      20,
      20,
      "red"
    )
  );
  powerupCount++;
}

function deletePowerups() {
  powerups.splice(0, powerupCount);
  powerupCount = 0;
}

let mouse = { x: 0, y: 0 };
document.body.addEventListener("mousemove", updateMouse);
function updateMouse(event) {
  const { left, top } = canvas.getBoundingClientRect();
  mouse.x = event.clientX - left;
  mouse.y = event.clientY - top;
}

function moveToward(leader, follower, speed) {
  follower.x += (leader.x - follower.x) * speed;
  follower.y += (leader.y - follower.y) * speed;
}

function noEnemyCollision(c1, c2) {
  let [dx, dy] = [c2.x - c1.x, c2.y - c1.y];
  const L = Math.hypot(dx, dy);
  let distToMove = c1.radius + c2.radius - L;
  if (distToMove > 0) {
    dx /= L;
    dy /= L;
    c1.x -= dx * distToMove / 2;
    c1.y -= dy * distToMove / 2;
    c2.x += dx * distToMove / 2;
    c2.y += dy * distToMove / 2;
  }
}

function incrementScore() {
  score++;
  document.getElementById("score").innerHTML = score;
}

/*function updateHighScore() {
  if (score > highScoreTable.rows[1].cells[0].value) {
    for (let placeNumber = 1; placeNumber <= 3; placeNumber++) {
      highScoreTable.rows[1].cells[placeNumber].value =
        highScoreTable.rows[1].cells[placeNumber - 1].value;
      highScoreTable.rows[1].cells[placeNumber].innerHTML =
        highScoreTable.rows[1].cells[placeNumber].value;
      console.log(highScoreTable.rows[1].cells[1].value);
    }
    highScoreTable.rows[1].cells[0].value = score;
    highScoreTable.rows[1].cells[0].innerHTML = score;
  }
}
*/
/*
function updateHighScore() {
  if (score > highScoreTable.rows[1].cells[0].value) {
    highScoreTable.rows[1].cells[0].value = score;
    highScoreTable.rows[1].cells[0].innerHTML = score;
  } else {
      for (placeNumber = 1; placeNumber <= 2; placeNumber++) {
        if (score >= highScoreTable.rows[1].cells[placeNumber].value) {
          highScoreTable.rows[1].cells[placeNumber + 1].value =
          highScoreTable.rows[1].cells[placeNumber].value;
          highScoreTable.rows[1].cells[placeNumber].value = score;
          highScoreTable.rows[1].cells[placeNumber].innerHTML =
          highScoreTable.rows[1].cells[placeNumber].value;
        }
    }
  }
}
*/

function updateHighScore() {
  for (let a = 1; a <= 4; a++) {
    if (score > document.getElementById(`place${a}`).innerHTML) {
      for (let b = 4; b > a; b--) {
        document.getElementById(
          `place${b}`
        ).innerHTML = document.getElementById(`place${b - 1}`).innerHTML;
        document.getElementById(`place${a}`).innerHTML = score;
        return;
      }
    }
  }
}

function takeDamage() {
  enemies.forEach(enemy => {
    if (haveCollidedWithEnemies(enemy, player)) {
      progressBar.value -= 0.02;
    }
  });
}

function regenerateHealth() {
  if (progressBar.value < progressBar.max && progressBar.value > 0.0005) {
    progressBar.value += 0.0005;
  }
};

function addHealthFromPowerup() {
  powerups.forEach(powerup => {
    if (haveCollidedWithPowerups(powerup, player)) {
      progressBar.value += 25;
      deletePowerups();
    }
  });
}

function updateScene() {
  moveToward(mouse, player, player.speed);
  enemies.forEach(enemy => moveToward(player, enemy, enemy.speed));
  enemies.forEach((enemy, i) =>
    noEnemyCollision(enemy, enemies[(i + 1) % enemies.length])
  );
  takeDamage();
  regenerateHealth();
  addHealthFromPowerup();
}

function clearBackground() {
  ctx.fillStyle = "lightgreen";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function shrinkCanvas() {
  if (canvas.width > 300) {
    canvas.width--;
  }
}

function resetCanvas() {
  canvas.width = 1800;
}

function generateDeathMessage() {
  ctx.font = "20px impact";
    ctx.fillStyle = "black";
    ctx.fillText(
      `Your shape managed to accumulate ${score} points`,
      30,
      canvas.height / 2
    );
    ctx.fillText(
      `with ${enemyCount} enemies! (click to play again)`,
      30,
      canvas.height / 2 + 20
    );
}

function onDeath() {
  if (progressBar.value <= 0.0005) {
    clearInterval(scoreTimer);
    clearInterval(enemyTimer);
    clearInterval(shrinkCanvasTimer);
    clearInterval(powerupTimer);
    updateHighScore();
    generateDeathMessage();
  } else {
    requestAnimationFrame(drawScene);
  }
}

function drawScene() {
  clearBackground();
  powerups.forEach(powerup => powerup.draw());
  player.draw();
  enemies.forEach(enemy => enemy.draw());
  updateScene();
  onDeath();
}

canvas.addEventListener("click", restartGame);
requestAnimationFrame(drawScene);

//try using meter instead of the progress bar
//strongly suggested to track highscores with indexedDB event listener?
