
// ====================================================================================
// ============بداية قسم JS (شريط الشعارات - Logos Slider) =========
// ====================================================================================
const LOGOS_API_URL = "https://script.google.com/macros/s/AKfycbx-rVphRUdWnrQ5jmKbFTmqLrwB2Dw1RSrCQzadP9vfZfA4tubN5sk0E_8RetHDfejA/exec"; 

async function fetchAndRenderLogosSlider() {
    const placeholder = document.querySelector('.logos-slider'); // البحث عن الكلاس (logos-slider)
    if (!placeholder) return;

    placeholder.innerHTML = `<p style="text-align:center;">جاري تحميل الشعارات...</p>`;

    try {
        const response = await fetch(LOGOS_API_URL);
        if (!response.ok) throw new Error("فشل في جلب بيانات الشعارات.");
        const logosData = await response.json();

        if (!Array.isArray(logosData) || logosData.length === 0) {
            placeholder.innerHTML = `<p style="text-align:center;">عفواً، لم يتم العثور على بيانات الشعارات.</p>`;
            return;
        }

        const slide = document.createElement('div');
        slide.className = 'logos-slide';

        // تكرار الشعارات مرتين للتمرير اللانهائي
        const repeatedData = [...logosData, ...logosData];

        repeatedData.forEach(logo => {
            const img = document.createElement('img');
            img.src = logo.ImageURL;
            img.alt = logo.Title || '';
            img.title = logo.Title || '';
            img.loading = "lazy";
            slide.appendChild(img);
        });

        placeholder.innerHTML = '';
        placeholder.appendChild(slide);
        
    } catch (error) {
        console.error("Error loading logos slider:", error);
        placeholder.innerHTML = `<p style="text-align:center; color:#e74c3c;">
            فشل في تحميل الشعارات. <button onclick="fetchAndRenderLogosSlider()">إعادة المحاولة</button>
        </p>`;
    }
}
// ©©©©©©©©©©©©©©©©©©©©©©©©©©©©©©©


// ====================================================================================
// ============بداية قسم JS (الفلترة - Filter Logic & HTML) =========
// ====================================================================================

/**
 * محتوى قسم أدوات التصفية.
 */
const filterSectionHTML = `
    <section class="filter-section animated-section" id="filterSection">
        <input type="text" id="searchInput" placeholder="ابحث بالاسم أو التخصص..." aria-label="البحث عن المدربين">
        <select id="specialtyFilter" aria-label="تصفية حسب التخصص">
            <option value="">كل التخصصات</option>
            <option value="القيادة">القيادة الإدارية</option>
            <option value="الرقمي">التحول الرقمي</option>
            <option value="البرمجة">البرمجة والتطوير</option>
        </select>
        <select id="experienceFilter" aria-label="تصفية حسب سنوات الخبرة">
            <option value="">كل الخبرات</option>
            <option value="10">خبرة أكثر من 10 سنوات</option>
            <option value="5">خبرة أكثر من 5 سنوات</option>
        </select>
        <button onclick="applyFilters()"><i class="fas fa-filter"></i> تصفية</button>
    </section>
    `;
// ©©©©©©©©©©©©©©©©©©©©©©©©©©©©©©©


// ====================================================================================
// ============بداية قسم JS (المدربين - Trainers Slider Logic) =========
// ====================================================================================

const TRAINERS_API_URL = "https://script.google.com/macros/s/AKfycbyOPd5-3sxONOyr6sztrTpZTalP1Y3RiZI5dygELHN0_LYuVjU_QEPdgf7DEMaOlwXjrQ/exec";

// دوال قلب البطاقة والتحكم بالحدث (كما هي)
function flipCard(cardElement) {
    cardElement.classList.toggle('flipped');
}

function stopPropagation(event) {
    event.stopPropagation();
}

/**
 * دالة مُساعدة لإنشاء كود HTML لبطاقة مدرب واحد. (كما هي)
 */
