// โหลดรูป Coin และ Explosion
const coinImg = new Image();
coinImg.src = "assets/images/Coin.png";

const explosionImg = new Image();
explosionImg.src = "assets/images/Bomb.png";

// เอฟเฟค Jackpot เหรียญกระจาย + ข้อความ JACKPOT
function spawnJackpotEffect(cx, cy) {
  const count = 24;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = 5 + Math.random() * 3;
    effects.push({
      kind: "coin",
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 40,
      size: 28
    });
  }
  spawnScoreText("JACKPOT!", cx, cy - 20, "gold", 40);
}

// เอฟเฟคเหรียญกระจาย
function spawnCoinBurst(cx, cy) {
  const count = 16;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = 4 + Math.random() * 2;
    effects.push({
      kind: "coin",
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 30,
      size: 20
    });
  }
}

// เอฟเฟคระเบิด
function spawnExplosion(cx, cy) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 2 + Math.random() * 2;
  effects.push({
    kind: "explosion",
    x: cx,
    y: cy,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 30,
    size: 140
  });
}

// ข้อความคะแนน
function spawnScoreText(text, x, y, color, size = 24) {
  effects.push({
    kind: "scoreText",
    text,
    x,
    y,
    vy: -2,
    life: 30,
    color,
    size
  });
}

// อัปเดตเอฟเฟค
function updateEffects() {
  effects.forEach(e => {
    if (e.kind === "scoreText") {
      e.y += e.vy;
    } else {
      e.x += e.vx;
      e.y += e.vy;
      e.vy += 0.1; // gravity
    }
    e.life--;
  });
  effects = effects.filter(e => e.life > 0);
}

// วาดเอฟเฟค
function drawEffects(ctx) {
  effects.forEach(fx => {
    if (fx.kind === "coin") {
      if (coinImg.complete && coinImg.naturalWidth > 0) {
        ctx.drawImage(coinImg, fx.x - fx.size / 2, fx.y - fx.size / 2, fx.size, fx.size);
      } else {
        ctx.fillStyle = "gold";
        ctx.beginPath();
        ctx.arc(fx.x, fx.y, fx.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (fx.kind === "explosion") {
      if (explosionImg.complete && explosionImg.naturalWidth > 0) {
        ctx.drawImage(explosionImg, fx.x - fx.size / 2, fx.y - fx.size / 2, fx.size, fx.size);
      } else {
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(fx.x, fx.y, fx.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

  // วาดข้อความคะแนน
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
