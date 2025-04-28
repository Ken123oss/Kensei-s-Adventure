// ===== 状態管理 =====
let currentScreen = "title";

// ===== キー設定 =====
let jumpKey = "ArrowUp";
let leftKey = "ArrowLeft";
let rightKey = "ArrowRight";
let downKey = "ArrowDown";

// ===== 音 =====
const bgm = new Audio('bgm.mp3');
const coinSound = new Audio('coin.mp3');
const clearSound = new Audio('clear.mp3');
const gameoverSound = new Audio('gameover.mp3');
bgm.loop = true;
gameoverSound.volume = 1.0;

// ===== Canvas =====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ===== プレイヤー設定 =====
const player = {
  x: 50, y: 300, width: 30, height: 50,
  normalHeight: 50,
  crouchHeight: 30,
  dx: 0, dy: 0, onGround: false
};

let gravity = 0.5;
let jumpPower = -10;
let moveSpeed = 5;
let keys = {};

let platforms = [];
let coins = [];
let enemies = [];

let stage = 1;
const maxStages = 10;
let enemySpeed = 2;
let gameOver = false;
let gameOverTimer = 0;
let stageClear = false;
let coinCount = 0;
let deathCount = 0;
let timeCount = 0;
let gameCompleted = false;
let musicStarted = false;

// ===== キーイベント =====
document.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (!musicStarted) {
    bgm.play();
    musicStarted = true;
  }
  if (currentScreen === "game" && e.code === "Escape") {
    backToTitle();
  }
});

document.addEventListener('keyup', e => keys[e.code] = false);

// ===== タイトル画面関数 =====
function startGame() {
  document.getElementById('titleScreen').style.display = 'none';
  document.getElementById('optionScreen').style.display = 'none';
  document.getElementById('clearScreen').style.display = 'none';
  canvas.style.display = 'block';
  document.getElementById('controls').style.display = 'block';
  currentScreen = "game";

  coinCount = 0;
  deathCount = 0;
  timeCount = 0;
  stage = 1;
  enemySpeed = 2;
  gameOver = false;
  stageClear = false;
  gameCompleted = false;

  createStage();
  resetPlayer();
  requestAnimationFrame(gameLoop);
}

function showOptions() {
  document.getElementById('titleScreen').style.display = 'none';
  document.getElementById('optionScreen').style.display = 'block';
}

function applyOptions() {
  jumpKey = document.getElementById('jumpKeySelect').value;
  leftKey = document.getElementById('leftKeySelect').value;
  rightKey = document.getElementById('rightKeySelect').value;
  downKey = document.getElementById('downKeySelect').value;

  document.getElementById('titleScreen').style.display = 'block';
  document.getElementById('optionScreen').style.display = 'none';
}

function changeJumpKey() {
  if (jumpKey === 'ArrowUp') {
    jumpKey = 'Space';
    document.querySelector('#controls button').innerText = 'ジャンプキー変更（今：Space）';
  } else {
    jumpKey = 'ArrowUp';
    document.querySelector('#controls button').innerText = 'ジャンプキー変更（今：ArrowUp）';
  }
}

function adventure2() {
  alert('Kensei\'s Adventure 2 は Coming Soon...');
}

function backToTitle() {
  currentScreen = "title";
  document.getElementById('titleScreen').style.display = 'block';
  document.getElementById('optionScreen').style.display = 'none';
  document.getElementById('clearScreen').style.display = 'none';
  canvas.style.display = 'none';
  document.getElementById('controls').style.display = 'none';
}

