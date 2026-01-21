const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const fullscreenBtn = document.getElementById("fullscreenBtn");


/* ล็อก canvas ไม่ให้ขยับ/เลื่อน */
canvas.addEventListener("touchmove", e => e.preventDefault(), { passive: false });
canvas.addEventListener("wheel", e => e.preventDefault(), { passive: false });


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
let isPaused = false; // สถานะ pause
let sizes = getObjectSizes();
let toggleSpeed = true; // เริ่มต้นรอบแรก
let pendingExitUrl = null; // ตัวแปรเก็บลิงก์ที่จะออก

/* อ่านขนาด player จาก CSS variables */
function getPlayerSize(){
  const styles = getComputedStyle(canvas);
  const w = parseInt(styles.getPropertyValue("--player-width")) || 100;
  const h = parseInt(styles.getPropertyValue("--player-height")) || 100;
  return {w,h};
}

/* อ่านขนาดของที่ตกจาก CSS variables */
function getObjectSizes(){
  const styles = getComputedStyle(canvas);
  const gw = parseInt(styles.getPropertyValue("--good-size")) || 70;
  const bw = parseInt(styles.getPropertyValue("--bad-size")) || 70;
  return { goodSize: gw, badSize: bw };
}

/* ความเร็ว Object */
function createObject(type, x, y, size, image) {
  return {
    type: type,
    x: x,
    y: y,
    size: size,
    image: image,
    // ✅ สุ่มความเร็วระหว่าง 2 ถึง 7
    speed: 2 + Math.random() * 5
  };
}


/* preload */
const preloadImages = (paths) => {
  return paths.map(src => {
    const img = new Image();
    img.src = src;
    return img;
  });
};

const playerImg = new Image();
playerImg.src = "assets/images/MSMOON.png";
let size = getPlayerSize();
let player = { x: canvas.width - size.w, y: canvas.height - size.h, w:size.w, h:size.h, speed:15 };

const jackpotImagePaths = ["assets/images/LOGO.png","assets/images/SHIDO.png"];
const jackpotImages = preloadImages(jackpotImagePaths);
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

    // Flow กดปุ่ม OK
    function startGameFlow() {
      playerName = playerNameInput.value.trim() || "PLAYER";
      if (welcomeModal) welcomeModal.classList.add("hidden");

      // ✅ เริ่ม countdown 3 วิ
      let countdownEl = document.getElementById("countdown");
      let count = 3;
      countdownEl.textContent = count;
      countdownEl.classList.remove("hidden");

      let countdownTimer = setInterval(() => {
        count--;
        if (count > 0) {
          countdownEl.textContent = count;
        } else {
          clearInterval(countdownTimer);
          countdownEl.classList.add("hidden");

          // เริ่มเกมจริง
          startGame();

          // เปิดใช้งาน blockExit หลังเริ่มเกม
          enableExitBlock();
        }
      }, 1000);
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

      // ✅ เริ่ม countdown ก่อน restart
      let countdownEl = document.getElementById("countdown");
      let count = 3;
      countdownEl.textContent = count;
      countdownEl.classList.remove("hidden");

      let countdownTimer = setInterval(() => {
        count--;
        if (count > 0) {
          countdownEl.textContent = count;
        } else {
          clearInterval(countdownTimer);
          countdownEl.classList.add("hidden");
          startGame();
        }
      }, 1000);
    }

    // กดปุ่ม Restart ด้วย mouse
    restartBtn.onclick = restartGameFlow;

    // กด Enter จาก keyboard (ตอน modal score เปิดอยู่)
    document.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !scoreModal.classList.contains("hidden")) {
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
    // _______________________
    // เปิดใช้งานการกันออกหลังเริ่มเกม
    function enableExitBlock() {
      // กัน back button
      history.pushState(null, null, location.href);
      window.addEventListener("popstate", function (event) {
        document.getElementById("pauseModal").classList.remove("hidden");
        isPaused = true;
        pendingExitUrl = document.referrer || "/"; // ถ้า back → กลับไปหน้าก่อน
        history.pushState(null, null, location.href);
      });

      // กันการกดลิงก์ออกจากเกม
      document.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", e => {
          if (!link.classList.contains("game-link")) {
            e.preventDefault();
            document.getElementById("pauseModal").classList.remove("hidden");
            isPaused = true;
            pendingExitUrl = link.href; // ✅ เก็บลิงก์ที่กดไว้
          }
        });
      });
    }

    // ปุ่ม Exit → ไปตามลิงก์ที่กดก่อน
    document.getElementById("exitBtn").addEventListener("click", () => {
      if (pendingExitUrl) {
        window.location.href = pendingExitUrl;
      } else {
        window.location.href = "/"; // fallback ถ้าไม่มีลิงก์
      }
    });

    // ปุ่ม Cancel → resume เล่นต่อ
    document.getElementById("cancelBtn").addEventListener("click", () => {
      document.getElementById("pauseModal").classList.add("hidden");
      isPaused = false;
      history.pushState(null, null, location.href);
      pendingExitUrl = null; // เคลียร์ค่า
    });




    // เริ่มเกมเมื่อกด Start
    document.getElementById("startBtn").addEventListener("click", () => {
      const name = document.getElementById("playerNameInput").value.trim();
      if (name) {
        playerName = name;
        document.getElementById("welcomeModal").style.display = "none";

        // ✅ เปิดใช้งาน blockExit หลังเริ่มเกม
        enableExitBlock();

        // เริ่ม gameLoop() ได้เลย
        gameLoop();
      }
    });

    

    /* เงื่อไขเกมส์_________________________________________ */
    /* สร้างของตก */
    function spawnObject() {
      const { goodSize, badSize } = getObjectSizes();
      const isJackpot = Math.random() < 0.05;
      const isGood = Math.random() < 0.5;

      if (isJackpot) {
        const pick = Math.floor(Math.random() * jackpotImages.length);
        const img = jackpotImages[pick];
        const points = (pick === 0) ? 20 : 30; // index 0 = LOGO, 1 = SHIDO
        objects.push({
          x: Math.random() * (canvas.width - goodSize),
          y: -goodSize,
          w: goodSize,
          h: goodSize,
          img: img,
          points: points,
          type: "jackpot",
          speed: 3 + Math.random() * 3 // jackpot speed 3–6
        });
      } else if (isGood) {
        const img = goodImages[Math.floor(Math.random() * goodImages.length)];
        objects.push({
          x: Math.random() * (canvas.width - goodSize),
          y: -goodSize,
          w: goodSize,
          h: goodSize,
          img: img,
          points: 10,
          type: "good",
          speed: toggleSpeed ? (2 + Math.random() * 2) : (6 + Math.random() * 2) // good speed 2–5
          // ถ้า toggleSpeed = true → good ช้า (2–4) 
          // // ถ้า toggleSpeed = false → good เร็ว (6–8)
        });
      } else {
        const img = badImages[Math.floor(Math.random() * badImages.length)];
        objects.push({
          x: Math.random() * (canvas.width - badSize),
          y: -badSize,
          w: badSize,
          h: badSize,
          img: img,
          points: -5,
          type: "bad",
          speed: toggleSpeed ? (6 + Math.random() * 2) : (2 + Math.random() * 2) // bad speed 4–8
          // ถ้า toggleSpeed = true → bad เร็ว (6–8) 
          // // ถ้า toggleSpeed = false → bad ช้า (2–4)
        });
      }
      // ✅ สลับสถานะทุกครั้งที่ spawn 
      toggleSpeed = !toggleSpeed;
    }