function createTrainerCardHTML(trainer) {
    const tagsHTML = trainer.Tags.split(',').map(tag => 
        `<span>${tag.trim()}</span>`
    ).join('');

    const specialtyClass = trainer.Specialty.trim(); 
    const experienceYears = parseInt(trainer.Experience, 10) || 0;
    const progressPercent = parseInt(trainer.Progress, 10) || 75;

    return `
        <div class="trainer-card" 
             data-specialty="${specialtyClass}" 
             data-experience="${experienceYears}"> 
            <div class="trainer-inner">
                <div class="trainer-front">
                    <img src="${trainer.ImageURL || 'images/default.jpg'}" alt="">
                    <h3>${trainer.Name}</h3>
                    <p>${trainer.Title}</p>
                    <i class="fas fa-angle-left" style="position: absolute; left: 20px; bottom: 20px; font-size: 24px; color: var(--accent-color);"></i>
                </div>
                <div class="trainer-back">
                    <div class="quote">"${trainer.Quote}"</div>
                    <div class="progress-bar-container">
                        <div class="progress-bar-label">الخبرة في التدريب: <span class="progress-bar-value" data-target-value="${experienceYears}">0</span> عام</div>
                        <div class="progress-bar"><div class="progress-fill" data-progress="${progressPercent}"></div></div>
                    </div>
                    <div class="tags">${tagsHTML}</div>
                    <a href="${trainer.ProfileURL || '#'}" class="profile-button">الملف الشخصي الكامل <i class="fas fa-chevron-left"></i></a>
                </div>
            </div>
        </div>
    `;
}

/**
 * دالة لجلب بيانات المدربين وبناء محتوى HTML لـ "السلايدر". (كما هي)
 */
async function fetchAndGenerateTrainersHTML() {
    try {
        const response = await fetch(TRAINERS_API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const trainersData = await response.json();
        
        if (!Array.isArray(trainersData) || trainersData.length === 0) {
            return `<p style="text-align: center; color: #e74c3c; margin: 50px;">عفواً، لم يتم العثور على بيانات المدربين.</p>`;
        }
        
        const slidesHTML = trainersData.map((trainer, index) => {
            const cardHTML = createTrainerCardHTML(trainer);
            const activeClass = index === 0 ? ' active' : '';
            return `<div class="trainer-slide${activeClass}">${cardHTML}</div>`;
        }).join('');
        
        const controlsHTML = `
            <div class="trainer-slider-controls">
                <button title="السابق" id="sliderPrev">&#8592;</button>
                <button title="التالي" id="sliderNext">&#8594;</button>
            </div>
        `;

        return slidesHTML + controlsHTML;
        
    } catch (error) {
        console.error("Error fetching trainers data:", error);
        return `<p style="text-align: center; color: #e74c3c; margin: 50px;">فشل في تحميل بيانات المدربين.</p>`;
    }
}

/**
 * دالة ربط الحدث بعد إنشاء البطاقات. (كما هي)
 */
function applyFlipListeners() {
    const cards = document.querySelectorAll('.trainer-card');
    
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.profile-button')) {
                return; 
            }
            flipCard(this);
        });

        const profileButton = card.querySelector('.profile-button');
        if (profileButton) {
            profileButton.addEventListener('click', function(e) {
                stopPropagation(e);
            });
        }
    });
}
// ©©©©©©©©©©©©©©©©©©©©©©©©©©©©©©©


// ====================================================================================
// ============بداية قسم JS (آراء الزملاء - Peer Review JSONP) =========
// ====================================================================================

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxjfdUFp9XUaW3p8Zq_8cvspTlQjY0MEivCIo-Onotem2WWT7Vj5y0xfPd43SFhqQni/exec'; 

// دالة getErrorMessage (تم تعديلها لتكون أكثر وضوحاً)
function getErrorMessage(detail) {
    return `
        <div class="review-message error">
            <p style="font-weight: bold; font-size: 1.1em; margin-bottom: 5px;">⚠️ فشل جلب الآراء</p>
            <p>حدث خطأ في الاتصال بالسيرفر. تأكد من أن رابط Google Apps Script صحيح ومضبوط على (Anyone).</p>
            <p style="font-size: 0.9em; margin-top: 10px;">التفاصيل: ${detail}</p>
        </div>
    `;
}

