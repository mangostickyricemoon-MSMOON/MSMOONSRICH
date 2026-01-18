const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const fullscreenBtn = document.getElementById("fullscreenBtn");


/* ล็อก canvas ไม่ให้ขยับ/เลื่อน */
window.addEventListener("touchmove", e => e.preventDefault(), { passive: false });
window.addEventListener("wheel", e => e.preventDefault(), { passive: false });


fullscreenBtn.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    // เข้า fullscreen
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if (canvas.webkitRequestFullscreen) { // Safari
      canvas.webkitRequestFullscreen();
    } else if (canvas.msRequestFullscreen) { // IE/Edge
      canvas.msRequestFullscreen();
    }
  } else {
    
  }
});

function endGame(){
  clearInterval(gameInterval);
  clearInterval(timerInterval);
  bgSound.pause();
  finalScore.textContent = `${playerName} Score: ${score}`;
  scoreModal.classList.remove("hidden");

  // ✅ ออกจาก fullscreen เมื่อเกมจบ
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { // Safari
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // IE/Edge
      document.msExitFullscreen();
    }
}

let playerName = "";
let score = 0;
let timeLeft = 60;
let gameInterval, timerInterval;
let objects = [];
let effects = []; // เก็บเอฟเฟคเหรียญ/ระเบิด


/* อ่านขนาด player จาก CSS variables */
function getPlayerSize(){
  const styles = getComputedStyle(canvas);
  const w = parseInt(styles.getPropertyValue("--player-width")) || 120;
  const h = parseInt(styles.getPropertyValue("--player-height")) || 120;
  return {w,h};
}

/* อ่านขนาดของที่ตกจาก CSS variables */
function getObjectSizes(){
  const styles = getComputedStyle(canvas);
  const gw = parseInt(styles.getPropertyValue("--good-size")) || 60;
  const bw = parseInt(styles.getPropertyValue("--bad-size")) || 60;
  return { goodSize: gw, badSize: bw };
}

const playerImg = new Image();
playerImg.src = "assets/images/MSMOON.png";
let size = getPlayerSize();
let player = { x: canvas.width - size.w, y: canvas.height - size.h, w:size.w, h:size.h, speed:50 };

const goodImagePaths = ["assets/images/good1.png","assets/images/good2.png","assets/images/good3.png"];
const badImagePaths = ["assets/images/bad1.png","assets/images/bad2.png","assets/images/bad3.png"];
const backgroundImg = new Image();
backgroundImg.src = "assets/images/background.png";

/* เอฟเฟคภาพ */
const coinImg = new Image();
coinImg.src = "assets/images/Coin.png";

const explosionImg = new Image();
/* ใช้ชื่อไฟล์ตามที่คุณให้: Bomb.png */
explosionImg.src = "assets/images/Bomb.png";

const bgSound = new Audio("assets/sounds/bg.mp3");
bgSound.loop = true;

/* preload */
const preloadImages = (paths) => {
  return paths.map(src => {
    const img = new Image();
    img.src = src;
    return img;
  });
};
const goodImages = preloadImages(goodImagePaths);
const badImages = preloadImages(badImagePaths);

// ✅ ดึง element จาก DOM
const welcomeModal = document.getElementById("welcomeModal");
const scoreModal = document.getElementById("scoreModal");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const finalScore = document.getElementById("finalScore");
const playerNameInput = document.getElementById("playerNameInput");

/* วาด background ตั้งแต่ modal welcome */
function drawBackground() {
  if (backgroundImg.complete && backgroundImg.naturalWidth > 0) {
    ctx.drawImage(backgroundImg,0,0,canvas.width,canvas.height);
  }
}
drawBackground();



// ฟังก์ชันกำหนดชื่อ
function setPlayerName(name) {
  if (name.length > 0 && name.length <= 12) {
    playerName = name;
    console.log("ตั้งชื่อเรียบร้อย:", playerName);
    startGame();
  } else {
    alert("❌ ชื่อไม่ถูกต้อง (ต้องไม่เกิน 12 ตัวอักษร)");
  }
}

// อัปเดตชื่อจาก input
playerNameInput.addEventListener("input", () => {
  playerName = playerNameInput.value;
  console.log("ชื่อผู้เล่น:", playerName);
});

