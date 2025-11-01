// jsc/success_stories.js

// تحديد المتغيرات اللازمة لتشغيل العدادات
// ملاحظة: وظيفة startCounters() سيتم استدعاؤها من هذا الملف
// ولكن تعريفها سيكون في success_stories_counter.js


async function loadStats() {
    try {
        const res = await fetch("https://script.google.com/macros/s/AKfycby4Y63ZtVbQUrDcm5K3ZabeBW3MfhtQ6r2_Dmk9leRcXX6kbjchl00AY1T-tof5ZxExyQ/exec");
        const data = await res.json();

        const statsSection = document.getElementById("statsSection");
        statsSection.innerHTML = ""; // تفريغ القديم

        data.forEach(item => {
            const statBox = document.createElement("div");
            statBox.classList.add("stat-box");
            statBox.innerHTML = `
                <div class="number" data-target="${item.الرقم}">0</div>
                <div class="label">${item.الوصف}</div>
            `;
            statsSection.appendChild(statBox);
        });

        // بعد بناء العناصر، استدعاء العداد
        startCounters();
    } catch (error) {
        console.error("حدث خطأ أثناء جلب البيانات:", error);
    }
}
const animatedElements = document.querySelectorAll('.animated-section');

// ======= 1. تأثير الظهور التدريجي (Intersection Observer) =======
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            
            // استدعاء عداد الأرقام فقط عندما يظهر قسم الإحصائيات
            if (entry.target.id === 'statsSection' && typeof startCounters === 'function') {
                startCounters();
            }
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1
});

animatedElements.forEach(element => {
    observer.observe(element);
});
