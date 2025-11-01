// جافاسكربت الخاص بشريط قصص النجاح المتنقل (Carousel)

document.addEventListener('DOMContentLoaded', () => {
    const carouselContainer = document.getElementById('storiesCarousel');

    // رابط الـ API من Apps Script
    const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbxIGmEa4bBQJRmwNjGArE3w94bD7bX0wkOQF6YI7TMq2DWeggmSeEEv8cA5NQGdKTG0Iw/exec";

    // دالة لجلب البيانات من الشيت
    async function fetchStories() {
        try {
            const resp = await fetch(SHEET_API_URL);
            if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
            const text = await resp.text();  // Apps Script يرجع HTML
            return JSON.parse(text);
        } catch (err) {
            console.error("خطأ أثناء جلب البيانات:", err);
            return [];
        }
    }

    // دالة تهيئة الكاروسيل
    async function initCarousel() {
        const successStoriesData = await fetchStories();

        if (carouselContainer && successStoriesData.length > 0) {
            // إنشاء العناصر ديناميكياً
            carouselContainer.innerHTML = ''; 
            
            successStoriesData.forEach((story, index) => {
                // إنشاء div.story-slide
                const slide = document.createElement('div');
                slide.classList.add('story-slide');
                if (index === 0) {
                    slide.classList.add('active'); // تفعيل الشريحة الأولى
                }

                // إنشاء article.story-card
                const card = document.createElement('article');
                card.classList.add('story-card');
                card.innerHTML = `
                    <img src="${story.image}" alt="" >
                    <div class="name">${story.name}</div>
                    <div class="field">${story.field}</div>
                    <p class="quote">${story.quote}</p>
                `;

                slide.appendChild(card);
                carouselContainer.appendChild(slide);
            });

            // ============ منطق التحكم بالكاروسيل ============
            const slides = carouselContainer.querySelectorAll('.story-slide');
            let currentIndex = 0;
            const totalSlides = slides.length;
            let autoSlideInterval;
            const mainSlideDuration = 5000; // 5 ثواني

            function updateCarousel() {
                slides.forEach((slide, index) => {
                    slide.classList.toggle('active', index === currentIndex);
                });
            }

            function moveSlide(direction) {
                currentIndex += direction;
                if (currentIndex >= totalSlides) {
                    currentIndex = 0;
                } else if (currentIndex < 0) {
                    currentIndex = totalSlides - 1;
                }
                updateCarousel();
            }

            function startAutoSlide() {
                clearInterval(autoSlideInterval); 
                autoSlideInterval = setInterval(() => moveSlide(1), mainSlideDuration);
            }

            // بدء الكاروسيل
            updateCarousel();
            startAutoSlide();
        } else {
            console.warn("⚠️ لا توجد بيانات في الشيت أو لم يتم العثور على الحاوية.");
        }
    }

    initCarousel();
});