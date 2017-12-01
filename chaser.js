const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const progressBar = document.querySelector("progress");
const backgroundSong = document.getElementById("backgroundSong");
let enemies = [];
let addHealthInterval = undefined;
let addEnemiesInterval = undefined;
let isInvincible= false;
let playerIsAlive = true;
document.querySelector("span").innerHTML = numberOfEnemies;

function addHealth() {
  if (progressBar.value < 95) {
    progressBar.value += 5;
  }
}

function distanceBetween(sprite1, sprite2) {
  return Math.hypot(sprite1.x - sprite2.x, sprite1.y - sprite2.y);
}

function haveCollided(sprite1, sprite2) {
  return distanceBetween(sprite1, sprite2) < sprite1.radius + sprite2.radius;
}

class Sprite {
  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.stroke();
  }
}

class Player extends Sprite {
  constructor(x, y, radius, color, speed) {
    super();
    Object.assign(this, { x, y, radius, color, speed });
  }
}

let player = new Player(250, 150, 25, "red", 0.5);

class Enemy extends Sprite {
  constructor() {
    super();
    let x = Math.floor(Math.random() * 600);
    let y = Math.floor(Math.random() * 600);
    let radius = Math.floor(Math.random() * 10 + 10);
    let speed = Math.random() / 10;
    let color = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
      Math.random() * 255
    )}, ${Math.floor(Math.random() * 255)}, ${Math.random()})`;
    Object.assign(this, { x, y, radius, color, speed });
  }
}

let mouse = { x: 0, y: 0 };
document.body.addEventListener("mousemove", updateMouse);
function updateMouse(event) {
  const canvasRectangle = canvas.getBoundingClientRect();
  mouse.x = event.clientX - canvasRectangle.left;
  mouse.y = event.clientY - canvasRectangle.top;
}

function moveToward(leader, follower, speed) {
  follower.x += (leader.x - follower.x) * speed;
  follower.y += (leader.y - follower.y) * speed;
}

function clearBackground() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function addEnemy() {
  enemies.push(new Enemy());
  document.querySelector("span").innerHTML = enemies.length;
}

function updateScene() {
  moveToward(mouse, player, player.speed);
  enemies.forEach(enemy => moveToward(player, enemy, enemy.speed));
  enemies.forEach(enemy => {
    if (haveCollided(enemy, player) && isInvincible === false) {
      progressBar.value -= 25;
      isInvincible = true;
      setTimeout(() => isInvincible = false, 1000);
    }
  });
}

function endGame() {
  playerIsAlive = false;
  backgroundSong.pause();
  backgroundSong.currentTime = 0;
  window.clearInterval(addEnemyInterval);
  window.clearInterval(addHealthInterval);
  ctx.font = "50px Arial";
  ctx.fillStyle = "white"
  ctx.textAlign = "center";
  ctx.fillText("You are dead...", canvas.width / 2, canvas.height / 2);
  testForHighScore();
}

function testForHighScore() {
  score = enemies.length;
  if (typeof(highscore) === "undefined" || (score > highscore)) {
    highscore = score;
    alert(highscore);
  }
}

function restartGame() {
  if (!playerIsAlive) {
    playerIsAlive = true;
    enemies = [];
    document.querySelector("span").innerHTML = 0;
    progressBar.value = 100;
    startIntervals();
    backgroundSong.play();
    requestAnimationFrame(drawScene);
  }
}

function startIntervals() {
  addEnemyInterval = setInterval(addEnemy, 2000);
  addHealthInterval = setInterval(addHealth, 5000);
}

function drawScene() {
  clearBackground();
  player.draw();
  enemies.forEach(enemy => enemy.draw());
  updateScene();
  if (progressBar.value <= 0) {
    endGame();
  } else {
    requestAnimationFrame(drawScene);
  }
}

backgroundSong.play();
startIntervals();
requestAnimationFrame(drawScene);
