// JS_T/peer-review.js - الكود النهائي لآراء الزملاء (باستخدام JSONP)

// **الرجاء التأكد أن هذا هو الرابط الحديث والفعال من Google Apps Script**
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxjfdUFp9XUaW3p8Zq_8cvspTlQjY0MEivCIo-Onotem2WWT7Vj5y0xfPd43SFhqQni/exec'; 

/**
 * دالة مساعدة لتوليد رسالة الخطأ بشكل موحد داخل HTML
 */
function getErrorMessage(detail) {
    return `
        <div style="text-align: center; padding: 30px; background-color: #ffe6e6; border: 2px solid #ff4d4d; color: #cc0000; border-radius: 10px; margin: 40px auto; max-width: 80%; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <p style="font-weight: bold; font-size: 1.2em; margin-bottom: 10px;">⚠️ فشل جلب الآراء (مشكلة الاتصال)</p>
            <p>هذا يعني أن محاولة جلب البيانات من رابط جوجل قد فشلت.</p>
            <p style="font-weight: bold; margin-top: 15px;">الخطأ الفني:</p>
            <p>${detail}</p>
        </div>
    `;
}

/**
 * دالة لجلب البيانات من Google Apps Script باستخدام JSONP لتجاوز CORS.
 */
async function fetchReviewsFromSheet() {
    return new Promise((resolve, reject) => {
        // نُنشئ اسماً فريداً لدالة رد النداء لتفادي التضارب
        const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
        
        // 1. تحديد دالة رد النداء (Callback) في النطاق العام (window)
        window[callbackName] = (data) => {
            // تنفيذ عند استلام البيانات
            delete window[callbackName]; // تنظيف الدالة بعد الاستخدام
            script.remove();             // تنظيف عنصر <script>
            resolve(data);               // حل الـ Promise بالبيانات المستلمة
        };
        
        // 2. إنشاء عنصر <script> لبدء طلب JSONP
        const script = document.createElement('script');
        
        // نضيف query parameter 'callback' إلى رابط Google Apps Script
        const urlWithCallback = APPS_SCRIPT_URL + '?callback=' + callbackName;
        script.src = urlWithCallback;
        
        // 3. إضافة السكربت إلى DOM لتنفيذ الطلب
        document.head.appendChild(script);
        
        // 4. معالجة فشل الاتصال (Timeout أو خطأ تحميل)
        script.onerror = () => {
             delete window[callbackName];
             script.remove();
             resolve({ 
                error: true, 
                html: getErrorMessage("فشل جلب البيانات (Script Load Error). تأكد من أن Google Apps Script مُعد للنشر على 'Anyone'.") 
            });
        };
    });
}

/**
 * دالة لتوليد كروت المراجعات من البيانات
 */
function generateReviewCardsHTML(reviews) {
    if (reviews.error) {
        return reviews.html;
    }
    
    // تأكد أن البيانات ليست مصفوفة فارغة
    const approvedReviews = Array.isArray(reviews) ? reviews.filter(review => review.Status === 'Approved') : [];

    if (approvedReviews.length === 0) {
        return `<p style="text-align: center; color: #888; padding: 40px; font-size: 1.1em;">عفواً، لا توجد آراء معتمدة للعرض حالياً.</p>`;
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


/**
 * دالة إعداد التمرير التلقائي (Carousel Logic)
 */
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

    autoScrollTimer = setTimeout(scrollNext, intervalTime);
}

/**
 * الدالة الرئيسية لتحميل وتهيئة القسم
 * **مُعرفة هنا، ومُستدعاة من script.js.**
 */
async function loadPeerReviewSection() {
    const placeholder = document.getElementById('trainers-sl'); // الحاوية الجديدة
    if (!placeholder) return;
    
    // نجلب البيانات باستخدام JSONP
    const peerReviewsData = await fetchReviewsFromSheet();
    const reviewCardsHTML = generateReviewCardsHTML(peerReviewsData);
    
    // إذا كانت هناك رسالة خطأ، نعرضها
    if (peerReviewsData.error) {
         placeholder.innerHTML = reviewCardsHTML;
         return;
    }

    const peerReviewSectionHTML = `
        <section class="peer-review-section animated-section" id="peerReviewSection">
            <h2>ماذا يقول قادة القطاع عن خبرائنا؟</h2>
            <div class="peer-review-cards" id="peerReviewCards">
                ${reviewCardsHTML}
            </div>
        </section>
    `;

    placeholder.innerHTML = peerReviewSectionHTML;

    // تهيئة التمرير التلقائي
    const container = document.getElementById('peerReviewCards');
    if (container) {
        setupAutoScroll(container);
    }
}

// **السطر الحاسم:** ربط الدالة بالـ Window لضمان إمكانية الوصول من ملف script.js
window.loadPeerReviewSection = loadPeerReviewSection; 
