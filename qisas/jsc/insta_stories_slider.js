document.addEventListener('DOMContentLoaded', () => {

    // 1. الثوابت (Constants)
    const CONFIG = {
        SLIDER_ID: 'instaStories',
        SHEET_API_URL: "https://script.google.com/macros/s/AKfycbx1f9kyjuZ8Kn4di_LiQRyIJZo9soIwyWsjBUTD06jjWi1pVKSUUezy6ArYZHX4cNIidw/exec",
        // سرعة التمرير (قيمة تجريبية، يمكن تعديلها)
        AUTO_SCROLL_SPEED: 20, 
        STORY_CLASS: 'story-item',
        // يبقى 'ltr' لأننا نعتمد على سلوك الـ scrollLeft الافتراضي للـ DOM
        DIRECTION: 'ltr' 
    };

    const slider = document.getElementById(CONFIG.SLIDER_ID);
    if (!slider) return;

    // --- 2. دالة جلب البيانات (Data Fetching) ---

    async function fetchStories(url) {
        try {
            const resp = await fetch(url);
            if (!resp.ok) {
                throw new Error(`فشل جلب البيانات. حالة HTTP: ${resp.status}`);
            }
            const data = await resp.json();
            return Array.isArray(data) ? data : [];
        } catch (err) {
            console.error("خطأ حرج أثناء جلب البيانات:", err);
            return [];
        }
    }

    // --- 3. دوال إنشاء وعرض واجهة المستخدم (UI Rendering) ---

    function createStoryElement(story, storyClass) {
        const storyLink = document.createElement('a');
        storyLink.href = '#!';
        storyLink.classList.add(storyClass);

            const storyImage = document.createElement('img');
    storyImage.src = story.image;
    storyImage.loading = 'lazy';
    storyImage.alt = ""; // ← هنا التعديل

        const storyName = document.createElement('span');
        storyName.textContent = story.name;

        storyLink.append(storyImage, storyName); 
        return storyLink;
    }

    function renderStories(slider, storiesData, storyClass, direction) {
        slider.innerHTML = '';
        slider.style.direction = direction; // 'ltr'

        const fragment = document.createDocumentFragment();

        storiesData.forEach(story => {
            fragment.appendChild(createStoryElement(story, storyClass));
        });

        slider.appendChild(fragment);

        // تكرار المحتوى لضمان الحركة المستمرة
        const itemsHTML = slider.innerHTML;
        slider.innerHTML += itemsHTML;
    }

    // --- 4. دالة التمرير التلقائي (Auto-Scrolling) المعدلة ---

    /**
     * يبدأ التمرير التلقائي اللانهائي من اليمين لليسار.
     */
    function startInfiniteScroll(slider, speed) {
        // عرض التمرير الأقصى هو نصف عرض المحتوى الإجمالي (بعد التكرار).
        const maxScrollWidth = slider.scrollWidth / 2;
        
        // **التعديل 1:** البدء من نقطة الصفر (أقصى اليسار)
        slider.scrollLeft = 0;

        let previousTimestamp;

        function smoothScroll(currentTimestamp) {
            // حساب الوقت المنقضي (Delta Time)
            if (!previousTimestamp) previousTimestamp = currentTimestamp;
            const elapsed = currentTimestamp - previousTimestamp;
            previousTimestamp = currentTimestamp;
            
            const distance = speed * elapsed * 0.01;

            // **التعديل 2:** التحريك نحو اليمين (باتجاه maxScrollWidth)
            slider.scrollLeft += distance;

            // **التعديل 3:** إعادة التعيين عندما يصل المؤشر إلى منتصف العناصر
            if (slider.scrollLeft >= maxScrollWidth) {
                slider.scrollLeft = 0;
            }

            requestAnimationFrame(smoothScroll);
        }

        requestAnimationFrame(smoothScroll);
    }

    // --- 5. دالة التهيئة الرئيسية (Initialization) ---

    async function initStories() {
        const storiesData = await fetchStories(CONFIG.SHEET_API_URL);

        if (storiesData.length === 0) return;

        // 1. عرض العناصر
        renderStories(slider, storiesData, CONFIG.STORY_CLASS, CONFIG.DIRECTION);

        // 2. بدء الحركة
        startInfiniteScroll(slider, CONFIG.AUTO_SCROLL_SPEED);
    }

    initStories();
});
