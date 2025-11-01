// JS_T/trainers.js - الكود النهائي لبناء HTML فقط

const TRAINERS_API_URL = "https://script.google.com/macros/s/AKfycbyOPd5-3sxONOyr6sztrTpZTalP1Y3RiZI5dygELHN0_LYuVjU_QEPdgf7DEMaOlwXjrQ/exec";

// =====================================
// دوال قلب البطاقة والتحكم بالحدث
// =====================================

function flipCard(cardElement) {
    cardElement.classList.toggle('flipped'); // تم تغيير الكلاس إلى 'flipped' لتجنب التضارب
}

function stopPropagation(event) {
    event.stopPropagation();
}

/**
 * دالة مُساعدة لإنشاء كود HTML لبطاقة مدرب واحد.
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
 * دالة لجلب بيانات المدربين وبناء محتوى HTML لـ "السلايدر".
 * **ترجع الشرائح والأزرار فقط.**
 */
async function fetchAndGenerateTrainersHTML() {
    try {
        const response = await fetch(TRAINERS_API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const trainersData = await response.json();
        
        if (!Array.isArray(trainersData) || trainersData.length === 0) {
            return `<p style="text-align: center; color: #e74c3c; margin: 50px;">عفواً، لم يتم العثور على بيانات المدربين.</p>`;
        }
        
        // 1. توليد كود HTML للشرائح
        const slidesHTML = trainersData.map((trainer, index) => {
            const cardHTML = createTrainerCardHTML(trainer);
            const activeClass = index === 0 ? ' active' : '';
            
            // يجب أن يكون كل مدرب شريحة سلايدر منفصلة
            return `<div class="trainer-slide${activeClass}">${cardHTML}</div>`;
        }).join('');
        
        // 2. توليد أزرار التحكم
        const controlsHTML = `
            <div class="trainer-slider-controls">
                <button title="السابق" id="sliderPrev">&#8592;</button>
                <button title="التالي" id="sliderNext">&#8594;</button>
            </div>
        `;

        // 3. إرجاع الشرائح والأزرار (هذا هو محتوى trainers-slider)
        return slidesHTML + controlsHTML;
        
    } catch (error) {
        console.error("Error fetching trainers data:", error);
        return `<p style="text-align: center; color: #e74c3c; margin: 50px;">فشل في تحميل بيانات المدربين.</p>`;
    }
}

/**
 * دالة ربط الحدث بعد إنشاء البطاقات.
 * **مُعرفة هنا، ومُستدعاة من script.js.**
 */
function applyFlipListeners() {
    const cards = document.querySelectorAll('.trainer-card');
    
    cards.forEach(card => {
        // 1. ربط حدث قلب البطاقة بكامل البطاقة
        card.addEventListener('click', function(e) {
            // التحقق من أن النقر لم يتم على زر الملف الشخصي (لتجنب التضارب)
            if (e.target.closest('.profile-button')) {
                return; 
            }
            flipCard(this); // قلب البطاقة
        });

        // 2. ربط حدث stopPropagation لزر الملف الشخصي
        const profileButton = card.querySelector('.profile-button');
        if (profileButton) {
            profileButton.addEventListener('click', function(e) {
                // إيقاف انتشار الحدث للأعلى (للبطاقة) لمنع قلبها
                stopPropagation(e);
            });
        }
    });
}
