// Initialize the default app
var config = {
        apiKey: "AIzaSyAgyYQphyv1elMoTTuq-a2SjBn5TNFFdn8",
        authDomain: "chaser-game-lmu.firebaseapp.com",
        databaseURL: "https://chaser-game-lmu.firebaseio.com",
        projectId: "chaser-game-lmu",
        storageBucket: "chaser-game-lmu.appspot.com",
        messagingSenderId: "54697517741"
      };
var defaultApp = firebase.initializeApp(config);

console.log(defaultApp.name);  // "[DEFAULT]"

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const progressBar = document.getElementById("progressBar");
const healthPercentage = document.getElementById("healthPercentage");
healthPercentage.innerHTML = progressBar.value;
const numberOfEnemies = document.getElementById("numberOfEnemies");
const backgroundSong = document.getElementById("backgroundSong");
const damageSoundEffect = document.getElementById("damageSoundEffect");
let enemies = [];
let addHealthInterval = undefined;
let addEnemiesInterval = undefined;
let isInvincible = false;
let playerIsAlive = true;
let highscore = 0;
numberOfEnemies.innerHTML = enemies.length;

canvas.width = window.innerHeight - Math.floor(window.innerHeight / 10);
canvas.height = window.innerHeight - Math.floor(window.innerHeight / 10);

function addHealth() {
  if (progressBar.value <= 95) {
    progressBar.value += 5;
    healthPercentage.innerHTML = progressBar.value;
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
    ctx.strokeStyle = "white";
    ctx.stroke();
  }
}

function getPosition() {
  let firstDimension = Math.floor(Math.random() * canvas.height);
  let secondDimension = 0;
  if (getRandomBoolean()) {
    secondDimension = canvas.height;
  }
  this.x = firstDimension;
  this.y = secondDimension;
  if (getRandomBoolean()) {
    this.x = secondDimension;
    this.y = firstDimension;
  }
}

function getRandomBoolean() {
  return Math.random() < 0.5;
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
    getPosition();
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
  numberOfEnemies.innerHTML = enemies.length;
}

function updateScene() {
  moveToward(mouse, player, player.speed);
  enemies.forEach(enemy => moveToward(player, enemy, enemy.speed));
  enemies.forEach(enemy => {
    if (haveCollided(enemy, player) && isInvincible === false) {
      progressBar.value -= 25;
      healthPercentage.innerHTML = progressBar.value;
      player.color = "white";
      damageSoundEffect.play();
      setTimeout(() => (player.color = "red"), 100);
      isInvincible = true;
      setTimeout(() => (isInvincible = false), 1000);
    }
  });
}

function endGame() {
  playerIsAlive = false;
  backgroundSong.pause();
  backgroundSong.currentTime = 0;
  window.clearInterval(addEnemyInterval);
  window.clearInterval(addHealthInterval);
  ctx.font = "50px spooky_light";
  ctx.fillStyle = "red";
  ctx.textAlign = "center";
  ctx.strokeText("You are dead...", canvas.width / 2, canvas.height / 2);
  ctx.fillText("You are dead...", canvas.width / 2, canvas.height / 2);
  testForHighScore();
}

function testForHighScore() {
  let score = enemies.length;
  for (let a = 1; a <= 5; a++) {
    if (score > document.getElementById(`score${a}`).innerHTML) {
      let date = new Date();
      for (let b = 5; b > a; b--) {
        document.getElementById(
          `score${b}`
        ).innerHTML = document.getElementById(`score${b - 1}`).innerHTML;
        document.getElementById(`date${b}`).innerHTML = document.getElementById(
          `date${b - 1}`
        ).innerHTML;
      }
      document.getElementById(`score${a}`).innerHTML = score;
      document.getElementById(`date${a}`).innerHTML = `${date.getMonth() +
        1}/${date.getDate()}/${date.getFullYear()}`;
      storeHighscoresToCookies();
      return;
    }
  }
}

function storeHighscoresToCookies() {
  let cookieScore = undefined;
  let cookieDate = undefined;
  for (let a = 1; a <= 5; a++) {
    cookieScore = document.getElementById(`score${a}`).innerHTML;
    cookieDate = document.getElementById(`date${a}`).innerHTML;
    document.cookie = `score${a}=${cookieScore}`;
    document.cookie = `date${a}=${cookieDate}`;
  }
}

function loadHighscores() {
  let colRef = firebase.firestore().collection('Highscores');
    for (let i = 1; i <=5; i++) {
      putScoresIn(colRef, i);
    }
}

function putScoresIn(colRef, n) {
  let docRef = null;
  if (n == 1) {
    docRef = colRef.doc("First");
  } else if (n == 2) {
    docRef = colRef.doc("Second");
  } else if (n == 3) {
    docRef = colRef.doc("Third");
  } else if (n == 4) {        
    docRef = colRef.doc("Fourth");
  } else {
    docRef = colRef.doc("Fifth");
  }
  docRef.get().then(function(doc) {
    if (doc.exists) {
        document.getElementById(`score${n}`).innerHTML = doc.data().Score;
        document.getElementById(`date${n}`).innerHTML = doc.data().Date;
    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
    }
  }).catch(function(error) {
    console.log("Error getting document:", error);
  });
}

function getCookie(cookieName) {
  let name = cookieName + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function restartGame() {
  if (!playerIsAlive) {
    playerIsAlive = true;
    enemies = [];
    numberOfEnemies.innerHTML = enemies.length;
    progressBar.value = 100;
    healthPercentage.innerHTML = progressBar.value;
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

function writeUserData(userId, name, score, date) {
  firebase.database().ref('users/' + userId).set({
    username: name,
    score: score,
    date : date
  });
}

loadHighscores();
backgroundSong.play();
startIntervals();
requestAnimationFrame(drawScene);
