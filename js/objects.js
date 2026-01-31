// โหลดรูป Jackpot (LOGO, SHIDO)
const jackpotImages = [
  (() => { const img = new Image(); img.src = "assets/images/LOGO.png"; return img; })(),
  (() => { const img = new Image(); img.src = "assets/images/SHIDO.png"; return img; })()
];

// โหลดรูป Good (เหรียญ, item ดี)
const goodImages = [
  (() => { const img = new Image(); img.src = "assets/images/good1.png"; return img; })(),
  (() => { const img = new Image(); img.src = "assets/images/good2.png"; return img; })(),
  (() => { const img = new Image(); img.src = "assets/images/good3.png"; return img; })()
];

// โหลดรูป Bad (ระเบิด, item แย่)
const badImages = [
  (() => { const img = new Image(); img.src = "assets/images/bad1.png"; return img; })(),
  (() => { const img = new Image(); img.src = "assets/images/bad2.png"; return img; })(),
  (() => { const img = new Image(); img.src = "assets/images/bad3.png"; return img; })()
];

// ฟังก์ชันคืนค่าขนาดวัตถุ
function getObjectSizes() {
  return { goodSize: 60, badSize: 60 };
}

// ฟังก์ชันสร้างวัตถุที่ตกลงมา
function spawnObject() {
  const { goodSize, badSize } = getObjectSizes();
  const isJackpot = Math.random() < 0.04; // 🔽 ลดโอกาส Jackpot จาก 5% → 3%
  const isGood = Math.random() < 0.5;     // 🔽 ลดโอกาส Good จาก 50% → 40%

  if (isJackpot) {
    const pick = Math.floor(Math.random() * jackpotImages.length);
    const img = jackpotImages[pick];
    const points = (pick === 0) ? 20 : 30;

    objects.push({
      x: Math.random() * (canvas.width - goodSize),
      y: -goodSize,
      w: goodSize,
      h: goodSize,
      img,
      points,
      type: "jackpot",
      speed: 4 + Math.random() * 3 // 🔽 ลดความเร็ว Jackpot จาก 4–7 → 2–3.5
    });
  } else if (isGood) {
    const img = goodImages[Math.floor(Math.random() * goodImages.length)];
    objects.push({
      x: Math.random() * (canvas.width - goodSize),
      y: -goodSize,
      w: goodSize,
      h: goodSize,
      img,
      points: 10,
      type: "good",
      speed: toggleSpeed ? (4 + Math.random() * 2) : (6 + Math.random() * 2)
      // 🔽 ลดความเร็ว Good จาก 3–6 → 2–4
    });
  } else {
    const img = badImages[Math.floor(Math.random() * badImages.length)];
    objects.push({
      x: Math.random() * (canvas.width - badSize),
      y: -badSize,
      w: badSize,
      h: badSize,
      img,
      points: -5,
      type: "bad",
      speed: toggleSpeed ? (6 + Math.random() * 2) : (4 + Math.random() * 2)
      // 🔽 ลดความเร็ว Bad จาก 3–5 → 2–3.5
    });
  }

  toggleSpeed = !toggleSpeed;
}

// ฟังก์ชันตรวจสอบการชน
function checkCollision(player, obj) {
  return (
    player.x < obj.x + obj.w &&
    player.x + player.w > obj.x &&
    player.y < obj.y + obj.h &&
    player.y + player.h > obj.y
  );
}