// ฟังก์ชันเริ่มเกม
function startGame() {
  console.log("🎮 เริ่มเกมแล้วสำหรับ:", playerName);
  score = 0;
  timeLeft = 60;
  // gameInterval = setInterval(gameLoop, 1000/60);
  // timerInterval = setInterval(updateTimer, 1000);
}

// Flow กดปุ่ม OK
function startGameFlow() {
  playerName = playerNameInput.value.trim() || "PLAYER";
  if (welcomeModal) welcomeModal.classList.add("hidden");
  startGame();
}

// กดปุ่ม OK ด้วย mouse
if (startBtn) startBtn.onclick = startGameFlow;

// กด Enter จาก keyboard
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && welcomeModal && !welcomeModal.classList.contains("hidden")) {
    startGameFlow();
  }
});



function restartGameFlow() {
  scoreModal.classList.add("hidden");
  startGame();
}

// กดปุ่ม Restart ด้วย mouse
restartBtn.onclick = restartGameFlow;

// กด Enter จาก keyboard (ตอน modal score เปิดอยู่)
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !finalScore.classList.contains("hidden")) {
    restartGameFlow();
  }
});


function startGame(){
  clearInterval(gameInterval);
  clearInterval(timerInterval);
  score = 0;
  timeLeft = 60;
  objects = [];
  effects = [];
  bgSound.currentTime = 0;
  bgSound.play();
  timerInterval = setInterval(()=> {
    timeLeft--;
    if(timeLeft <= 0) endGame();
  },1000);
  gameInterval = setInterval(gameLoop, 30);
}

function endGame(){
  clearInterval(gameInterval);
  clearInterval(timerInterval);
  bgSound.pause();
  finalScore.textContent = `${playerName} Score: ${score}`;
  scoreModal.classList.remove("hidden");
}

/* สร้างของตก */
function spawnObject(){
  const { goodSize, badSize } = getObjectSizes();
  const isGood = Math.random() < 0.5;
  if(isGood){
    const img = goodImages[Math.floor(Math.random()*goodImages.length)];
    objects.push({
      x: Math.random()*(canvas.width - goodSize),
      y: -goodSize,
      w: goodSize,
      h: goodSize,
      img: img,
      points: 10,
      type: "good"
    });
  } else {
    const img = badImages[Math.floor(Math.random()*badImages.length)];
    objects.push({
      x: Math.random()*(canvas.width - badSize),
      y: -badSize,
      w: badSize,
      h: badSize,
      img: img,
      points: -5,
      type: "bad"
    });
  }
}

/* เอฟเฟคเหรียญกระจายเป็นวงกลม */
function spawnCoinBurst(cx, cy){
  const count = 16;
  const radius = 10;
  for(let i=0;i<count;i++){
    const angle = (Math.PI*2 * i)/count;
    const speed = 4 + Math.random()*2;
    effects.push({
      kind: "coin",
      x: cx,
      y: cy,
      vx: Math.cos(angle)*speed,
      vy: Math.sin(angle)*speed,
      life: 30,
      size: 20
    });
  }
}

/* เอฟเฟคระเบิดลูกใหญ่ */
function spawnExplosion(cx, cy){
  const count = 1; // ลดจำนวนลง
  for(let i=0; i<count; i++){
    const angle = Math.random() * Math.PI * 1;
    const speed = 2 + Math.random() * 2; // ความเร็วช้าลงนิดหน่อย
    effects.push({
      kind: "explosion",
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 30,   // อยู่บนจอนานขึ้น
      size: 140    // ✅ ลูกใหญ่ขึ้น
    });
  }
}


/* อัปเดตและวาดเอฟเฟค */
function updateEffects(){
  effects.forEach(e=>{
    e.x += e.vx;
    e.y += e.vy;
    e.vy += 0.1; // gravity เล็กน้อย
    e.life -= 1;
  });
  effects = effects.filter(e=> e.life > 0);
}

function drawEffects(){
  effects.forEach(e=>{
    if(e.kind === "coin"){
      if(coinImg.complete && coinImg.naturalWidth > 0){
        ctx.drawImage(coinImg, e.x - e.size/2, e.y - e.size/2, e.size, e.size);
      } else {
        ctx.fillStyle = "gold";
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size/2, 0, Math.PI*2);
        ctx.fill();
      }
    } else if(e.kind === "explosion"){
      if(explosionImg.complete && explosionImg.naturalWidth > 0){
        ctx.drawImage(explosionImg, e.x - e.size/2, e.y - e.size/2, e.size, e.size);
      } else {
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size/2, 0, Math.PI*2);
        ctx.fill();
      }
    }
  });
}

