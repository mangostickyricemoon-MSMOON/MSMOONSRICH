// โหลดรูป Player
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
  speed: 10
};

// ✅ เป้าหมายตำแหน่ง
let targetX = player.x;
let dragging = false; // flag สำหรับตรวจว่ากำลังลากอยู่หรือไม่

// Controls: Mouse (เลื่อนตามเมาส์)
canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  targetX = mouseX - player.w / 2;
});

// Controls: Keyboard
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") {
    targetX = player.x - player.speed;
  } else if (e.key === "ArrowRight") {
    targetX = player.x + player.speed;
  }
});

// ✅ Controls: Touch (ต้องแตะโดนตัวผู้เล่นก่อนถึงจะลากได้)
canvas.addEventListener("touchstart", e => {
  const rect = canvas.getBoundingClientRect();
  const touchX = e.touches[0].clientX - rect.left;
  const touchY = e.touches[0].clientY - rect.top;

  // ตรวจว่าจิ้มโดนตัวผู้เล่นหรือไม่
  if (
    touchX >= player.x &&
    touchX <= player.x + player.w &&
    touchY >= player.y &&
    touchY <= player.y + player.h
  ) {
    dragging = true; // เริ่มโหมดลาก
  } else {
    dragging = false; // จิ้มที่ว่าง → ไม่ทำอะไร
  }

  e.preventDefault();
}, { passive: false });

canvas.addEventListener("touchmove", e => {
  if (dragging) {
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    targetX = touchX - player.w / 2; // อัพเดตเฉพาะตอนลาก
  }
  e.preventDefault();
}, { passive: false });

canvas.addEventListener("touchend", () => {
  dragging = false; // หยุดลาก
});

// ✅ อัพเดตตำแหน่ง player ให้เลื่อนทีละนิด
function updatePlayer() {
  const dx = targetX - player.x;

  if (Math.abs(dx) > 1) {
    player.x += dx * 0.15; // ความนุ่มนวล
  } else {
    player.x = targetX;
  }

  // ป้องกันไม่ให้ออกนอกจอ
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;
}

// ใน game loop
function gameLoop() {
  updatePlayer();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(playerImg, player.x, player.y, player.w, player.h);

  requestAnimationFrame(gameLoop);
}

gameLoop();