// دالة fetchReviewsFromSheet (JSONP) 
async function fetchReviewsFromSheet() {
    return new Promise((resolve, reject) => {
        const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
        
        window[callbackName] = (data) => {
            delete window[callbackName];
            script.remove();
            // تصحيح: التحقق من وجود 'data' قبل resolve
            resolve(data || { error: true, html: getErrorMessage("تم استدعاء الـ Callback لكن البيانات فارغة.") });
        };
        
        const script = document.createElement('script');
        const urlWithCallback = APPS_SCRIPT_URL + '?callback=' + callbackName;
        script.src = urlWithCallback;
        
        document.head.appendChild(script);
        
        // **تصحيح حاسم:** تحسين معالجة فشل التحميل
        script.onerror = () => {
             delete window[callbackName];
             script.remove();
             resolve({ 
                error: true, 
                html: getErrorMessage("فشل تحميل (Script Load Error).") 
            });
        };
        
        // إضافة مؤقت للـ Timeout في حال لم يستجب السيرفر
        setTimeout(() => {
            if (window[callbackName]) {
                 delete window[callbackName];
                 script.remove();
                 resolve({ 
                    error: true, 
                    html: getErrorMessage("انتهى وقت الانتظار (Timeout).") 
                 });
            }
        }, 15000); // 15 ثانية كمهلة
    });
}

// دالة generateReviewCardsHTML (تم تعديلها للرسالة عند الفراغ)
function generateReviewCardsHTML(reviews) {
    if (reviews.error) {
        return reviews.html;
    }
    
    const approvedReviews = Array.isArray(reviews) ? reviews.filter(review => review.Status === 'Approved') : [];

    if (approvedReviews.length === 0) {
        return `<div class="review-message">عفواً، لا توجد آراء معتمدة للعرض حالياً في ورقة العمل.</div>`;
    }
    
    return approvedReviews.map(review => {
        const quoteText = review.Quote || 'لا يوجد رأي';
        const authorText = review.Author || 'غير محدد';
        return `
            <div class="review-card">
                <p>"${quoteText}"</p> 
                <span class="author">${authorText}</span>
            </div>
        `;
    }).join('');
}

// دالة setupAutoScroll (كما هي)
function setupAutoScroll(container) {
    const cards = container.querySelectorAll('.review-card');
    const totalCards = cards.length;
    if (totalCards < 2) return; 
    
    let currentCardIndex = 0;
    const intervalTime = 5000; 
    const pauseTimeOnInteraction = 10000; 
    let autoScrollTimer;

    const scrollNext = () => {
        currentCardIndex = (currentCardIndex + 1) % totalCards; 
        // حساب الإزاحة الصحيحة
        const targetScrollLeft = cards[currentCardIndex].offsetLeft - container.offsetLeft;
        container.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
        autoScrollTimer = setTimeout(scrollNext, intervalTime);
    };

    const pauseScroll = () => clearTimeout(autoScrollTimer);
    const resumeScroll = () => {
        pauseScroll(); 
        autoScrollTimer = setTimeout(scrollNext, intervalTime);
    };

    container.addEventListener('mouseenter', pauseScroll);
    container.addEventListener('mouseleave', resumeScroll);
    
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        container.scrollLeft += e.deltaY; 
        pauseScroll();
        setTimeout(resumeScroll, pauseTimeOnInteraction); 
    });

    // بدء السكرول التلقائي لأول مرة
    autoScrollTimer = setTimeout(scrollNext, intervalTime);
}

/**
 * الدالة الرئيسية لتحميل وتهيئة القسم. (تم تعديلها لدمج المحتوى بشكل أفضل)
 */