/* เกมลูป */
function gameLoop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawBackground();

  /* อัปเดตขนาด player จาก CSS ทุกเฟรม */
  size = getPlayerSize();
  player.w = size.w;
  player.h = size.h;

  /* วาด player */
  if (playerImg.complete && playerImg.naturalWidth > 0) {
    ctx.drawImage(playerImg, player.x, player.y, player.w, player.h);
  } else {
    ctx.fillStyle="blue";
    ctx.fillRect(player.x,player.y,player.w,player.h);
  }

  /* สุ่ม spawn */
  if(Math.random()<0.05) spawnObject();

  /* อัปเดตและวาดของตก */
  objects.forEach(o=>{
    o.y += 4;
    if(o.img.complete && o.img.naturalWidth > 0){
      ctx.drawImage(o.img,o.x,o.y,o.w,o.h);
    } else {
      ctx.fillStyle = (o.type === "good") ? "lime" : "red";
      ctx.fillRect(o.x,o.y,o.w,o.h);
    }

    /* ตรวจชนกับ player */
    const collide = (o.y+o.h>player.y) && (o.x<player.x+player.w) && (o.x+o.w>player.x);
    if(collide){
      score += o.points;

      /* จุดศูนย์กลางสำหรับเอฟเฟค */
      const cx = o.x + o.w/2;
      const cy = o.y + o.h/2;

      if(o.type === "good"){
        spawnCoinBurst(cx, cy);
      } else {
        spawnExplosion(cx, cy);
      }

      /* ลบวัตถุ */
      o.y = canvas.height + 999;
    }
  });
  objects = objects.filter(o=> o.y < canvas.height);

  /* อัปเดต/วาดเอฟเฟค */
  updateEffects();
  drawEffects();
  /* HUD */
  drawHUD();

  }


/* HUD */
function drawHUD() {
  // Gradient สีสดใส
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, "#ff00ff"); // ม่วง
  gradient.addColorStop(0.5, "#00ffff"); // ฟ้า
  gradient.addColorStop(1, "#ffff00"); // เหลือง

  ctx.fillStyle = gradient;
  ctx.font = "24px 'Orbitron', 'Poppins', sans-serif"; // ฟอนต์ทันสมัย
  ctx.textBaseline = "top";

  // Glow effect
  ctx.shadowColor = "rgba(255,255,255,0.8)";
  ctx.shadowBlur = 12;

  // Player name ตรงกลางบน
  ctx.textAlign = "center";
  ctx.fillText(playerName, canvas.width / 2, 10);

  // Time ซ้ายบน
  ctx.textAlign = "left";
  ctx.fillText("TIME: " + timeLeft, 20, 10);

  // Score ขวาบน
  ctx.textAlign = "right";
  ctx.fillText("SCORE: " + score, canvas.width - 20, 10);

  // ปิด shadow หลังวาดเสร็จ
  ctx.shadowBlur = 0;
}


/* Controls: Keyboard */
document.addEventListener("keydown", e=>{
  if(e.key==="ArrowLeft") player.x=Math.max(0,player.x-player.speed);
  if(e.key==="ArrowRight") player.x=Math.min(canvas.width-player.w,player.x+player.speed);
});

/* Controls: Touch (ล็อกการเลื่อน + ควบคุมซ้าย/ขวา) */
let touchStartX = null;
canvas.addEventListener("touchstart", e=>{
  e.preventDefault();
  touchStartX = e.touches[0].clientX;
});
canvas.addEventListener("touchmove", e=>{
  e.preventDefault();
  if(touchStartX !== null){
    let currentX = e.touches[0].clientX;
    let diff = currentX - touchStartX;
    if(diff < -10){
      player.x = Math.max(0, player.x - player.speed);
      touchStartX = currentX;
    }
    if(diff > 10){
      player.x = Math.min(canvas.width-player.w, player.x + player.speed);
      touchStartX = currentX;
    }
  }
});
canvas.addEventListener("touchend", e=>{
  e.preventDefault();
  touchStartX = null;
});

/* เริ่มวาด background ตอนโหลดหน้า */
backgroundImg.onload = () => drawBackground();
