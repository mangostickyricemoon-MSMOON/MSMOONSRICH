// โหลดรูป Background
let bgImg = new Image();
bgImg.src = "assets/images/background.png";

function drawBackground() {
  if (bgImg.complete && bgImg.naturalWidth > 0) {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function gameLoop() {
  if (isPaused) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // วาด background
  drawBackground();

  // อัปเดตขนาด player
  size = getPlayerSize();
  player.w = size.w;
  player.h = size.h;

  // วาด player
  if (playerImg.complete && playerImg.naturalWidth > 0) {
    ctx.drawImage(playerImg, player.x, player.y, player.w, player.h);
  } else {
    ctx.fillStyle = "blue";
    ctx.fillRect(player.x, player.y, player.w, player.h);
  }

  // สุ่ม spawn object
  if (Math.random() < 0.065) spawnObject(); // เพิ่มโอกาสให้เห็นเร็วขึ้น

  // อัปเดตและวาด object
  objects.forEach(o => {
    o.y += o.speed;
    if (o.img && o.img.complete && o.img.naturalWidth > 0) {
      ctx.drawImage(o.img, o.x, o.y, o.w, o.h);
    } else {
      ctx.fillStyle = (o.type === "good") ? "lime" : (o.type === "jackpot" ? "gold" : "red");
      ctx.fillRect(o.x, o.y, o.w, o.h);
    }

    // ตรวจชน
    const collide = (
      o.y + o.h > player.y &&
      o.x < player.x + player.w &&
      o.x + o.w > player.x
    );

    if (collide) {
      score += o.points;
      const cx = o.x + o.w / 2;
      const cy = o.y + o.h / 2;

      spawnScoreText(o.points > 0 ? `+${o.points}` : `${o.points}`, cx, cy, o.points > 0 ? "lime" : "red");

      if (o.type === "good") spawnCoinBurst(cx, cy);
      else if (o.type === "jackpot") spawnJackpotEffect(cx, cy);
      else spawnExplosion(cx, cy);

      o.y = canvas.height + 999; // ลบออก
    }
  });

  objects = objects.filter(o => o.y < canvas.height);

  // เอฟเฟค
  updateEffects();
  drawEffects(ctx);

  // HUD
  drawHUD();
}

function drawHUD() {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, "#ff00ff");
  gradient.addColorStop(0.5, "#00ffff");
  gradient.addColorStop(1, "#ffff00");

  ctx.fillStyle = gradient;
  ctx.font = "24px 'Orbitron', 'Poppins', sans-serif";
  ctx.textBaseline = "top";

  ctx.shadowColor = "rgba(255,255,255,0.8)";
  ctx.shadowBlur = 12;

  ctx.textAlign = "center";
  ctx.fillText(playerName, canvas.width / 2, 10);

  ctx.textAlign = "left";
  ctx.fillText("TIME: " + timeLeft, 20, 10);

  ctx.textAlign = "right";
  ctx.fillText("SCORE: " + score, canvas.width - 20, 10);

  ctx.shadowBlur = 0;
}
