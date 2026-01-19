const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");

const playerScoreEl = document.getElementById("playerScore");
const cpuScoreEl = document.getElementById("cpuScore");
const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("reset");

const state = {
  paddleHeight: 90,
  paddleWidth: 14,
  paddleInset: 24,
  paddleSpeed: 6,
  ballRadius: 8,
  maxScore: 7,
  playerScore: 0,
  cpuScore: 0,
  running: false,
  ball: {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: 4,
    vy: 3,
  },
  player: {
    y: canvas.height / 2 - 45,
    moveUp: false,
    moveDown: false,
  },
  cpu: {
    y: canvas.height / 2 - 45,
  },
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const resetBall = (direction = 1) => {
  state.ball.x = canvas.width / 2;
  state.ball.y = canvas.height / 2;
  state.ball.vx = (3.5 + Math.random() * 1.5) * direction;
  state.ball.vy = (Math.random() * 4 - 2);
};

const resetMatch = () => {
  state.playerScore = 0;
  state.cpuScore = 0;
  state.player.y = canvas.height / 2 - state.paddleHeight / 2;
  state.cpu.y = canvas.height / 2 - state.paddleHeight / 2;
  state.running = false;
  updateScore();
  resetBall(Math.random() > 0.5 ? 1 : -1);
  statusEl.textContent = "Press Space to start";
};

const updateScore = () => {
  playerScoreEl.textContent = state.playerScore;
  cpuScoreEl.textContent = state.cpuScore;
};

const movePlayer = () => {
  if (state.player.moveUp) {
    state.player.y -= state.paddleSpeed;
  }
  if (state.player.moveDown) {
    state.player.y += state.paddleSpeed;
  }
  state.player.y = clamp(state.player.y, 0, canvas.height - state.paddleHeight);
};

const moveCpu = () => {
  const target = state.ball.y - state.paddleHeight / 2;
  const diff = target - state.cpu.y;
  const step = clamp(diff, -state.paddleSpeed + 1, state.paddleSpeed - 1);
  state.cpu.y = clamp(state.cpu.y + step * 0.9, 0, canvas.height - state.paddleHeight);
};

const checkPaddleHit = (paddleX, paddleY) => {
  const ball = state.ball;
  const withinY = ball.y > paddleY && ball.y < paddleY + state.paddleHeight;
  const withinX = Math.abs(ball.x - paddleX) <= state.paddleWidth / 2 + state.ballRadius;
  return withinX && withinY;
};

const updateBall = () => {
  const ball = state.ball;
  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.y <= state.ballRadius || ball.y >= canvas.height - state.ballRadius) {
    ball.vy *= -1;
  }

  const playerX = state.paddleInset + state.paddleWidth / 2;
  const cpuX = canvas.width - state.paddleInset - state.paddleWidth / 2;

  if (checkPaddleHit(playerX, state.player.y) && ball.vx < 0) {
    ball.vx *= -1.08;
    ball.vy += (ball.y - (state.player.y + state.paddleHeight / 2)) * 0.06;
  }

  if (checkPaddleHit(cpuX, state.cpu.y) && ball.vx > 0) {
    ball.vx *= -1.06;
    ball.vy += (ball.y - (state.cpu.y + state.paddleHeight / 2)) * 0.05;
  }

  if (ball.x < 0) {
    state.cpuScore += 1;
    updateScore();
    resetBall(1);
  }

  if (ball.x > canvas.width) {
    state.playerScore += 1;
    updateScore();
    resetBall(-1);
  }

  if (state.playerScore >= state.maxScore || state.cpuScore >= state.maxScore) {
    state.running = false;
    const winner = state.playerScore > state.cpuScore ? "You win!" : "CPU wins!";
    statusEl.textContent = `${winner} Press Space to play again.`;
  }
};

const drawNet = () => {
  ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
  ctx.setLineDash([8, 12]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 12);
  ctx.lineTo(canvas.width / 2, canvas.height - 12);
  ctx.stroke();
  ctx.setLineDash([]);
};

const draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawNet();

  ctx.fillStyle = "#58a6ff";
  ctx.fillRect(
    state.paddleInset,
    state.player.y,
    state.paddleWidth,
    state.paddleHeight
  );

  ctx.fillStyle = "#f97316";
  ctx.fillRect(
    canvas.width - state.paddleInset - state.paddleWidth,
    state.cpu.y,
    state.paddleWidth,
    state.paddleHeight
  );

  ctx.beginPath();
  ctx.fillStyle = "#f8fafc";
  ctx.arc(state.ball.x, state.ball.y, state.ballRadius, 0, Math.PI * 2);
  ctx.fill();
};

const tick = () => {
  if (state.running) {
    movePlayer();
    moveCpu();
    updateBall();
  }
  draw();
  requestAnimationFrame(tick);
};

const handleKey = (event, isDown) => {
  if (event.code === "ArrowUp" || event.code === "KeyW") {
    state.player.moveUp = isDown;
  }
  if (event.code === "ArrowDown" || event.code === "KeyS") {
    state.player.moveDown = isDown;
  }
  if (isDown && event.code === "Space") {
    if (!state.running) {
      if (state.playerScore >= state.maxScore || state.cpuScore >= state.maxScore) {
        state.playerScore = 0;
        state.cpuScore = 0;
        updateScore();
      }
      state.running = true;
      statusEl.textContent = "First to 7 wins";
    }
  }
};

window.addEventListener("keydown", (event) => handleKey(event, true));
window.addEventListener("keyup", (event) => handleKey(event, false));
resetBtn.addEventListener("click", resetMatch);

resetMatch();
requestAnimationFrame(tick);
