const canvas = document.querySelector("canvas");
const backgroundSong = document.getElementById("backgroundSong");
const ctx = canvas.getContext("2d");
const progressBar = document.querySelector("progress");
let enemies = [];
let numberOfEnemies = enemies.length;
let addEnemiesInterval = undefined;
let time = 0;
document.querySelector("span").innerHTML = numberOfEnemies;

function addHealth() {
  progressBar.value += 5;
}
let addHealthInterval = setInterval(addHealth, 5000);

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
  ctx.fillStyle = "green";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function addEnemy() {
  enemies.push(new Enemy());
  numberOfEnemies++;
  document.querySelector("span").innerHTML = numberOfEnemies;
}
addEnemyInterval = setInterval(addEnemy, 2000);

function updateScene() {
  moveToward(mouse, player, player.speed);
  enemies.forEach(enemy => moveToward(player, enemy, enemy.speed));
  enemies.forEach(enemy => {
    if (haveCollided(enemy, player) && time === 0) {
      progressBar.value -= 25;
      time = 1;
      setTimeout(() => time = 0, 1000);
    }
  });
}

function endGame() {
  backgroundSong.pause();
  backgroundSong.currentTime = 0;
  console.log("GAME OVER");
  window.clearInterval(addEnemyInterval);
  window.clearInterval(addHealthInterval);
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

requestAnimationFrame(drawScene);
