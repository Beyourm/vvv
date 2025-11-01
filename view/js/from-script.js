const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzP4ugT4iShAZ2IJ7HvfUzqmvl1wi5K7GNG2qsilc9GHi6N9GuTb6h1r0bo5ce9Wpr8/exec";
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form');
    const submitBtn = document.getElementById('submit-btn');
    const formMessage = document.getElementById('form-message');
    const inputs = document.querySelectorAll("#form input:not([type='hidden']), #form select");
    const progressBar = document.getElementById('progress-bar');
    const formMainTitle = document.getElementById('form-main-title');
    const totalInputs = inputs.length;


    const ageErrorMessages = [
    
    "يا سلام! ✨ أنت نجم من زمن قديم — النظام يقف عند 99 عام، لكن احترامنا لك بلا حدود 🤗.",
    "ما شاء الله عليك! 🌟 خبرة وحكايات لا تُقَدَّر... النظام يقبل حتى 99 عام ، والباقي لنا فخر به 👏.",
    "ضحكتنا من فرط الإعجاب 😄 — والله لو عندنا خانة للأبطال، تملأها أنت، والنظام عنده حد 99 عام بس.",
    "يا مرحباً بالأسطورة! 🏅 النظام يوقف عند 99 عام، لكن تحياتنا تمتد أكثر من صفحة سجل 🤗.",
    "واو! ✨ مثل هذا العمر يستحق وصفة شاي وكرسي مريح — النظام يوقف عند 99 عام ، ومحبتنا لك بلا سقف ☕️.",
    "هههه 😄 واضح إنك خزنة حكمة! عندنا حد 99 عام، لكن الكاريزما محفوظة لك دائماً 🤝.",
    "يا سلام على التجربة! 🌿 سجل النظام 99 عام كحد أعلى، لكن شهادتك في الحياة لا تُقَيَّم.",
    "ما نملك سوى كلمة: احترام 🙏 — النظام يحدد 99 عام ، لكن تقديرنا لك أبداً ما ينتهي.",
    "أنت تاريخ مكتوب بلطف ⭐️ — النظام يتعامل مع الأرقام حتى 99 عام، لكن تحياتنا وأمنياتنا لك تدوم.",
    "ضحكتنا لك من القلب 😄 — العمر كبير جدًا، والنظام عنده سقف 99 عام، لكن محبتنا لك بلا حدود.",
    "يا له من مشوار! 🚶‍♂️🚶‍♀️ النظام يطلب إدخال حتى 99 عام، والباقي نعتبره جزء من تاريخ جميل.",
    "يا مرحبا بالحكمة! 🦉 سجل النظام 99 عام ، لكن تجربتك في الحياة دروس للجميع.",
    "أنت رمز للصبر والخبرة 🌟 — النظام يتعامل حتى 99 عام، لكن تقديرنا لك بلا سقف.",
    "يا سلام على العمر! 🏛️ النظام يحدد 99 عام، لكن حكاياتك وأمجادك محفوظة في قلوبنا.",
    "مذهل! 😄 النظام يقف عند 99 عام، لكن تاريخك يملأ صفحات الكتب.",
    "واو! 🌟 هذا العمر يستحق احتفالًا يوميًا — النظام عنده حد 99 عام ، لكن احترامنا لك أبدي.",
    "أنت نجم مضيء ✨ — النظام يقرأ حتى 99 عام، والباقي مجرد سحر الحياة.",
    "يا له من مشوار! 🚀 النظام يقف عند 99 عام، لكن رحلتك في الحياة لا نهاية لها.",
    "ضحكتنا من فرط الإعجاب 😄 — العمر أكبر من 99 عام، لكن قلبك مليء بالشباب دائماً.",
    "يا سلام! 🌿 النظام يطلب إدخال حتى 99 عام ، لكن تقديرنا لك يفوق كل الحدود.",
    "أنت أسطورة حقيقية 🏅 — النظام يقف عند 99 عام، لكن ذكراك باقية للأبد.",
    "واو! 😄 خبرة وحكمة بلا حدود — النظام عنده سقف 99 عام، والباقي نحتفل به في قلوبنا.",
    "يا مرحبا بالحكمة! 🦉 سجل النظام 99 عام ، لكن قصصك ممتدة بلا نهاية.",
    "أنت رمز الإلهام 🌟 — العمر فوق 99 عام، والنظام عنده حد، لكن روحك تتجاوز كل القوانين.",
    "يا له من مشوار! 🚶‍♂️🌿 النظام يقف عند 99 عام، لكن رحلتك حياة مليئة بالإبداع.",
    "ضحكتنا لك من القلب 😄 — العمر كبير، والنظام عنده سقف، لكن محبتنا لك بلا نهاية.",
    "أنت كنز من الحكمة ✨ — النظام يقرأ حتى 99 عام، والباقي نحتفل به في القلب.",
    "واو! 🌟 هذه الخبرة لا تُقَيَّم — النظام عنده حد 99 عام، لكن احترامنا لك أبدي.",
    "يا مرحبا بالأسطورة! 🏛️ العمر أكبر من 99 عام، والنظام يوقف، لكن حكايتك تواصل التألق.",
    "مذهل! 😄 كل عام منك مليئة بالحكمة — النظام عنده سقف، لكن تقديرنا لك بلا حدود.",
    "يا سلام على العمر! 🌿 النظام يقف عند 99 عام، لكن تجاربك وقصصك لا تُحصى."
    
    
];

    document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');

    const urlParams = new URLSearchParams(window.location.search);
    const courseName = urlParams.get("course");
    if (courseName) {
        const decodedCourseName = decodeURIComponent(courseName);
        document.getElementById("course-name-input").value = decodedCourseName;
        formMainTitle.innerHTML = `📘 أنت تسجل الآن في: <span style="color:var(--accent-color);">${decodedCourseName}</span>`;
    }

    const countrySelect = document.getElementById('country');
    arabCountries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
    });

    const updateProgress = () => {
        let filledInputs = 0;
        inputs.forEach(input => {
            if (input.value && input.checkValidity() && input.value !== "") {
                filledInputs++;
            }
        });
        const progress = (filledInputs / totalInputs) * 100;
        progressBar.style.width = `${progress}%`;
    };

    inputs.forEach(input => {
        const icon = input.closest('.input-with-icon').querySelector('.icon');
        const errorMessage = input.closest('.input-group').querySelector('.error-message');

        input.addEventListener("input", () => {
            if (input.id === 'age') {
                const ageValue = parseInt(input.value, 10);
                if (ageValue > 99 || input.value.length > 2) {
                    input.classList.add('is-invalid');
                    const randomIndex = Math.floor(Math.random() * ageErrorMessages.length);
                    errorMessage.textContent = ageErrorMessages[randomIndex];
                    if (errorMessage) errorMessage.style.display = 'block';
                } else {
                    input.classList.remove('is-invalid');
                    if (errorMessage) errorMessage.style.display = 'none';
                }
            }

            if (input.checkValidity() && input.value !== "") {
                icon.style.color = "#28a745";
            } else {
                icon.style.color = "var(--primary-color)";
            }
            updateProgress();
        });

        input.addEventListener("blur", () => {
            if (input.id === 'age') {
                const ageValue = parseInt(input.value, 10);
                if (!input.checkValidity() && input.value && (ageValue > 99)) {
                    input.classList.add('is-invalid');
                    const randomIndex = Math.floor(Math.random() * ageErrorMessages.length);
                    errorMessage.textContent = ageErrorMessages[randomIndex];
                    if (errorMessage) errorMessage.style.display = 'block';
                } else {
                    input.classList.remove('is-invalid');
                    if (errorMessage) errorMessage.style.display = 'none';
                }
            } else {
                if (!input.checkValidity() && input.value !== "") {
                    input.classList.add('is-invalid');
                    if (errorMessage) errorMessage.style.display = 'block';
                }
            }
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        let isFormValid = form.checkValidity();
        const ageInput = document.getElementById('age');
        if (parseInt(ageInput.value, 10) > 99) {
            isFormValid = false;
        }

        if (!isFormValid) {
            inputs.forEach(input => {
                const errorMessage = input.closest('.input-group').querySelector('.error-message');
                if (!input.checkValidity() || (input.id === 'age' && parseInt(input.value, 10) > 99)) {
                    input.classList.add('is-invalid');
                    if (input.id === 'age') {
                        const randomIndex = Math.floor(Math.random() * ageErrorMessages.length);
                        errorMessage.textContent = ageErrorMessages[randomIndex];
                    }
                    if (errorMessage) errorMessage.style.display = 'block';
                } else {
                    input.classList.remove('is-invalid');
                    if (errorMessage) errorMessage.style.display = 'none';
                }
            });
            return;
        }

        document.getElementById('registration-date-input').value = new Date().toLocaleString('ar-AE', { timeZone: 'Asia/Dubai' });

        const isConfirmed = confirm('هل أنت متأكد من صحة البيانات المدخلة؟');
        if (!isConfirmed) return;

        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        formMessage.style.display = 'none';

        try {
            // الخطوة 1: إرسال البيانات إلى قوقل شيت أولاً
            const formData = new FormData(form);
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: formData
            });

            // إذا نجح الإرسال، ننتقل للخطوة الثانية
            if (response.ok) {
                // الخطوة 2: جمع البيانات لرسالة الواتساب
                const data = {};
                for (let [key, value] of formData.entries()) {
                    data[key] = value;
                }

                // الكود المعدل هنا:
                const messageBody = `
🎓 *تسجيل جديد في دورة ${data.CourseName}!*

📘 الدورة: ${data.CourseName}
👤 الاسم: ${data.name}
🧬 الجنس: ${data.gender}
🎂 العمر: ${data.age}
🌍 البلد: ${data.country}
📱 رقم الواتساب: ${data.phone}
✉️ البريد الإلكتروني: ${data.email}
💬 تيليجرام: ${data.telegram || 'غير محدد'}

🚀 تهانينا! تم تسجيلك في رحلتنا نحو التركيز الخارق وسرعة الحفظ المذهلة.  
✨ أنت الآن على أول خطوة لتحقيق التفوق الدراسي والقدرات العقلية الخارقة!

📩 سيتم التواصل معك قريبًا لتأكيد بياناتك والانطلاق في الدورة.
`;
                // نهاية الكود المعدل

                // الخطوة 3: توجيه المستخدم إلى واتساب
                window.location.href = `https://wa.me/967778185189?text=${encodeURIComponent(messageBody)}`;

                form.reset();
                updateProgress();
                inputs.forEach(input => {
                    input.classList.remove('is-invalid');
                    const icon = input.closest('.input-with-icon').querySelector('.icon');
                    if(icon) icon.style.color = "var(--primary-color)";
                });

            } else {
                 // إذا فشل الإرسال، نعرض رسالة خطأ
                throw new Error('Form submission failed.');
            }

        } catch (error) {
            formMessage.style.display = 'block';
            formMessage.className = 'error';
            formMessage.textContent = '❌ حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.';
        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    });
});

