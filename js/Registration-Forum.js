    // ------------------------------------------------------------------
    // تعريف أقسام النموذج (بيانات خطوة بخطوة)
    // ------------------------------------------------------------------

    const formSteps = [
        { 
            title: 'المعلومات الشخصية',
            icon: '👤',
            content: `
                <div class="form-group">
                    <label for="full_name">الاسم الكامل</label>
                    <input type="text" id="full_name" name="full_name" required>
                </div>
                <div class="form-group">
                    <label for="age">العمر</label>
                    <input type="number" id="age" name="age" min="18" max="99" required>
                </div>
                <div class="form-group">
                    <label for="gender">الجنس</label>
                    <select id="gender" name="gender" required>
                        <option value="">اختر...</option>
                        <option value="male">ذكر</option>
                        <option value="female">أنثى</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="country_city">البلد / المدينة</label>
                    <input type="text" id="country_city" name="country_city" required>
                </div>
            `
        },
        { 
            title: 'المؤهلات والخبرات',
            icon: '🎓',
            content: `
                <div class="form-group">
                    <label for="qualification">المؤهل العلمي</label>
                    <input type="text" id="qualification" name="qualification" required>
                </div>
                <div class="form-group">
                    <label for="specialization">التخصص الدراسي</label>
                    <input type="text" id="specialization" name="specialization" required>
                </div>
                <div class="form-group">
                    <label for="experience">الخبرات العملية</label>
                    <textarea id="experience" name="experience" placeholder="اذكر أماكن العمل السابقة والمهام التي قمت بها"></textarea>
                </div>
                <div class="form-group">
                    <label for="skills">المهارات</label>
                    <textarea id="skills" name="skills" placeholder="مثال: الحاسوب، اللغات، التدريب، المهارات الفنية..."></textarea>
                </div>
                <div class="form-group">
                    <label for="courses">الدورات التدريبية الحاصل عليها</label>
                    <textarea id="courses" name="courses" placeholder="اذكر أسماء الدورات والمؤسسات التي حصلت عليها منها"></textarea>
                </div>
            `
        },
        { 
            title: 'معلومات الاتصال والملف المرفق',
            icon: '📞',
            content: `
                <div class="form-group">
                    <label for="phone">رقم الهاتف + واتساب</label>
                    <input type="tel" id="phone" name="phone" required>
                </div>
                <div class="form-group">
                    <label for="email">البريد الإلكتروني</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="telegram">رابط الحساب على تيليجرام</label>
                    <input type="url" id="telegram" name="telegram" placeholder="مثال: https://t.me/username">
                </div>
                <div class="form-group">
                    <label for="desired_field">المجال الذي يرغب بالعمل فيه</label>
                    <select id="desired_field" name="desired_field" required>
                        <option value="">اختر...</option>
                        <option value="administration">إداري</option>
                        <option value="trainer">مدرب</option>
                        <option value="marketing">تسويق</option>
                        <option value="technical_support">دعم فني</option>
                        <option value="other">أخرى</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>السيرة الذاتية (CV)</label>
                    <div class="drag-and-drop-area" id="dropArea">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p><strong>اسحب وأفلت الملف هنا</strong> أو اضغط للبحث</p>
                        <input type="file" id="cv" name="cv" class="file-input" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png">
                        <p class="file-info">الحد الأقصى 5 ميجابايت. PDF أو DOCX مفضل.</p>
                        <p id="fileStatus" class="file-info" style="font-style: normal; font-weight: 700; color: var(--primary-color); margin-top: 5px;">لم يتم اختيار أي ملف.</p>
                    </div>
                </div>

                <div class="expectation-message">
                    نقدر وقتك. بعد إرسال النموذج، سيتم مراجعة طلبك وسيتم التواصل مع المرشحين المؤهلين خلال **10 أيام عمل**.
                </div>
            `
        }
    ];

    let currentStep = 0; 
    const form = document.getElementById("jobForm");
    // هذا الرابط يجب أن يتم تكييفه ليناسب تطبيق Google Apps Script الخاص بك
    const scriptURL = "https://script.google.com/macros/s/AKfycbw3_CNHVz2ov0kZLXmZhnz_3MMEzdMsjI7zUotQzlzYGPNPt4EbgQXtkvuGVrvywrfh/exec";


    // ------------------------------------------------------------------
    // دالة تحديث عرض القسم النشط وشريط التقدم
    // ------------------------------------------------------------------
    function updateStepDisplay() {
        const stepsDivs = form.querySelectorAll('.form-step');
        const progressSteps = document.querySelectorAll('.progress-container .step');

        stepsDivs.forEach((step, index) => {
            if (index === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        progressSteps.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index === currentStep) {
                step.classList.add('active');
            } else if (index < currentStep) {
                step.classList.add('completed');
            }
        });
        
        const responseMessage = document.getElementById("response-message");
        if (responseMessage) {
            responseMessage.classList.remove('show');
        }
    }


    // ------------------------------------------------------------------
    // دالة بناء النموذج (تُستدعى مرة واحدة عند التحميل)
    // ------------------------------------------------------------------
    function buildFormStructure() {
        formSteps.forEach((step, index) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'form-section form-step';
            stepDiv.setAttribute('data-step', index);

            stepDiv.innerHTML = `
                <h2><span class="response-icon">${step.icon}</span> ${step.title}</h2>
                ${step.content}
            `;
            
            // إضافة أزرار التنقل (السابق/التالي)
            const controlsDiv = document.createElement('div');
            controlsDiv.style.display = 'flex';
            controlsDiv.style.gap = '10px';
            controlsDiv.style.marginTop = '15px';
            
            // زر السابق
            if (index > 0) {
                const prevButton = document.createElement('button');
                prevButton.type = 'button';
                prevButton.className = 'btn-action prev-btn';
                prevButton.style.width = index === formSteps.length - 1 ? '50%' : '50%';
                prevButton.textContent = 'السابق';
                prevButton.onclick = () => changeStep(index - 1);
                controlsDiv.appendChild(prevButton);
            }
            
            // زر التالي أو الإرسال
            if (index < formSteps.length - 1) {
                const nextButton = document.createElement('button');
                nextButton.type = 'button';
                nextButton.className = 'btn-action';
                nextButton.style.width = index === 0 ? '100%' : '50%';
                nextButton.textContent = 'التالي';
                nextButton.onclick = () => {
                    if (validateCurrentStep()) {
                         changeStep(index + 1);
                    }
                };
                controlsDiv.appendChild(nextButton);
            } else {
                // زر الإرسال النهائي
                const submitButton = document.createElement('button');
                submitButton.type = 'submit';
                submitButton.id = 'submitBtn'; 
                submitButton.className = 'btn-submit';
                submitButton.textContent = 'إرسال الطلب';
                controlsDiv.appendChild(submitButton);
            }

            stepDiv.appendChild(controlsDiv);
            form.appendChild(stepDiv);
        });

        // إنشاء مؤشر التحميل ورسالة الاستجابة وإضافتهما لمرة واحدة فقط
        let loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'loading-indicator';
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerHTML = '<span class="icon">⏳</span> جاري إرسال الطلب...';
        form.appendChild(loadingIndicator);
        
        let responseMessage = document.createElement('p');
        responseMessage.id = 'response-message';
        responseMessage.className = 'response-message';
        form.appendChild(responseMessage);

        updateStepDisplay(); // التأكد من عرض القسم الأول
        setupDragAndDrop(); // تفعيل منطقة سحب وإفلات
    }

    // دالة لتغيير القسم النشط
    function changeStep(newStep) {
        currentStep = newStep;
        updateStepDisplay(); 
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // دالة التحقق من الحقول المطلوبة في القسم الحالي
    function validateCurrentStep() {
        const currentStepDiv = document.querySelector('.form-step.active');
        const requiredFields = currentStepDiv.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.checkValidity()) {
                field.style.border = '2px solid red'; 
                isValid = false;
            } else {
                field.style.border = ''; 
            }
        });

        if (!isValid) {
            alert('الرجاء تعبئة جميع الحقول المطلوبة بشكل صحيح في هذا القسم للمتابعة.');
        }

        return isValid;
    }

    // ------------------------------------------------------------------
    // منطق سحب وإفلات الملفات (Drag and Drop Logic)
    // ------------------------------------------------------------------
    function setupDragAndDrop() {
        const dropArea = document.getElementById('dropArea');
        const fileInput = document.getElementById('cv');
        const fileStatus = document.getElementById('fileStatus');

        if (!dropArea || !fileInput) return; 

        dropArea.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                fileStatus.textContent = `تم اختيار الملف: ${fileInput.files[0].name}`;
            } else {
                fileStatus.textContent = 'لم يتم اختيار أي ملف.';
            }
        });

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => dropArea.classList.add('drag-over'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => dropArea.classList.remove('drag-over'), false);
        });

        dropArea.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            fileInput.files = files;
            
            const event = new Event('change');
            fileInput.dispatchEvent(event);
        }
    }


    document.addEventListener('DOMContentLoaded', buildFormStructure);

    // ------------------------------------------------------------------
    // منطق إرسال النموذج 
    // ------------------------------------------------------------------

    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (!validateCurrentStep()) return; 

      const submitButton = document.getElementById('submitBtn');
      const loadingIndicator = document.getElementById('loading-indicator');
      const responseMessage = document.getElementById("response-message");
      
      // 1. تفعيل وضع التحميل
      submitButton.style.display = 'none';
      loadingIndicator.classList.add('active');
      responseMessage.classList.remove('show'); 
      
      const formData = new FormData(form);
      const file = formData.get("cv");

      let base64File = "";
      let fileName = "";

      // معالجة ملف السيرة الذاتية (CV)
      if (file && file.size > 0) {
        fileName = file.name;
        base64File = await toBase64(file);
      }

      const payload = {};
      formData.forEach((value, key) => payload[key] = value);
      payload.cvFile = base64File;
      payload.cvName = fileName;

      try {
        const res = await fetch(scriptURL, {
          method: "POST",
          body: JSON.stringify(payload)
        });

        const response = await res.json();

        // 2. إيقاف وضع التحميل
        loadingIndicator.classList.remove('active');

        if (response.status === "success" || response.status === "نجاح") {
          // رسالة النجاح المُحسّنة
          responseMessage.innerHTML = '<span class="response-icon">✅</span> <strong>تهانينا! أول خطوة نحو التميز قد تحققت.</strong> لقد تم استلام طلبك بنجاح، ونحن متحمسون جداً لدراسة ملفك.';
          responseMessage.className = "success-message response-message show";
          form.reset();
          currentStep = 0; // إعادة تعيين المؤشر
          updateStepDisplay(); // العودة للقسم الأول
          // تنظيف حالة الملف
          document.getElementById('fileStatus').textContent = 'لم يتم اختيار أي ملف.';
        } else {
          responseMessage.innerHTML = '<span class="response-icon">❌</span> <strong>خطأ في الإرسال:</strong> ' + (response.message || 'حدث خطأ غير معروف أثناء الإرسال.');
          responseMessage.className = "error-message response-message show";
          // في حالة الخطأ، نعيد إظهار زر الإرسال
          submitButton.style.display = 'flex'; 
        }
      } catch (error) {
        // 2. إيقاف وضع التحميل في حالة الفشل
        loadingIndicator.classList.remove('active');
        
        responseMessage.innerHTML = '<span class="response-icon">❌</span> <strong>خطأ في الاتصال:</strong> حدث خطأ في الاتصال، يرجى المحاولة لاحقاً.';
        responseMessage.className = "error-message response-message show";
        submitButton.style.display = 'flex'; // إعادة إظهار الزر
        console.error(error);
      }
      
      // التمرير لأسفل لرؤية الرسالة
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); 
    });

    // دالة تحويل الملف إلى Base64
    function toBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(",")[1]); 
        reader.onerror = error => reject(error);
      });
    }
