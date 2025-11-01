/*
|--------------------------------------------------------------------------
| MAIN JAVASCRIPT (scripts/main.js)
|--------------------------------------------------------------------------
| يضم منطق Typewriter و Scroll Reveal و Parallax.
*/

document.addEventListener('DOMContentLoaded', () => {
    const revealItems = document.querySelectorAll('.reveal-item, footer, .service-card');
    const parallaxItems = document.querySelectorAll('.parallax-item, .cta-button');
    const container = document.querySelector('.container');
    
    // **************** 1. Typewriter Effect (Improved using async/await) ****************
    const dynamicTextElement = document.getElementById('dynamic-text');
    const phrases = ["نُطلق نجاحك الرقمي", "نجعل علامتك التجارية أيقونة", "نحو القمة بلا حدود"];
    
    // دالة مساعدة لتأخير التنفيذ
    const delay = ms => new Promise(res => setTimeout(res, ms));

    async function typePhrase(phrase) {
        dynamicTextElement.style.width = '0'; 
        dynamicTextElement.style.opacity = '1';
        
        // محاكاة الكتابة
        for (let i = 0; i < phrase.length; i++) {
            dynamicTextElement.textContent += phrase.charAt(i);
            await delay(80); 
        }
        await delay(2000); 
        
        // محاكاة المسح
        while (dynamicTextElement.textContent.length > 0) {
            dynamicTextElement.textContent = phrase.substring(0, dynamicTextElement.textContent.length - 1);
            await delay(40); 
        }
        await delay(500); 
    }

    async function startTypingLoop() {
        dynamicTextElement.style.display = 'block';
        while (true) {
            for (let i = 0; i < phrases.length; i++) {
                await typePhrase(phrases[i]);
            }
        }
    }
    
    setTimeout(startTypingLoop, 1200); 

    // **************** 2. Scroll Reveal Logic (Tilted & Staggered) ****************
    const observer = new IntersectionObserver(entries => {
        let totalDelay = 0; 
        
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const item = entry.target;
                
                if (item.classList.contains('reveal-executed')) return; 

                const animationName = 'revealUp'; 

                item.style.transform = 'translateY(20px) rotate(-1deg)'; 
                
                if (item.classList.contains('service-card')) {
                    item.style.animation = `revealUp 0.7s cubic-bezier(0.25, 1, 0.5, 1) forwards`;
                    item.style.animationDelay = `${parseFloat(item.getAttribute('data-delay')) || 0.1}s`;
                } else {
                     item.style.animation = `${animationName} 0.7s cubic-bezier(0.25, 1, 0.5, 1) forwards`;
                     item.style.animationDelay = `${totalDelay}s`;
                     totalDelay += 0.15;
                }

                item.classList.add('reveal-executed'); 
                observer.unobserve(item);
            }
        });
    }, { threshold: 0.1 }); 

    revealItems.forEach(item => {
        item.style.animationDelay = '0s'; 
        observer.observe(item);
    });
    
    // **************** 3. Initial Hero Section Animations ****************
    const h1Element = document.querySelector('.hero-title.reveal-item');
    const subtitleElement = document.querySelector('.subtitle.reveal-item');
    const microTextElement = document.querySelector('.micro-text.reveal-item');

    const initialAnimate = (element, delayValue) => {
        if (element) {
            element.style.animation = `revealUp 1s cubic-bezier(0.25, 1, 0.5, 1) forwards, ${element.classList.contains('hero-title') ? 'gradientShift 3s infinite alternate' : ''}`;
            element.style.animationDelay = `${delayValue}s`; 
            element.classList.add('reveal-executed');
            observer.unobserve(element);
        }
    };

    initialAnimate(h1Element, 0.1);
    initialAnimate(subtitleElement, 0.6);
    initialAnimate(microTextElement, 1.0);


    // **************** 4. Mouse Parallax Effect (Optimized with requestAnimationFrame) ****************
    if (container) {
        let mouseX = 0;
        let mouseY = 0;

        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            mouseX = (e.clientX - centerX) / 50; 
            mouseY = (e.clientY - centerY) / 50;
        });
        
        // دالة تحديث الرسوم المتحركة
        const updateParallax = () => {
            parallaxItems.forEach(item => {
                if (!item.hasAttribute('data-depth-x')) return; 
                
                const depthX = parseFloat(item.getAttribute('data-depth-x'));
                const depthY = parseFloat(item.getAttribute('data-depth-y'));
                
                const moveX = (mouseX * depthX) * -1;
                const moveY = (mouseY * depthY) * -1;
                
                item.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
            
            // طلب التحديث التالي
            requestAnimationFrame(updateParallax);
        }
        
        // بدء حلقة الـ Parallax
        requestAnimationFrame(updateParallax);
    }
});

