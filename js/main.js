const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const fullscreenBtn = document.getElementById("fullscreenBtn");

// ✅ กำหนดขนาด canvas ปกติ (480x600)
canvas.width = 480;
canvas.height = 600;

let playerName = "";
let score = 0;
let timeLeft = 60;
let gameInterval, timerInterval;
let objects = [];
let effects = [];
let isPaused = false;
let toggleSpeed = true;
let pendingExitUrl = null;

const bgSound = new Audio("assets/sounds/bg.mp3");
bgSound.loop = true;

const welcomeModal = document.getElementById("welcomeModal");
const scoreModal = document.getElementById("scoreModal");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const finalScore = document.getElementById("finalScore");
const playerNameInput = document.getElementById("playerNameInput");
const pauseModal = document.getElementById("pauseModal");
const exitBtn = document.getElementById("exitBtn");
const cancelBtn = document.getElementById("cancelBtn");

fullscreenBtn.addEventListener("click", () => {
  if (!document.fullscreenElement) canvas.requestFullscreen?.();
  else document.exitFullscreen?.();
});

function endGame() {
  clearInterval(gameInterval);
  clearInterval(timerInterval);
  bgSound.pause();
  finalScore.textContent = `${playerName} Score: ${score}`;
  scoreModal.classList.add("active");
  document.exitFullscreen?.();
}

function startGame() {
  clearInterval(gameInterval);
  clearInterval(timerInterval);
  score = 0;
  timeLeft = 60;
  objects = [];
  effects = [];
  bgSound.currentTime = 0;
  bgSound.play();

  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) endGame();
  }, 1000);

  gameInterval = setInterval(gameLoop, 30);
}

function enableExitBlock() {
  history.pushState(null, null, location.href);
  window.addEventListener("popstate", () => {
    pauseModal.classList.add("active");
    isPaused = true;
    pendingExitUrl = "https://mangoplayx.msmoon.net";
    history.pushState(null, null, location.href);
  });

  document.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", e => {
      if (!link.classList.contains("game-link")) {
        e.preventDefault();
        pauseModal.classList.add("active");
        isPaused = true;
        pendingExitUrl = link.href;
      }
    });
  });
}

exitBtn.onclick = () => window.location.href = pendingExitUrl || "/";
cancelBtn.onclick = () => {
  pauseModal.classList.remove("active");
  isPaused = false;
  history.pushState(null, null, location.href);
  pendingExitUrl = null;
};

function startGameFlow() {
  playerName = playerNameInput.value.trim() || "PLAYER";
  welcomeModal.classList.add("hidden");

  let countdownEl = document.getElementById("countdown");
  let count = 3;
  countdownEl.textContent = count;
  countdownEl.classList.remove("hidden");

  let countdownTimer = setInterval(() => {
    count--;
    if (count > 0) countdownEl.textContent = count;
    else {
      clearInterval(countdownTimer);
      countdownEl.classList.add("hidden");
      startGame();
      enableExitBlock();
    }
  }, 1000);
}

if (startBtn) startBtn.onclick = startGameFlow;
document.addEventListener("keydown", e => {
  if (e.key === "Enter" && !welcomeModal.classList.contains("hidden")) startGameFlow();
});
restartBtn.onclick = () => {
  scoreModal.classList.remove("active");
  startGameFlow();
};

const playerImg = new Image();
playerImg.src = "assets/images/MSMOON.png";

function getPlayerSize() {
  const styles = getComputedStyle(canvas);
  const w = parseInt(styles.getPropertyValue("--player-width")) || 100;
  const h = parseInt(styles.getPropertyValue("--player-height")) || 100;
  return { w, h };
}

let size = getPlayerSize();
let player = {
  x: canvas.width / 2 - size.w / 2,
  y: canvas.height - size.h - 10,
  w: size.w,
  h: size.h,
  speed: 15
};

// ✅ Mouse control
canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  player.x = mouseX - player.w / 2;
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;
});

// ✅ Keyboard control
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") player.x -= player.speed;
  else if (e.key === "ArrowRight") player.x += player.speed;
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;
});

// ✅ Touch control (แก้ให้ลากได้ทุกที่บน canvas)
let dragging = false;

canvas.addEventListener("touchstart", e => {
  dragging = true; // แตะตรงไหนก็เริ่มลาก
  e.preventDefault();
}, { passive: false });

canvas.addEventListener("touchmove", e => {
  if (dragging) {
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    player.x = touchX - player.w / 2;
    if (player.x < 0) player.x = 0;
    if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;
  }
  e.preventDefault();
}, { passive: false });

canvas.addEventListener("touchend", () => {
  dragging = false; // หยุดลาก
});
