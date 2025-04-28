const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameStarted = false;

// プレイヤーデータ
const player = {
  x: 50, y: 300, width: 30, height: 50,
  dx: 0, dy: 0,
  gravity: 0.5,
  jumpPower: -10,
  onGround: false
};

let keys = {};

document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);

function startGame() {
  document.getElementById('storyScreen').style.display = 'none';
  canvas.style.display = 'block';
  gameStarted = true;
  requestAnimationFrame(gameLoop);
}

function update() {
  if (!gameStarted) return;

  // 左右移動
  if (keys['ArrowLeft']) player.dx = -5;
  else if (keys['ArrowRight']) player.dx = 5;
  else player.dx = 0;

  // ジャンプ
  if (keys['Space'] && player.onGround) {
    player.dy = player.jumpPower;
    player.onGround = false;
  }

  // 重力
  player.dy += player.gravity;
  player.x += player.dx;
  player.y += player.dy;

  // 床に立つ
  if (player.y + player.height > 380) {
    player.y = 380 - player.height;
    player.dy = 0;
    player.onGround = true;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 地面
  ctx.fillStyle = 'red';
  ctx.fillRect(0, 380, canvas.width, 20);

  // プレイヤー
  ctx.fillStyle = 'blue';
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