async function loadPeerReviewSection() {
    const sectionContainer = document.getElementById('peerReviewSection');
    const initialMessage = document.getElementById('reviewInitialMessage');

    if (!sectionContainer || !initialMessage) return;
    
    const peerReviewsData = await fetchReviewsFromSheet();
    const reviewCardsHTML = generateReviewCardsHTML(peerReviewsData);
    
    if (peerReviewsData.error || !Array.isArray(peerReviewsData) || peerReviewsData.filter(r => r.Status === 'Approved').length === 0) {
        // في حالة الخطأ أو الفراغ، استبدل رسالة التحميل برسالة الخطأ/الفراغ
        sectionContainer.innerHTML = `
            <h2>ماذا يقول قادة القطاع عن خبرائنا؟</h2>
            ${reviewCardsHTML}
        `;
        return;
    }
    
    // في حالة النجاح، أظهر البطاقات وأزل رسالة التحميل
    const finalHTML = `
        <h2>ماذا يقول قادة القطاع عن خبرائنا؟</h2>
        <div class="peer-review-cards" id="peerReviewCards">
            ${reviewCardsHTML}
        </div>
    `;

    sectionContainer.innerHTML = finalHTML;

    const container = document.getElementById('peerReviewCards');
    if (container) {
        setupAutoScroll(container);
    }
}
// ©©©©©©©©©©©©©©©©©©©©©©©©©©©©©©©


// ====================================================================================
// ============بداية قسم JS (منطق التحكم الرئيسي - Main Logic) =========
// ====================================================================================

// دالة progress (كما هي)
function startProgressAnimation() {
    const progressFills = document.querySelectorAll('.progress-fill');
    
    progressFills.forEach(fill => {
        if(fill.closest('.trainer-slide.active')) { 
            const progressValue = parseInt(fill.getAttribute('data-progress'));
            fill.style.width = progressValue + '%'; 
            
            const targetValueElement = fill.closest('.progress-bar-container')?.querySelector('.progress-bar-value');
            if (targetValueElement) {
                const targetValue = parseInt(targetValueElement.getAttribute('data-target-value'));
                let startTimestamp = null;
                const duration = 1000; 
                
                function step(timestamp) {
                    if (!startTimestamp) startTimestamp = timestamp;
                    const progress = timestamp - startTimestamp;
                    const percentage = Math.min(progress / duration, 1);
                    const value = Math.floor(percentage * targetValue);
                    
                    targetValueElement.textContent = value;

                    if (percentage < 1) {
                        window.requestAnimationFrame(step);
                    } else {
                        targetValueElement.textContent = targetValue;
                    }
                }
                window.requestAnimationFrame(step);
            }
        }
    });
}

// منطق السلايدر (كما هو)
let currentSlide = 0;
let slideInterval;
const SLIDE_DURATION = 5000; 

function getSlides() {
    const sliderContainer = document.getElementById('trainers-slider');
    if (!sliderContainer) return [];
    return sliderContainer.querySelectorAll('.trainer-slide'); 
}

function showSlide(index) {
    const slides = getSlides();
    if (slides.length === 0) return;

    if (index >= slides.length) {
        index = 0; 
    } else if (index < 0) {
        index = slides.length - 1; 
    }
    currentSlide = index;
    
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
        if (slide.querySelector('.trainer-card')) {
            slide.querySelector('.trainer-card').classList.remove('flipped');
        }
    });
    
    startProgressAnimation(); 
}

function startTrainersSlider() {
    const slides = getSlides();
    if (slides.length < 2) return; 

    showSlide(currentSlide);
    
    clearInterval(slideInterval);
    slideInterval = setInterval(() => {
        showSlide(currentSlide + 1);
    }, SLIDE_DURATION);
    
    const prevButton = document.getElementById('sliderPrev');
    const nextButton = document.getElementById('sliderNext');
    
    if(prevButton) prevButton.onclick = () => { clearInterval(slideInterval); showSlide(currentSlide - 1); startTrainersSlider(); };
    if(nextButton) nextButton.onclick = () => { clearInterval(slideInterval); showSlide(currentSlide + 1); startTrainersSlider(); };

    const sliderContainer = document.getElementById('trainers-slider');
    if(sliderContainer) {
        sliderContainer.onmouseover = () => clearInterval(slideInterval);
        sliderContainer.onmouseout = startTrainersSlider;
    }
}

