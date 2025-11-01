// Fetch images from the Google Sheets API and create slides
const googleSheetsUrl = 'https://script.google.com/macros/s/AKfycbxjc5q9dMRNBoFHPwbiyDXxDZQp9fGOIsWOMg_4JwJIJriiRKOSHGtw58RdCtecXfe2Tw/exec';
const swiperWrapper = document.querySelector('.image-swiper .swiper-wrapper');

fetch(googleSheetsUrl)
  .then(response => {
    if (!response.ok) {
      // إطلاق خطأ الشبكة قبل الوصول إلى JSON
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    // التأكد من أن المصفوفة موجودة وغير فارغة
    if (!data.images || data.images.length === 0) {
        throw new Error('No images found in data.');
    }
    
    swiperWrapper.innerHTML = '';

    data.images.forEach((image, index) => {
      const slide = document.createElement('div');
      slide.classList.add('swiper-slide');

      const img = document.createElement('img');
      img.src = image.url;
      img.alt = image.name; 
      // *** التعديل 1: تفعيل التحميل المُؤجل للصور ديناميكياً ***
      img.loading = (index === 0) ? 'eager' : 'lazy'; // الصورة الأولى تحمل فوراً والبقية تؤجل

      slide.appendChild(img);
      swiperWrapper.appendChild(slide);
    });

    // Initialize Swiper ONLY after slides have been added
    var imageSwiper = new Swiper('.image-swiper', {
      slidesPerView: 1,
      spaceBetween: 0,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });

    // Make the swiper visible
    document.querySelector('.image-swiper').style.opacity = '1';
  })
  .catch(error => {
      console.error('Error fetching images:', error);
      // *** التعديل 2: عرض رسالة خطأ للمستخدم بدلاً من ترك القسم فارغاً ***
      const parentSection = swiperWrapper.closest('section');
      if (parentSection) {
          parentSection.innerHTML = '<p style="text-align: center; color: #a00;">عذراً، تعذر تحميل معرض الصور حالياً.</p>';
      }
      // إخفاء الـ Swiper في حالة الفشل لتجنب ظهور هيكل فارغ
      document.querySelector('.image-swiper').style.display = 'none';
  });
