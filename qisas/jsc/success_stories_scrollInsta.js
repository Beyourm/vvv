// jsc/success_stories_scrollInsta.js

// ======= 2. شريط قصص الإنستغرام (التمرير التلقائي البطيء والمستمر) =======
const instaStories = document.getElementById('instaStories');
const scrollDuration = 100;
const scrollStep = 1;      

function autoScrollInstaStories() {
    // التحقق من وجود العنصر قبل البدء
    if (!instaStories) return;
    
    let scrollInterval = setInterval(() => {
        // التمرير تدريجياً نحو اليسار (لبداية الـ RTL)
        instaStories.scrollLeft -= scrollStep;

        // عندما يصل إلى بداية الحاوية، ابدأ التمرير من جديد من اليمين
        if (instaStories.scrollLeft <= 0) {
            // إعادة التعيين لأقصى اليمين
            instaStories.scrollLeft = instaStories.scrollWidth - instaStories.clientWidth;
        }
    }, scrollDuration);

    // إيقاف التمرير التلقائي عند التحويم
    instaStories.addEventListener('mouseenter', () => clearInterval(scrollInterval));
    instaStories.addEventListener('mouseleave', () => scrollInterval = setInterval(() => {
        instaStories.scrollLeft -= scrollStep;
        if (instaStories.scrollLeft <= 0) {
            instaStories.scrollLeft = instaStories.scrollWidth - instaStories.clientWidth;
        }
    }, scrollDuration));
}

// البدء من أقصى اليمين ليتوافق مع RTL
window.addEventListener('load', () => {
    if (instaStories) {
        instaStories.scrollLeft = instaStories.scrollWidth - instaStories.clientWidth;
        autoScrollInstaStories();
    }
});