// ===== ゲームループ =====
function gameLoop() {
  if (currentScreen !== "game") return;

  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// ===== ステージ作成 =====
function createStage() {
  platforms = [];
  coins = [];
  enemies = [];
  gameOver = false;
  stageClear = false;

  platforms.push({ x: 0, y: 350, width: 100, height: 20 });

  let lastPlatform = { x: 0, y: 350 };

  for (let i = 0; i < 8; i++) {
    let nextX = lastPlatform.x + 120 + Math.random() * 50;
    let nextY = lastPlatform.y + (Math.random() * 80 - 40);
    nextY = Math.min(Math.max(nextY, 100), 350);

    platforms.push({ x: nextX, y: nextY, width: 80, height: 20 });

    if (Math.random() < 0.7)
      coins.push({ x: nextX + 30, y: nextY - 20, radius: 10, collected: false });

    if (Math.random() < 0.5)
      enemies.push({ x: nextX + 10, y: nextY - 30, width: 30, height: 30, dir: Math.random() < 0.5 ? 1 : -1 });

    lastPlatform = { x: nextX, y: nextY };
  }
}

// ===== プレイヤーリセット =====
function resetPlayer() {
  player.x = 50;
  player.y = 300;
  player.dx = 0;
  player.dy = 0;
  player.height = player.normalHeight;
}

// ===== update関数 =====
function update() {
  if (gameCompleted) return;

  if (gameOver) {
    gameOverTimer--;
    if (gameOverTimer <= 0) {
      resetPlayer();
      createStage();
      gameOver = false;
    }
    return;
  }

  if (stageClear) {
    stage++;
    if (stage > maxStages) {
      gameCompleted = true;
      document.getElementById('clearScreen').style.display = 'block';
      canvas.style.display = 'none';
      document.getElementById('clearStats').innerHTML =
        `Coins: ${coinCount} / Deaths: ${deathCount} / Time: ${Math.floor(timeCount/60)}s`;
      return;
    }
    enemySpeed += 0.5;
    resetPlayer();
    createStage();
    return;
  }

  timeCount++;

  updatePlayer();
  updateEnemies();
  updateCoins();
  checkGoal();
}

function updatePlayer() {
  if (keys[leftKey]) player.dx = -moveSpeed;
  else if (keys[rightKey]) player.dx = moveSpeed;
  else player.dx = 0;

  if (keys[jumpKey] && player.onGround) {
    player.dy = jumpPower;
    player.onGround = false;
  }

  if (keys[downKey]) {
    if (player.height !== player.crouchHeight) {
      player.y += (player.normalHeight - player.crouchHeight);
      player.height = player.crouchHeight;
    }
  } else {
    if (player.height !== player.normalHeight) {
      player.y -= (player.normalHeight - player.crouchHeight);
      player.height = player.normalHeight;
    }
  }

  player.dy += gravity;
  player.x += player.dx;
  player.y += player.dy;

  player.onGround = false;
  platforms.forEach(p => {
    if (player.x < p.x + p.width && player.x + player.width > p.x &&
        player.y + player.height <= p.y + 5 && player.y + player.height + player.dy >= p.y) {
      player.y = p.y - player.height;
      player.dy = 0;
      player.onGround = true;
    }
  });

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
  if (player.y < 0) {
    player.y = 0;
    player.dy = 0;
  }
  if (player.y > canvas.height) {
    gameOver = true;
    gameOverTimer = 60;
    deathCount++;
  }
}

function updateEnemies() {
  enemies.forEach(e => {
    e.x += e.dir * enemySpeed;
    if (e.x < 0 || e.x + e.width > canvas.width) e.dir *= -1;

    if (player.x < e.x + e.width && player.x + player.width > e.x &&
        player.y < e.y + e.height && player.y + player.height > e.y) {
      gameOver = true;
      gameOverTimer = 60;
      deathCount++;
    }
  });
}

function updateCoins() {
  coins.forEach(c => {
    if (!c.collected &&
        player.x < c.x + c.radius && player.x + player.width > c.x - c.radius &&
        player.y < c.y + c.radius && player.y + player.height > c.y - c.radius) {
      c.collected = true;
      coinCount++;
      coinSound.play();
    }
  });
}

function checkGoal() {
  if (player.x + player.width >= canvas.width) {
    stageClear = true;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameCompleted) return; // クリア時は描画止める

  ctx.fillStyle = 'red';
  ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

  ctx.fillStyle = 'gray';
  platforms.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

  coins.forEach(c => {
    if (!c.collected) {
      ctx.beginPath();
      ctx.fillStyle = 'yellow';
      ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  enemies.forEach(e => {
    ctx.fillStyle = 'red';
    ctx.fillRect(e.x, e.y, e.width, e.height);
  });

  ctx.fillStyle = 'blue';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(player.x + player.width/2, player.y + 15, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(player.x + player.width/2 - 4, player.y + 13, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(player.x + player.width/2 + 4, player.y + 13, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText(`Stage: ${stage}`, 10, 30);
  ctx.fillText(`Coins: ${coinCount}`, 700, 30);
  ctx.fillText(`Deaths: ${deathCount}`, 800, 30);
  ctx.fillText(`Time: ${Math.floor(timeCount/60)}s`, 900, 30);

  if (gameOver) {
    ctx.fillStyle = 'white';
    ctx.font = '50px Arial';
    ctx.fillText('Game Over!', 350, 200);
  }
}
