// main.js

document.addEventListener('DOMContentLoaded', () => {

    // **********************************************
    // 1. تهيئة المكتبات والرسوم المتحركة (AOS & Swiper)
    // **********************************************

    AOS.init({
        duration: 800, // تقليل المدة لـ 800ms لتحسين تجربة المستخدم
        easing: "ease-in-out",
        once: true
    });

    // تهيئة سلايدر الدورات (Courses Swiper)
    new Swiper(".mySwiper", {
        slidesPerView: 'auto',
        spaceBetween: 15, // زيادة المسافة بين البطاقات
        loop: true,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        breakpoints: {
            600: {
                slidesPerView: 2,
                spaceBetween: 20
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 30
            }
        }
    });

    // **********************************************
    // 2. إدارة القائمة الجانبية في الجوال (UX/Accessibility)
    // **********************************************

    const menuToggle = document.getElementById("menu-toggle");
    const mainNav = document.getElementById("main-nav");
    const body = document.body;

    // دالة فتح/إغلاق القائمة
    function toggleMenu() {
        const isMenuOpen = mainNav.classList.toggle("open");
        body.classList.toggle("menu-open", isMenuOpen);

        // تحديث أيقونة الزر
        const icon = menuToggle.querySelector('i');
        icon.classList.toggle('fa-bars', !isMenuOpen);
        icon.classList.toggle('fa-times', isMenuOpen);
        
        // تحديث سمات إمكانية الوصول
        menuToggle.setAttribute('aria-expanded', isMenuOpen);
    }

    menuToggle.addEventListener("click", toggleMenu);

    // إغلاق القائمة عند الضغط على رابط داخلها
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('open')) {
                toggleMenu();
            }
        });
    });

    // **********************************************
    // 3. إدارة شريط الإعلانات القابل للإغلاق (UX)
    // **********************************************

    const announcementBar = document.getElementById('announcement-bar');
    const closeBtn = document.getElementById('close-announcement');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            announcementBar.classList.add('hidden');
        });
    }

    // **********************************************
    // 4. دالة آراء المتدربين (Testimonials) - تم تحسينها
    // **********************************************
    async function fetchTestimonials() {  
        // إضافة صورة رمزية افتراضية لتحسين الجاذبية البصرية
        const AVATAR_URL = "https://via.placeholder.com/60/0d3b14/f7f3e9?text=👤"; 

        try {  
            const TESTIMONIALS_URL = "https://script.google.com/macros/s/AKfycbz81ueML7zsJn4ZQwYPi_bCdMT9A6K02hHjS_CZzCZwP0fN6u2AdsDneEHyxB8f89k5/exec";
            const response = await fetch(TESTIMONIALS_URL); 
            const allTestimonials = await response.json();  
            
            const testimonialsSection = document.getElementById('testimonials-section');
            if (testimonialsSection) {
                 testimonialsSection.innerHTML = `
                    <div class="section" data-aos="fade-up">
                        <h2>آراء طلابنا</h2>
                        <div class="slider-container">
                            <div id="testimonials-container"></div>
                            <div class="slider-dots"></div>
                        </div>
                    </div>
                `;
            }
            
            const container = document.getElementById('testimonials-container');  
            const dotsContainer = document.querySelector('#testimonials-section .slider-dots');
            
            if (!container || !dotsContainer || !allTestimonials || allTestimonials.length === 0 || allTestimonials.status === "error") {
                if(container) container.innerHTML = '<p style="text-align:center; padding: 20px;">لا تتوفر آراء حاليًا.</p>';
                return;
            }

            let slideIndex = 0;  

            allTestimonials.forEach((testimonial, index) => {  
                const text = testimonial.text || '';
                const name = testimonial.name || 'مشارك مجهول';
                
                const div = document.createElement('div');  
                div.classList.add('testimonial');  
                if (index === 0) div.classList.add('active');  
                
                // إضافة الصورة الرمزية
                div.innerHTML = `
                    <img src="${AVATAR_URL}" alt="صورة ${name}" class="testimonial-avatar" style="border-radius: 50%; margin-bottom: 15px; width: 60px; height: 60px; object-fit: cover;">
                    <p class="testimonial-text">"${text}"</p>
                    <p class="testimonial-name">— ${name}</p>`;  
                container.appendChild(div);  

                if (index < 10) { 
                    const dot = document.createElement('span');  
                    dot.classList.add('dot');  
                    if (index === 0) dot.classList.add('active');  
                    dot.addEventListener('click', () => showSlide(index));  
                    dotsContainer.appendChild(dot);  
                }  
            });  

            const testimonials = document.querySelectorAll('#testimonials-section .testimonial');  
            const dots = document.querySelectorAll('#testimonials-section .dot');  

            function showSlide(index) {  
                const safeIndex = index % testimonials.length; 
                
                testimonials.forEach(t => t.classList.remove('active'));  
                dots.forEach(d => d.classList.remove('active'));  
                
                testimonials[safeIndex].classList.add('active');  
                if (safeIndex < dots.length) dots[safeIndex].classList.add('active');  
                slideIndex = safeIndex;  
            }  

            function nextSlide() {  
                showSlide(slideIndex + 1); 
            }  

            if(allTestimonials.length > 1) {
                setInterval(nextSlide, 4000); 
            }

        } catch (error) {  
            console.error('Error fetching testimonials:', error);  
            document.getElementById('testimonials-section').innerHTML = '<p style="text-align:center; padding: 20px;">تعذر تحميل الآراء. يرجى مراجعة رابط الـ Web App.</p>';  
        }  
    }  
    
    fetchTestimonials();

    // **********************************************
    // 5. دالة معرض الصور (Gallery) - تم تحسينها
    // **********************************************
    async function fetchGalleryImages() {
        try {
            const GALLERY_URL = "https://script.google.com/macros/s/AKfycbxqiyeuO1FkX2srW7UG5cRZWOPerlQ5kbMJRRIUaFY2mHmGy51wrF2cgyeyJ_Uk_98S/exec";
            const response = await fetch(`${GALLERY_URL}?action=gallery`); 
            const result = await response.json();
            const container = document.getElementById('gallery-container');
            
            container.innerHTML = '';
            
            const imagesData = result.images || [];
            
            const gallerySection = container.closest('.section');
            let galleryTitle = gallerySection.querySelector('h2');

            if(imagesData.length === 0) {
                 container.innerHTML = '<p style="text-align:center;">لا توجد صور حالياً في المعرض.</p>';
                 return;
            }

            imagesData.forEach(row => {
                const url = row.url; 
                const name = row.name; 

                if (url) {
                    const slide = document.createElement('div');
                    slide.classList.add('swiper-slide');
                    slide.classList.add('gallery-slide');
                    
                    const img = document.createElement('img');
                    img.src = url;
                    img.alt = name || 'صورة من المعرض';
                    img.loading = 'lazy'; // إضافة التحميل الكسول
                    
                    const caption = document.createElement('div');
                    caption.classList.add('gallery-caption');
                    caption.textContent = name || '';

                    slide.appendChild(img);
                    slide.appendChild(caption);
                    container.appendChild(slide);
                }
            });
            
            var swiperGallery = new Swiper(".mySwiper-gallery", {
                slidesPerView: 1, 
                spaceBetween: 0, 
                centeredSlides: true,
                loop: true,
                autoplay: {
                    delay: 5000,
                    disableOnInteraction: false,
                },
                pagination: false, 
                navigation: false,
                on: {
                    slideChange: function () {
                        // استخدام realIndex للتعامل مع اللوب
                        const activeSlide = this.slides[this.realIndex]; 
                        const caption = activeSlide ? activeSlide.querySelector('.gallery-caption') : null;
                        if (caption) {
                            galleryTitle.textContent = caption.textContent;
                        }
                    },
                    init: function () {
                        // تعيين العنوان عند التهيئة الأولى باستخدام realIndex
                        const activeSlide = this.slides[this.realIndex];
                        const caption = activeSlide ? activeSlide.querySelector('.gallery-caption') : null;
                        if (caption) {
                            galleryTitle.textContent = caption.textContent;
                        }
                    },
                },
            });

        } catch (error) {
            console.error('Error fetching gallery images:', error);
            document.getElementById('gallery-container').innerHTML = '<p style="text-align:center;">تعذر تحميل الصور. حاول مرة أخرى لاحقًا.</p>';
        }
    }

    fetchGalleryImages();

});
