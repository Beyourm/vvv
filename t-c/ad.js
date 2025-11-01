// script.js

// ===================================
// 1. عرض / إخفاء كلمة المرور وتحسين UX
// ===================================
document.getElementById('togglePassword').addEventListener('click', function(){
  const input = document.getElementById('password');
  const isPassword = input.type === 'password';
  
  // تبديل نوع الحقل بين النص وكلمة المرور
  input.type = isPassword ? 'text' : 'password';
  
  // تبديل الأيقونة
  this.classList.toggle('fa-eye-slash', isPassword);
  this.classList.toggle('fa-eye', !isPassword);

  // إعادة التركيز على حقل الإدخال بعد التبديل
  input.focus();
});


// ===================================
// 2. خلفية الجسيمات المتحركة (مع تحسين الأداء)
// ===================================

const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let particlesArray = [];
let animationId;

// ضبط حجم الـ Canvas
function setCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // إعادة إنشاء الجسيمات بعد تغيير الحجم لتجنب مشاكل الحدود
  particlesArray = [];
  for (let i = 0; i < 90; i++) particlesArray.push(new Particle());
}

// الفئة (Class) الخاصة بالجسيم
class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.5; // تقليل السرعة قليلاً لإضفاء سلاسة
    this.speedY = (Math.random() - 0.5) * 0.5;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
  }
  draw() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// دالة ربط الجسيمات (تحسين الأداء)
function connectParticles() {
  const maxDistSq = 100 * 100; // مربع المسافة القصوى (100^2)
  ctx.beginPath(); // بدء مسار رسم واحد لجميع الخطوط
  ctx.lineWidth = 0.5;
  
  for (let a = 0; a < particlesArray.length; a++) {
    // البدء من الجسيم التالي (b = a + 1) لتجنب التكرار
    for (let b = a + 1; b < particlesArray.length; b++) { 
      let dx = particlesArray[a].x - particlesArray[b].x;
      let dy = particlesArray[a].y - particlesArray[b].y;
      let distSq = dx * dx + dy * dy; // استخدام مربع المسافة (أسرع من Math.sqrt)
      
      if (distSq < maxDistSq) {
        // حساب شفافية اللون بناءً على المسافة الفعلية
        let dist = Math.sqrt(distSq); 
        ctx.strokeStyle = 'rgba(255,255,255,' + (1 - dist / 100) + ')'; 
        
        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
      }
    }
  }
  ctx.stroke(); // رسم جميع الخطوط دفعة واحدة
}

// حلقة الرسوم المتحركة الرئيسية
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particlesArray.forEach(p => { p.update(); p.draw(); });
  connectParticles();
  animationId = requestAnimationFrame(animate);
}

// التهيئة الأولية
setCanvasSize();
animate();

// معالجة تغيير الحجم (Resize)
window.addEventListener('resize', setCanvasSize);

// وقف الأنميشن عند الانتقال لتبويب آخر للحفاظ على موارد الجهاز
document.addEventListener('visibilitychange', () => {
  if (document.hidden) cancelAnimationFrame(animationId);
  else animate();
});
