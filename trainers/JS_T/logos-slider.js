const LOGOS_API_URL = "https://script.google.com/macros/s/AKfycbx-rVphRUdWnrQ5jmKbFTmqLrwB2Dw1RSrCQzadP9vfZfA4tubN5sk0E_8RetHDfejA/exec"; 

async function fetchAndRenderLogosSlider() {
    const placeholder = document.getElementById('logos-placeholder');
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

        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'logos-slider';

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

        sliderContainer.appendChild(slide);
        placeholder.innerHTML = '';
        placeholder.appendChild(sliderContainer);
        sliderContainer.style.backgroundColor = 'rgba(255,255,255,0.1)';

    } catch (error) {
        console.error("Error loading logos slider:", error);
        placeholder.innerHTML = `<p style="text-align:center; color:#e74c3c;">
            فشل في تحميل الشعارات. <button onclick="fetchAndRenderLogosSlider()">إعادة المحاولة</button>
        </p>`;
    }
}

document.addEventListener('DOMContentLoaded', fetchAndRenderLogosSlider);