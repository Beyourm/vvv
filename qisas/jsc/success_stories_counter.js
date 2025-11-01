// js/success_stories_counter.js

// ======= وظيفة العدادات =======
function startCounters() {
    const counters = document.querySelectorAll(".number");

    counters.forEach(counter => {
        const target = +counter.getAttribute("data-target");
        let current = 0;
        const increment = Math.ceil(target / 100); // تقسيم الرقم على 100 خطوة تقريباً

        const updateCounter = () => {
            if (current < target) {
                current += increment;
                if (current > target) current = target; // منع تجاوز الرقم النهائي
                counter.textContent = current;
                requestAnimationFrame(updateCounter); // تحديث انسيابي
            } else {
                counter.textContent = target; // تثبيت الرقم النهائي
            }
        };

        updateCounter();
    });
}