// منطق التصفية (كما هو)
function applyFilters() {
    const search = document.getElementById('searchInput')?.value.toLowerCase();
    const specialty = document.getElementById('specialtyFilter')?.value;
    const experience = parseInt(document.getElementById('experienceFilter')?.value);
    
    const slides = getSlides();

    let firstVisibleSlideIndex = -1;
    
    slides.forEach((slide, index) => {
        const card = slide.querySelector('.trainer-card');
        if (!card) return;
        
        const cardName = card.querySelector('h3').textContent.toLowerCase();
        const cardSpecialty = card.getAttribute('data-specialty');
        const cardExperience = parseInt(card.getAttribute('data-experience'));
        
        let isVisible = true;

        if (search && !cardName.includes(search) && !cardSpecialty.toLowerCase().includes(search)) {
            isVisible = false;
        }
        
        if (specialty && specialty !== cardSpecialty) {
            isVisible = false;
        }
        
        if (!isNaN(experience) && cardExperience < experience) {
            isVisible = false;
        }
        
        slide.style.display = isVisible ? 'block' : 'none';
        
        if (isVisible && firstVisibleSlideIndex === -1) {
             firstVisibleSlideIndex = index;
        } else if (!isVisible) {
            card.classList.remove('flipped');
        }
    });

    if (firstVisibleSlideIndex !== -1) {
        clearInterval(slideInterval);
        showSlide(firstVisibleSlideIndex);
        startTrainersSlider();
    }
}

function bindFilterEvents() {
    const searchInput = document.getElementById('searchInput');
    const specialtyFilter = document.getElementById('specialtyFilter');
    const experienceFilter = document.getElementById('experienceFilter');
    
    if(searchInput) searchInput.addEventListener('input', applyFilters);
    if(specialtyFilter) specialtyFilter.addEventListener('change', applyFilters);
    if(experienceFilter) experienceFilter.addEventListener('change', applyFilters);
}

// منطق Intersection Observer (كما هو)
function setupIntersectionObserver() {
    const animatedElements = document.querySelectorAll('.animated-section');

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); 
            }
        });
    }, {
        threshold: 0.1 
    });

    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// ------------------------------------------------------------------------------------


// ====================================================================================
// --- دالة الإعداد الرئيسية (Main Initialization) - التوقيت والتنفيذ ---
// ====================================================================================

document.addEventListener('DOMContentLoaded', async () => { 
    
    // 1. تحميل شريط الشعارات
    await fetchAndRenderLogosSlider(); 
    
    // 2. تحميل قسم أدوات التصفية
    const filterPlaceholder = document.getElementById('filter-placeholder');
    if (filterPlaceholder && typeof filterSectionHTML !== 'undefined') {
        filterPlaceholder.innerHTML = filterSectionHTML;
        bindFilterEvents(); 
    }
    
    // 3. تحميل قسم المدربين (انتظار انتهاء جلب البيانات)
    const trainersPlaceholder = document.getElementById('trainers-slider'); 
    if (trainersPlaceholder && typeof fetchAndGenerateTrainersHTML === 'function') {
        try {
            const dynamicTrainersHTML = await fetchAndGenerateTrainersHTML();
            trainersPlaceholder.innerHTML = dynamicTrainersHTML;
        } catch (error) {
            // ... (التعامل مع الخطأ) ...
        }
    }

    // 4. تحميل قسم آراء الزملاء (استدعاء الدالة مباشرة)
    if (typeof loadPeerReviewSection === 'function') {
        // لا نحتاج لـ 'await' هنا لتجنب إيقاف تحميل باقي الصفحة
        loadPeerReviewSection(); 
    }
    
    // 5. ربط الأحداث وتشغيل السلايدر
    setTimeout(() => {
        if (typeof applyFlipListeners === 'function') {
            applyFlipListeners(); 
        }
        startTrainersSlider();
    }, 200); 
    
    // 6. تفعيل مراقب الظهور
    setupIntersectionObserver();
});

// ====================================================================================
// ©©©©©©©©©©©©©©©©©©©©©©©©©©©©©©©
        
    