/* เอฟเฟคเหรียญกระจายเป็นวงกลม Jackpot */
function spawnJackpotEffect(cx, cy){
  const count = 24; // มากกว่า coin ปกติ
  for(let i=0;i<count;i++){
    const angle = (Math.PI*2 * i)/count;
    const speed = 5 + Math.random()*3;
    effects.push({
      kind: "coin",
      x: cx,
      y: cy,
      vx: Math.cos(angle)*speed,
      vy: Math.sin(angle)*speed,
      life: 40,   // อยู่บนจอนานกว่า
      size: 28    // ใหญ่กว่า coin ปกติ
    });
  }

  // ✅ เพิ่มข้อความ JACKPOT ใหญ่ ๆ สีทอง
  spawnScoreText("JACKPOT!", cx, cy-20, "gold", 40);
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

// ---------------- Effects ----------------

// ✅ เพิ่มฟังก์ชันสร้างข้อความคะแนน
function spawnScoreText(text, x, y, color) {
  effects.push({
    kind: "scoreText",
    text: text,
    x: x,
    y: y,
    vy: -2,       // ลอยขึ้น
    life: 30,     // อยู่ประมาณ 30 เฟรม
    color: color,
    size: 24
  });
}

/* อัปเดตเอฟเฟค */
function updateEffects(){
  effects.forEach(e=>{
    if(e.kind === "scoreText"){
      // อัปเดตข้อความคะแนน
      e.y += e.vy;
      e.life--;
    } else {
      // อัปเดต coin / explosion
      e.x += e.vx;
      e.y += e.vy;
      e.vy += 0.1; // gravity เล็กน้อย
      e.life -= 1;
    }
  });
  effects = effects.filter(e=> e.life > 0);
}

// ✅ ตัวอย่างการตรวจชน (สมมติว่ามี player object)
function checkCollision(player, obj) {
  return (
    player.x < obj.x + obj.w &&
    player.x + player.w > obj.x &&
    player.y < obj.y + obj.h &&
    player.y + player.h > obj.y
  );
}

function updateGame() {
  objects.forEach((obj, index) => {
    obj.y += 5; // ตกลงมา

    if (checkCollision(player, obj)) {
      score += obj.points;

      // ✅ สร้างข้อความคะแนนตรงตำแหน่งที่ชน
      let scoreText, scoreColor, scoreSize;

      if (obj.type === "good") {
        scoreText = `+${obj.points}`;
        scoreColor = "lime";
        scoreSize = 24;
      } else if (obj.type === "jackpot") {
        scoreText = `JACKPOT +${obj.points}`;
        scoreColor = "gold";
        scoreSize = 36; // ใหญ่กว่าปกติ
      } else {
        scoreText = `${obj.points}`; // เช่น -5
        scoreColor = "#8B0000"; // DarkRed
        scoreSize = 24;
      }

      spawnScoreText(
        scoreText,
        obj.x + obj.w / 2,
        obj.y,
        scoreColor,
        scoreSize
      );


      // เอฟเฟคพิเศษ
      if (obj.type === "good") {
        spawnCoinBurst(obj.x, obj.y);
      } else if (obj.type === "jackpot") {
        // ให้ jackpot ใช้เอฟเฟคเหรียญ หรือทำเอฟเฟคพิเศษ
        spawnJackpotEffect(obj.x, obj.y);
        // หรือ spawnJackpotEffect(obj.x, obj.y);
      } else {
        spawnExplosion(obj.x, obj.y);
      }


      objects.splice(index, 1); // ลบ object ที่เก็บแล้ว
    }
  });

  // อัปเดต effects เฉพาะ scoreText (กันพัง)
  effects.forEach((fx, i) => {
    if (fx.kind === "scoreText") {
      fx.y += fx.vy;
      fx.life--;
      if (fx.life <= 0) effects.splice(i, 1);
    }
  });
}

/* ฟังก์ชันวาด effects */
function drawEffects(ctx) {
  // วาด coin และ explosion ก่อน
  effects.forEach(fx => {
    if (fx.kind === "coin") {
      if (coinImg.complete && coinImg.naturalWidth > 0) {
        ctx.drawImage(coinImg, fx.x - fx.size/2, fx.y - fx.size/2, fx.size, fx.size);
      } else {
        ctx.fillStyle = "gold";
        ctx.beginPath();
        ctx.arc(fx.x, fx.y, fx.size/2, 0, Math.PI*2);
        ctx.fill();
      }
    } else if (fx.kind === "explosion") {
      if (explosionImg.complete && explosionImg.naturalWidth > 0) {
        ctx.drawImage(explosionImg, fx.x - fx.size/2, fx.y - fx.size/2, fx.size, fx.size);
      } else {
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(fx.x, fx.y, fx.size/2, 0, Math.PI*2);
        ctx.fill();
      }
    }
  });

  // ✅ วาด scoreText หลังสุด เพื่อให้อยู่ด้านหน้า
  effects.forEach(fx => {
    if (fx.kind === "scoreText") {
      ctx.shadowColor = fx.color;
      ctx.shadowBlur = 20;

      const gradient = ctx.createLinearGradient(fx.x - 20, fx.y, fx.x + 20, fx.y);
      gradient.addColorStop(0, fx.color);
      gradient.addColorStop(1, "#ffffff");

      ctx.fillStyle = gradient;
      ctx.font = `${fx.size}px 'Orbitron', 'Poppins', sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(fx.text, fx.x, fx.y);

      ctx.shadowBlur = 0;
    }
  });
}


// ______________________________________________
/* เกมลูป */
function gameLoop(){
  if (isPaused) return; // ถ้า pause → ไม่ทำงานต่อ
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
    o.y += o.speed;
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

      // ✅ เพิ่มบรรทัดนี้ 
      spawnScoreText(
         o.points > 0 ? `+${o.points}` : `${o.points}`, 
         cx, 
         cy, 
         o.points > 0 ? "lime" : "red" 
        );

      if (o.type === "good") {
        spawnCoinBurst(cx, cy);
      } else if (o.type === "jackpot") {
        // ให้ jackpot ใช้เอฟเฟคเหรียญ หรือทำเอฟเฟคพิเศษ
        spawnJackpotEffect(cx, cy);
        // หรือ spawnJackpotEffect(cx, cy);
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
  drawEffects(ctx);
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

    /* Controls: Mouse */
    let isDragging = false;

    canvas.addEventListener("mousedown", e => {
      isDragging = true;
    });

    canvas.addEventListener("mousemove", e => {
      if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        // ให้ player ตามตำแหน่งเมาส์ (ตรงกลาง)
        player.x = Math.min(canvas.width - player.w, Math.max(0, mouseX - player.w / 2));
      }
    });

    canvas.addEventListener("mouseup", e => {
      isDragging = false;
    });


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
