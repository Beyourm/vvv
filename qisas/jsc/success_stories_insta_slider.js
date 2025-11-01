/**
 * دالة: setupInstaStoriesSlider
 * تُعنى بتفعيل خاصية التمرير الأفقي (الـ Scroll) لشريط قصص إنستغرام.
 */
function setupInstaStoriesSlider() {
    // 1. جلب عنصر الشريط باستخدام الـ ID
    const slider = document.getElementById('instaStories');

    // 2. التحقق من وجود العنصر
    if (slider) {
        // 3. إضافة معالج حدث التمرير للماوس (لتمكين التمرير الأفقي بعجلة الماوس)
        slider.addEventListener('wheel', (e) => {
            // منع التمرير العمودي الافتراضي للصفحة
            e.preventDefault(); 
            // تمرير أفقي (لليمين أو اليسار) بناءً على حركة العجلة
            slider.scrollLeft += e.deltaY;
        });

        // 4. (إضافة اختيارية) لجعل التمرير أكثر سلاسة
        slider.style.scrollBehavior = 'smooth';
        
        console.log('شريط القصص التفاعلي تم تفعيله.'); // رسالة تأكيد لل debugging
    } else {
        console.error('لم يتم العثور على عنصر instaStories# لتفعيل شريط التمرير.');
    }
}

// 5. الاستدعاء: استدعاء الدالة لتبدأ العمل مباشرة
// (يفضل استخدام DOMContentLoaded لضمان تحميل العنصر، أو الاستدعاء المباشر إذا كان السكربت في نهاية <body>)
document.addEventListener('DOMContentLoaded', setupInstaStoriesSlider);
