// ====================================================================
//                 *** قوالب HTML المساعدة ***
// ====================================================================

// قالب المدرب
const instructorTemplate = (inst) => `
    <div class="instructor-card">
        <img src="${inst.photo || 'https://via.placeholder.com/150'}" alt="${inst.name}" onerror="this.onerror=null;this.src='https://via.placeholder.com/150/0d3b14/ffffff?text=لا+يوجد+صورة';">
        <h4>${inst.name}</h4>
        <p>${inst.role}</p>
    </div>
`;
// قالب آراء المتدربين
const testimonialTemplate = (t) => `
    <p class="testimonial-text">"${t.text}"</p>
    <p><strong>${t.name}</strong></p>
`;

// ====================================================================
//                 *** دوال معالجة البيانات المساعدة ***
// ====================================================================

/**
 * @function parseList
 * @description تقوم بتحويل حقل النص المفصول بـ | (Objectives/Axes/Achievements) إلى قائمة HTML.
 * يتم ربطها بـ window لكي تكون متاحة للاستدعاء من courses.html.
 */
window.parseList = function (elementId, data, iconClass) {
    const listElement = document.getElementById(elementId);
    if (!data || data.length === 0) {
        listElement.parentElement.style.display = 'none';
        return;
    }
    listElement.innerHTML = '';
    try {
        data.split('|').forEach(text => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="${iconClass}"></i> ${text.trim()}`;
            listElement.appendChild(li);
        });
    } catch(e) {
        listElement.parentElement.style.display = 'none';
    }
};

/**
 * @function setupSlider
 * @description يقوم بتهيئة عناصر السلايدر (الشرائح والنقاط) بناءً على بيانات الدورة.
 * يتم ربطها بـ window لكي تكون متاحة للاستدعاء من courses.html.
 */
window.setupSlider = function (sliderIdContainer, dotClass, dataKey) {
    const sliderContainer = document.getElementById(sliderIdContainer);
    // إذا لم يتم العثور على الحاوية، أو لم يتم تحميل كائن الدورة بعد، توقف.
    if (!sliderContainer || !window.course) return;

    const sliderDiv = sliderContainer.querySelector(`#${dataKey}-slider`);
    const dotsContainer = sliderContainer.querySelector(`.${dotClass}`);
    
    if (!window.course[dataKey] || window.course[dataKey].length === 0) {
        sliderContainer.parentElement.style.display = 'none';
        return;
    }
    
    let items = [];
    let template;
    
    if (dataKey === 'instructors') {
        template = instructorTemplate;
    } else if (dataKey === 'testimonials') {
        template = testimonialTemplate;
    } else {
        return; // حقل غير مدعوم
    }

    try {
        const rawData = typeof window.course[dataKey] === 'string' ? JSON.parse(window.course[dataKey]) : window.course[dataKey];
        
        if (Array.isArray(rawData)) {
             items = rawData;
        } else {
             sliderContainer.parentElement.style.display = 'none';
             return;
        }

    } catch (e) {
         sliderContainer.parentElement.style.display = 'none';
         return;
    }
    
    sliderDiv.innerHTML = '';
    dotsContainer.innerHTML = '';

    items.forEach((item, i) => {
        const slide = document.createElement('div');
        const slideClassName = dataKey.slice(0, -1) + '-slide'; 
        slide.className = slideClassName; 
        slide.innerHTML = template(item);
        sliderDiv.appendChild(slide);

        const dot = document.createElement('span');
        dot.className = 'dot';
        dot.dataset.slideIndex = i;
        dotsContainer.appendChild(dot);
    });
};


// ====================================================================
//                 *** دوال التحكم بالسلايدر ***
// ====================================================================

/**
 * @function initializeSlider
 * @description الدالة الأساسية لتشغيل أي سلايدر (مدربين أو آراء)
 */
function initializeSlider(containerId, slideClassName) {
    const slidesContainer = document.getElementById(containerId);
    if (!slidesContainer) return;

    // البحث عن الشرائح والنقاط
    const slides = slidesContainer.getElementsByClassName(slideClassName);
    const dots = slidesContainer.parentElement.querySelector('.slider-dots') ? slidesContainer.parentElement.querySelector('.slider-dots').getElementsByClassName('dot') : [];
    let slideIndex = 0;
    let autoSlideInterval;

    if (slides.length === 0) return;

    function showSlides(n) {
        if (n >= slides.length) { slideIndex = 0; }
        if (n < 0) { slideIndex = slides.length - 1; }

        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }
        for (let i = 0; i < dots.length; i++) {
            dots[i].className = dots[i].className.replace(" active", "");
        }
        
        // عرض الشريحة
        slides[slideIndex].style.display = "flex"; 
        if (dots[slideIndex]) {
            dots[slideIndex].className += " active";
        }
    }

    function plusSlides(n) {
        showSlides(slideIndex += n);
    }
    
    function currentSlide(n) {
        showSlides(slideIndex = n);
    }

    function startAutoSlide() {
        if (autoSlideInterval) clearInterval(autoSlideInterval); 
        autoSlideInterval = setInterval(() => {
            plusSlides(1);
        }, 5000); 
    }
    
    Array.from(dots).forEach(dot => {
        dot.addEventListener('click', (event) => {
            const index = parseInt(event.target.dataset.slideIndex);
            currentSlide(index);
        });
    });

    showSlides(slideIndex);
    startAutoSlide();
}

/**
 * @function startSliders
 * @description دالة عامة لتشغيل جميع السلايدرات.
 * يتم استدعاؤها من courses.html بعد جلب البيانات.
 */
window.startSliders = function() {
    // تمرير ID السلايدر الداخلي واسم كلاس الشريحة
    initializeSlider('instructors-slider', 'instructor-slide');
    initializeSlider('testimonials-slider', 'testimonial-slide');
};
