document.addEventListener('DOMContentLoaded', function() {
    // الإعدادات من slider-config.js متاحة هنا: sliderSettings

    const sliderWrapper = document.querySelector('.slider-wrapper');
    const slidesContainer = sliderWrapper.querySelector('.slides-container');
    const dotsContainer = sliderWrapper.querySelector('.dots');
    const prevButton = sliderWrapper.querySelector('.prev');
    const nextButton = sliderWrapper.querySelector('.next');

    const url = sliderWrapper.dataset.apiUrl; // الرابط الديناميكي لكل صفحة
    
    let currentSlide = 0;
    let slides = [];
    let dots = [];
    let autoSlideInterval;

    // باقي الكود كما هو بدون تغيير...
    async function fetchAndRenderSlides() {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json(); 

            slidesContainer.innerHTML = '';
            dotsContainer.innerHTML = '';

            data.forEach((item, index) => {
                const slide = document.createElement('div');
                slide.classList.add('slide');
                if (index === 0) slide.classList.add('active');
                slide.style.transitionDuration = `${sliderSettings.transitionDuration}ms`;
                slide.innerHTML = `
                    <img src="${item.imageUrl}" alt="">
                    <h2>${item.title}</h2>
                    <p>${item.description}</p>
                `;
                slidesContainer.appendChild(slide);

                const dot = document.createElement('span');
                dot.classList.add('dot');
                if (index === 0) dot.classList.add('active');
                dot.dataset.slideIndex = index;
                dotsContainer.appendChild(dot);
            });

            slides = sliderWrapper.querySelectorAll('.slide');
            dots = sliderWrapper.querySelectorAll('.dot');
            
            initializeSlider(); 
        } catch (error) {
            console.error('Error fetching or rendering slides:', error);
            slidesContainer.innerHTML = '<p style="text-align: center;">تعذر تحميل الشرائح. يرجى المحاولة لاحقًا.</p>';
        }
    }

    // باقي الدوال showSlide, updateDotsVisibility, startAutoSlide, stopAutoSlide, initializeSlider
    // كما في كودك الحالي بدون تغيير.



    // 2. تطبيق منطق عرض النقاط (استخدام maxDots)
    function updateDotsVisibility() {
        if (dots.length <= sliderSettings.maxDots) {
            // إذا كان العدد الإجمالي أقل من الحد الأقصى، يتم عرضها كلها
            dots.forEach(dot => dot.style.display = 'inline-block');
            dotsContainer.style.justifyContent = 'center';
            return;
        }

        const maxVisible = sliderSettings.maxDots;
        const halfMax = Math.floor(maxVisible / 2);
        
        // إخفاء جميع النقاط أولاً
        dots.forEach(dot => dot.style.display = 'none');
        
        let start, end;
        
        // حساب نافذة العرض
        if (currentSlide <= halfMax) {
            // في البداية: عرض من 0 حتى maxVisible-1
            start = 0;
            end = maxVisible - 1;
        } else if (currentSlide >= dots.length - halfMax) {
            // في النهاية: عرض آخر maxVisible من النقاط
            start = dots.length - maxVisible;
            end = dots.length - 1;
        } else {
            // في المنتصف: عرض maxDots حول currentSlide
            start = currentSlide - halfMax;
            end = currentSlide + (maxVisible - 1 - halfMax);
        }
        
        // عرض النقاط داخل النافذة المحسوبة
        for (let i = start; i <= end; i++) {
            if (dots[i]) {
                dots[i].style.display = 'inline-block';
            }
        }
        
        // إضافة مؤشر "المزيد" إذا لزم الأمر
        // (هذا مثال بسيط، ويمكن تحسينه بإضافة نقاط ellipsis "...")
        dotsContainer.style.justifyContent = 'flex-start'; 
    }


    // 3. منطق إظهار الشريحة
    function showSlide(index) {
        if (slides.length === 0) return;

        // إزالة "active" من الشريحة والنقطة الحالية
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');

        // حساب الشريحة الجديدة
        currentSlide = (index + slides.length) % slides.length;

        // إضافة "active" للشريحة والنقطة الجديدة
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
        
        // تحديث النقاط المرئية (التي تعتمد على maxDots)
        updateDotsVisibility(); 
    }


    // 4. وظيفة التبديل التلقائي
    function startAutoSlide() {
        stopAutoSlide(); 
        
        // استخدام إعداد autoSlide و autoSlideDelay
        if (sliderSettings.autoSlide && slides.length > 1) {
            autoSlideInterval = setInterval(() => {
                showSlide(currentSlide + 1);
            }, sliderSettings.autoSlideDelay);
        }
    }

    // وظيفة إيقاف التبديل التلقائي
    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }


    // 5. وظيفة التهيئة
    function initializeSlider() {
        if (slides.length === 0) return;

        // تهيئة عرض النقاط لأول مرة
        updateDotsVisibility(); 

        // --- التحكم اليدوي ---
        const handlers = () => {
            stopAutoSlide(); 
            startAutoSlide();
        };

        nextButton.addEventListener('click', () => {
            showSlide(currentSlide + 1);
            handlers();
        });

        prevButton.addEventListener('click', () => {
            showSlide(currentSlide - 1);
            handlers();
        });
        
        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.slideIndex);
                showSlide(index);
                handlers();
            });
        });

        // --- التبديل التلقائي ---
        startAutoSlide();
    }

    // بدء العملية
    fetchAndRenderSlides();
});
