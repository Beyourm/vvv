// --- قائمة الدول العربية ومفاتيحها الدولية ---
const arabCountries = [
  { name: "فلسطين", code: "+970" },
  { name: "الأردن", code: "+962" },
  { name: "سوريا", code: "+963" },
  { name: "العراق", code: "+964" },
  { name: "لبنان", code: "+961" },
  { name: "مصر", code: "+20" },
  { name: "السودان", code: "+249" },
  { name: "ليبيا", code: "+218" },
  { name: "تونس", code: "+216" },
  { name: "الجزائر", code: "+213" },
  { name: "المغرب", code: "+212" },
  { name: "موريتانيا", code: "+222" },
  { name: "الصومال", code: "+252" },
  { name: "جيبوتي", code: "+253" },
  { name: "جزر القمر", code: "+269" },
  { name: "السعودية", code: "+966" },
  { name: "اليمن", code: "+967" },
  { name: "الإمارات", code: "+971" },
  { name: "الكويت", code: "+965" },
  { name: "البحرين", code: "+973" },
  { name: "قطر", code: "+974" },
  { name: "سلطنة عمان", code: "+968" }
];
// ---------------------------------------------


// ------------------------------------------------------------------
// تعريف المتغيرات الرئيسية
// ------------------------------------------------------------------
let currentStepIndex = 1; 
const form = document.getElementById("TraineeForm");
const formSteps = document.querySelectorAll('.form-step');
// ⚠️ تأكد من تحديث هذا الرابط ليناسب تطبيق Google Apps Script الخاص بك ⚠️
const scriptURL = "https://script.google.com/macros/s/AKfycbyCc4iYefP7LvI6DJCXg1xuvilzDBtoKq8jJzWOvyJaW_088fYgrkgra6Zb_C37JOs-eg/exec";



// ------------------------------------------------------------------
// دوال المساعدة الأساسية
// ------------------------------------------------------------------
function cleanPhoneNumber(phoneValue) {
    if (!phoneValue) return "";
    let cleaned = phoneValue.replace(/[^0-9\+]/g, '');
    if (cleaned.startsWith('++')) {
         cleaned = '+' + cleaned.substring(2).replace(/\+/g, '');
    }
    return cleaned;
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.querySelector(`[data-input="${fieldId}"]`);
    // 🚨 ملاحظة: يجب أن نستخدم parent_name (الحقل المخفي) للبحث عن رسالة الخطأ
    const targetId = (fieldId === 'parent_name_visible') ? 'parent_name' : fieldId;
    const targetErrorDiv = document.querySelector(`[data-input="${targetId}"]`);
    
    if (field) field.classList.add('error');
    if (field) field.classList.remove('valid');
    if (targetErrorDiv) targetErrorDiv.textContent = message;
}

function showSuccess(fieldId) {
    const field = document.getElementById(fieldId);
    // 🚨 ملاحظة: يجب أن نستخدم parent_name (الحقل المخفي) للبحث عن رسالة الخطأ
    const targetId = (fieldId === 'parent_name_visible') ? 'parent_name' : fieldId;
    const targetErrorDiv = document.querySelector(`[data-input="${targetId}"]`);
    
    if (field) field.classList.add('valid');
    if (field) field.classList.remove('error');
    if (targetErrorDiv) targetErrorDiv.textContent = '';
}

/**
 * 💡 (التعديل 1) دالة لتعبئة قائمة الجنسيات تلقائياً (تُظهر اسم الدولة فقط)
 */
function populateCountrySelect() {
    const selectElement = document.getElementById('nationality');
    if (!selectElement) return;

    // تعبئة خيارات الدول
    arabCountries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.name;
        // 🚨 تصحيح: نستخدم اسم الدولة فقط للنص الظاهر
        option.textContent = country.name; 
        selectElement.appendChild(option);
    });
    
    // إضافة خيار 'جنسية أخرى'
    const otherOption = document.createElement('option');
    otherOption.value = 'other';
    otherOption.textContent = 'جنسية أخرى';
    selectElement.appendChild(otherOption);
}


/**
 * 💡 (التعديل 2) دالة لتطبيق المفتاح الدولي على حقول الهاتف فوراً
 */
function handleNationalityChange() {
    const nationalitySelect = document.getElementById('nationality');
    const phoneInput = document.getElementById('phone_number');
    const parentPhoneInput = document.getElementById('parent_phone');
    
    if (!nationalitySelect) return;

    const selectedNationality = nationalitySelect.value;
    const countryData = arabCountries.find(country => country.name === selectedNationality);
    const countryCode = countryData ? countryData.code : '';
    
    // الدالة الفرعية للتطبيق الفوري للمفتاح
    const setCountryCode = (inputElement, code) => {
        if (!inputElement) return;

        let currentValue = inputElement.value.trim();
        let cleanedValue = cleanPhoneNumber(currentValue);
        
        // إزالة أي مفتاح دولي سابق (لإعادة التعيين إذا غير المستخدم الجنسية)
        for (const country of arabCountries) {
            if (cleanedValue.startsWith(country.code)) {
                cleanedValue = cleanedValue.substring(country.code.length);
                break;
            }
        }
        
        // إضافة المفتاح الدولي الجديد (إذا كان موجوداً)
        if (code) {
             inputElement.value = code;
        } else if (currentValue.startsWith('+')) {
            // إذا كان المستخدم قد كتب مفتاح دولي بالفعل، لا تغيره
             inputElement.value = currentValue;
        } else {
             // إزالة المفتاح إذا لم يتم اختيار جنسية
             inputElement.value = '';
        }
    };
    
    setCountryCode(phoneInput, countryCode);
    setCountryCode(parentPhoneInput, countryCode);
}


// ------------------------------------------------------------------
// دالة التحقق المباشر والمنطق الشرطي (Conditional Logic)
// ------------------------------------------------------------------
function validateField(field) {
    const errorMsgDiv = document.querySelector(`[data-input="${field.id}"]`);
    if (!field) return true;

    field.classList.remove('error', 'valid');
    
    // 🚨 ملاحظة: نستخدم 'parent_name' لرسالة الخطأ للحقل المرئي
    const targetId = (field.id === 'parent_name') ? 'parent_name' : field.id;
    const targetErrorDiv = document.querySelector(`[data-input="${targetId}"]`);
    if (targetErrorDiv) targetErrorDiv.textContent = '';
    
    // استخدام الاسم الصحيح للحقل المرئي الآن
    const fieldToCheck = (field.id === 'parent_name') ? document.getElementById('parent_name') : field;

    if (!fieldToCheck.value.trim() && !fieldToCheck.hasAttribute('required')) {
        return true; 
    }
    
    let isFieldValid = true;
    let errorMessage = '';

    if (fieldToCheck.hasAttribute('required') && fieldToCheck.value.trim() === '') {
        isFieldValid = false;
        errorMessage = 'هذا الحقل مطلوب.';
    } 
    else {
        switch (fieldToCheck.id) {
            case 'age':
                const age = parseInt(fieldToCheck.value);
                if (isNaN(age) || age < 8 || age > 99) { 
                    isFieldValid = false;
                    errorMessage = 'يجب أن يكون العمر بين 8 و 99 سنة.';
                }
                break;
            case 'email':
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(fieldToCheck.value.trim())) {
                    isFieldValid = false;
                    errorMessage = 'الرجاء إدخال بريد إلكتروني صحيح.';
                }
                break;
            case 'phone_number':
            case 'parent_phone':
                // التحقق من رقم الهاتف بعد التنظيف (مع ترك المفتاح الدولي إذا وُجد)
                let cleanedPhone = cleanPhoneNumber(fieldToCheck.value);
                
                // تجاهل المفتاح الدولي في طول الرقم للتأكد من وجود باقي الأرقام
                for (const country of arabCountries) {
                    if (cleanedPhone.startsWith(country.code)) {
                        cleanedPhone = cleanedPhone.substring(country.code.length);
                        break;
                    }
                }
                
                if (cleanedPhone.length < 7) { // الحد الأدنى لسبعة أرقام بعد المفتاح
                    isFieldValid = false;
                    errorMessage = 'الرجاء إدخال رقم هاتف صحيح لا يقل عن 7 أرقام بعد رمز الدولة.';
                }
                break;
            case 'joining_reason':
                if (fieldToCheck.value.trim().length < 10) {
                    isFieldValid = false;
                    errorMessage = 'الرجاء كتابة سبب مُفصَّل لا يقل عن 10 أحرف.';
                }
                break;
            case 'payment_receipt':
                if (fieldToCheck.files.length === 0 && fieldToCheck.hasAttribute('required')) {
                    isFieldValid = false;
                    errorMessage = 'الرجاء إرفاق سند الإيصال.';
                }
                break;
        }

        if (isFieldValid && !fieldToCheck.checkValidity()) {
            isFieldValid = false;
            errorMessage = fieldToCheck.validationMessage || 'القيمة المُدخلة غير صحيحة.';
        }
    }

    if (isFieldValid) {
        fieldToCheck.classList.add('valid');
        return true;
    } else {
        fieldToCheck.classList.add('error');
        if (targetErrorDiv && errorMessage) {
            targetErrorDiv.textContent = errorMessage;
        }
        return false;
    }
}

function validateCurrentStep() {
    const currentStepDiv = document.querySelector(`.form-step[data-step="${currentStepIndex}"]`);
    const allFields = currentStepDiv.querySelectorAll('input, select, textarea'); 
    let isValid = true;
    let firstErrorField = null;

    allFields.forEach(field => {
        
        // 🚨 التعامل مع الحقول الشرطية في الخطوتين 1 و 3
        const conditionalAgeFields = field.closest('.conditional-age-fields');
        const conditionalAgeFieldsStep3 = field.closest('.conditional-age-fields-step3');
        const conditionalCourseFields = field.closest('.conditional-course-fields');
        
        // تجاهل الحقل المخفي لـ parent_name في التحقق، والاعتماد على الحقل المرئي
        if (field.id === 'parent_name_hidden') return; 

        const isHiddenConditional = (conditionalAgeFields && conditionalAgeFields.style.display === 'none') ||
                                    (conditionalAgeFieldsStep3 && conditionalAgeFieldsStep3.style.display === 'none') ||
                                    (conditionalCourseFields && conditionalCourseFields.style.display === 'none');

        if (isHiddenConditional) {
            field.classList.remove('error', 'valid');
            return; 
        }

        if (field.hasAttribute('required') || field.value.trim() !== '') {
            if (!validateField(field)) {
                isValid = false;
                if (!firstErrorField) {
                    firstErrorField = field; 
                }
            }
        }
    });

    if (!isValid) {
        if (firstErrorField) {
             firstErrorField.focus();
        }
        alert('الرجاء تعبئة جميع الحقول المطلوبة بشكل صحيح في هذا القسم للمتابعة.');
    }

    return isValid;
}


function handleConditionalFields() {
    const ageInput = document.getElementById('age');
    const courseSelect = document.getElementById('course_name');
    
    // حقول الخطوة 1
    const ageConditionalFieldsStep1 = document.querySelector('.conditional-age-fields'); 
    const parentNameInput = document.getElementById('parent_name'); // الحقل المرئي
    const parentNameHidden = document.getElementById('parent_name_hidden'); // الحقل المخفي
    
    // حقول الخطوة 3 (الجديدة)
    const ageConditionalFieldsStep3 = document.querySelector('.conditional-age-fields-step3');
    const parentPhoneInput = document.getElementById('parent_phone');
    
    const courseConditionalFields = document.querySelector('.conditional-course-fields');
    const experienceInput = document.getElementById('years_of_experience');
    const linkedinInput = document.getElementById('linkedin_url');


    if (!ageInput || !courseSelect) return;

    // 1. منطق العمر (< 18) - يؤثر على الخطوتين 1 و 3
    const age = parseInt(ageInput.value, 10);
    const isMinor = !isNaN(age) && age < 18;

    // --- الخطوة 1 ---
    if (isMinor) {
        ageConditionalFieldsStep1.style.display = 'block';
        parentNameInput.setAttribute('required', 'true');
    } else {
        ageConditionalFieldsStep1.style.display = 'none';
        parentNameInput.removeAttribute('required');
        // تفريغ الحقل المخفي عندما لا يكون مطلوباً لضمان إرسال قيمة فارغة
        if (parentNameHidden) parentNameHidden.value = ""; 
        showSuccess('parent_name_visible');
    }

    // --- الخطوة 3 ---
    if (isMinor) {
        ageConditionalFieldsStep3.style.display = 'block';
        parentPhoneInput.setAttribute('required', 'true');
    } else {
        ageConditionalFieldsStep3.style.display = 'none';
        parentPhoneInput.removeAttribute('required');
        showSuccess('parent_phone');
    }

    // 2. منطق الدورة (Advanced Course)
    const isAdvancedCourse = courseSelect.value === 'advanced'; 
    
    if (isAdvancedCourse) {
        courseConditionalFields.style.display = 'block';
        experienceInput.setAttribute('required', 'true');
        linkedinInput.setAttribute('required', 'true');
    } else {
        courseConditionalFields.style.display = 'none';
        experienceInput.removeAttribute('required');
        linkedinInput.removeAttribute('required');
        showSuccess('years_of_experience');
        showSuccess('linkedin_url');
    }
}


// ... (بقية دوال التنقل والتحكم تبقى كما هي)
function updateStepDisplay() {
    const stepsDivs = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-container .step');

    stepsDivs.forEach((step, index) => {
        const stepNumber = index + 1;
        if (stepNumber === currentStepIndex) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });

    progressSteps.forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');
        if (stepNumber === currentStepIndex) {
            step.classList.add('active');
        } else if (stepNumber < currentStepIndex) {
            step.classList.add('completed');
        }
    });
    
    const responseMessage = document.getElementById("generalErrorMessage");
    if (responseMessage) responseMessage.classList.remove('show');
}

function changeStep(newStep) {
    currentStepIndex = newStep;
    updateStepDisplay(); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToStep(index) {
    const currentStep = parseInt(document.querySelector('.form-step.active').getAttribute('data-step'));
    
    if (index > currentStep && !validateCurrentStep()) {
        alert('الرجاء إكمال الخطوة الحالية أولاً للمتابعة.');
        return;
    }
    
    if (index <= currentStepIndex || document.querySelectorAll('.progress-container .step')[index - 1].classList.contains('completed')) {
        currentStepIndex = index;
        updateStepDisplay();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}


function handleReasonTip() {
    const reasonInput = document.getElementById('joining_reason');
    const tipElement = document.getElementById('reason-tip');
    const minLength = 10; 

    if (!reasonInput || !tipElement) return;

    if (reasonInput.value.trim().length > 0 && reasonInput.value.trim().length < minLength) {
        tipElement.style.display = 'block';
    } else {
        tipElement.style.display = 'none';
    }
}


function setupDragAndDrop() {
    const dropArea = document.getElementById('dragAndDropArea');
    const fileInput = document.getElementById('payment_receipt');
    const previewContainer = document.getElementById('filePreviewContainer');

    if (!dropArea || !fileInput) return; 

    const handleFileSelection = (files) => {
        if (files.length > 0) {
            const file = files[0];
            const dropAreaContent = dropArea.querySelector('p:nth-child(2)');
            dropAreaContent.textContent = `تم اختيار الملف: ${file.name}`;
            displayFilePreview(file, previewContainer); 
            validateField(fileInput);
        } else {
            dropArea.querySelector('p:nth-child(2)').textContent = 'انقر للتحميل أو اسحب الملف هنا.';
            previewContainer.innerHTML = '';
            validateField(fileInput); 
        }
    };
    
    fileInput.addEventListener('change', () => handleFileSelection(fileInput.files));
    dropArea.addEventListener('click', () => fileInput.click());

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, e => {
            e.preventDefault();
            e.stopPropagation();
            if (eventName === 'dragenter' || eventName === 'dragover') {
                dropArea.classList.add('drag-over');
            } else if (eventName === 'dragleave' && e.target === dropArea) {
                 dropArea.classList.remove('drag-over');
            } else if (eventName === 'drop') {
                dropArea.classList.remove('drag-over');
                fileInput.files = e.dataTransfer.files;
                handleFileSelection(fileInput.files);
            }
        }, false);
    });
}

function displayFilePreview(file, container) {
    container.innerHTML = '';
    
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            container.appendChild(img);
        };
        reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
        const icon = document.createElement('div');
        icon.className = 'file-icon-placeholder';
        icon.innerHTML = '<i class="fas fa-file-pdf"></i>';
        container.appendChild(icon);
    } 
}

function toBase64(fileOrBlob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(fileOrBlob);
        reader.onload = () => resolve(reader.result.split(",")[1]); 
        reader.onerror = error => reject(error);
    });
}

function compressImage(file, quality = 0.7) {
    return new Promise((resolve) => {
        if (!file || !file.type.startsWith('image/')) {
            return resolve(file); 
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_SIZE = 1200; 

                if (width > MAX_SIZE || height > MAX_SIZE) {
                    if (width > height) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    } else {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    resolve(blob);
                }, file.type, quality);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// ------------------------------------------------------------------
// دوال التحكم في نافذة النجاح المتحركة (Success Modal)
// ------------------------------------------------------------------
function showSuccessDialog() {
    const overlay = document.getElementById("successOverlay");
    if (!overlay) return;
    
    // 1. إظهار النافذة
    overlay.classList.add("show");

    // 2. إعادة تشغيل الأنيميشن في كل مرة تظهر فيها
    const circle = overlay.querySelector(".circle");
    const tick = overlay.querySelector(".tick");
    
    // إعادة تعيين الأنيميشن
    circle.style.animation = "none";
    tick.style.animation = "none";
    void circle.offsetWidth; // Reflow
    
    // تشغيل الأنيميشن
    circle.style.animation = "draw-circle 1s ease forwards";
    tick.style.animation = "draw-tick 0.6s ease forwards 1s";
}

function closeDialog(){
    // التوجيه للرئيسية عند الضغط على زر الموافقة
    window.location.href = "index.html"; 
}


// ------------------------------------------------------------------
// منطق إرسال النموذج (Submit Logic) - تم تعديله للحل الجذري
// ------------------------------------------------------------------

form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!validateCurrentStep()) return; 

    const submitButton = document.getElementById('submitBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const responseMessage = document.getElementById("generalErrorMessage"); 
    
    submitButton.style.display = 'none';
    loadingIndicator.classList.add('active');
    responseMessage.textContent = '';
    
    
    const formData = new FormData(form);
    
    // 🚨🚨🚨 الحل الجذري: جمع البيانات يدوياً لضمان parent_name 🚨🚨🚨
    const payload = {};
    const formFields = form.querySelectorAll('input, select, textarea');
    
    // 1. نسخ القيمة من الحقل المرئي إلى الحقل المخفي
    const parentNameVisible = document.getElementById('parent_name');
    const parentNameHidden = document.getElementById('parent_name_hidden');

    if (parentNameVisible && parentNameHidden) {
        parentNameHidden.value = parentNameVisible.value.trim();
    }
    
    // 2. تجميع البيانات من جميع الحقول (الآن سيتم تضمين parent_name المخفي)
    formFields.forEach(field => {
        if (field.type === 'file') return; // الملفات تعالج بشكل منفصل
        
        // استبعاد الحقل المرئي الذي غيرنا اسمه
        if (field.name === 'parent_name_visible') return; 

        // جلب القيمة مباشرة، والتحصين ضد null/undefined
        const value = field.value ? field.value.trim() : "";
        payload[field.name] = value;
    });

    // --- معالجة الملفات ---
    let originalFile = formData.get("payment_receipt"); 
    let fileToSend = originalFile; 

    let base64File = "";
    let fileName = "";
    
    if (originalFile && originalFile.size > 0) {
        fileName = originalFile.name;

        if (originalFile.type.startsWith('image/')) {
            const compressedBlob = await compressImage(originalFile, 0.7); 
            fileToSend = compressedBlob;
        } 
        base64File = await toBase64(fileToSend);
    }
    
    payload.receiptFile = base64File;
    payload.receiptName = fileName;
    
    
    // --- تطبيق المفتاح الدولي ---
    const selectedNationality = payload.nationality; 
    const countryData = arabCountries.find(country => country.name === selectedNationality);
    const countryCode = countryData ? countryData.code : null;

    const finalizePhoneNumber = (phoneValue, code) => {
        let cleaned = cleanPhoneNumber(phoneValue);
        if (!code) return cleaned;

        if (cleaned.startsWith(code)) {
            return cleaned;
        }
        if (!cleaned.startsWith('+')) {
            return code + cleaned;
        }
        return cleaned; 
    };


  
    // 💡 تطبيق المفتاح الدولي على رقم الهاتف الأساسي ورقم ولي الأمر قبل الإرسال
    payload.phone_number = finalizePhoneNumber(payload.phone_number, countryCode);
    payload.parent_phone = finalizePhoneNumber(payload.parent_phone, countryCode);
    
    // ----------------------------
    
    // 🚨 (اختياري للتشخيص): يمكنك فك التعليق عن هذا السطر للتأكد من أن parent_name موجود الآن في الـ Console
    // console.log("Final Payload:", payload);

    try {
        const res = await fetch(scriptURL, {
            method: "POST",
            body: JSON.stringify(payload)
        });

        const response = await res.json();

        loadingIndicator.classList.remove('active');
        
        if (response.status === "success" || response.status === "نجاح") {
            // 🚨 التعديل الجديد: استدعاء النافذة المنبثقة المتحركة
            localStorage.setItem('user_full_name', payload.full_name);
            localStorage.setItem('user_email', payload.email); 
            
            form.reset();
            currentStepIndex = 1; 
            updateStepDisplay(); 
            document.getElementById('filePreviewContainer').innerHTML = '';
            document.getElementById('dragAndDropArea').querySelector('p:nth-child(2)').textContent = 'انقر للتحميل أو اسحب الملف هنا.';

            showSuccessDialog();

        } else {
            // حالة فشل الإرسال
            submitButton.style.display = 'block';
            responseMessage.innerHTML = '<span class="response-icon" style="color:#e74c3c;">❌</span> <strong>خطأ في الإرسال:</strong> ' + (response.message || 'حدث خطأ غير معروف أثناء الإرسال.');
            responseMessage.className = "error-message response-message show";
        }
    } catch (error) {
        loadingIndicator.classList.remove('active');
        submitButton.style.display = 'block';
        responseMessage.innerHTML = '<span class="response-icon" style="color:#e74c3c;">❌</span> <strong>خطأ في الاتصال:</strong> حدث خطأ في الاتصال، يرجى المحاولة لاحقاً.';
        responseMessage.className = "error-message response-message show";
        console.error(error);
    }
});


// ------------------------------------------------------------------
// دالة الإعداد الرئيسية (init)
// ------------------------------------------------------------------
function init() {
    populateCountrySelect(); 
    
    const storedName = localStorage.getItem('user_full_name');
    const storedEmail = localStorage.getItem('user_email');
    if (storedName && document.getElementById('full_name')) {
        document.getElementById('full_name').value = storedName;
    }
    if (storedEmail && document.getElementById('email')) {
        document.getElementById('email').value = storedEmail;
    }
    
    document.querySelectorAll('.btn-action').forEach(button => {
        button.addEventListener('click', () => {
            const isNext = button.classList.contains('next-btn');
            const newStep = isNext ? currentStepIndex + 1 : currentStepIndex - 1;

            if (isNext) {
                if (validateCurrentStep()) {
                     changeStep(newStep);
                }
            } else {
                 changeStep(newStep);
            }
        });
    });
    
    document.querySelectorAll('.progress-container .step').forEach((stepElement, index) => {
        stepElement.onclick = () => goToStep(index + 1);
    });

    setupDragAndDrop(); 
    updateStepDisplay(); 
    
    // 🚨 التعديل الجديد: ربط زر الموافقة في الـ Dialog بدالة الإغلاق
    const closeBtn = document.getElementById('closeDialogBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeDialog);
    }


    // --- ربط التحقق المباشر (Live Validation) ---
    document.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('blur', () => {
            validateField(field);
        });
        if (field.tagName === 'SELECT' || field.type === 'file') {
             field.addEventListener('change', () => {
                validateField(field);
            });
        }
        
        // ربط الحقل المرئي للتأكد من نسخ القيمة للحقل المخفي في الوقت المناسب
        if (field.id === 'parent_name') {
            field.addEventListener('input', () => {
                const parentNameHidden = document.getElementById('parent_name_hidden');
                if (parentNameHidden) {
                    parentNameHidden.value = field.value.trim();
                }
                validateField(field);
            });
        }
        
    });
    
    // === ربط الأحداث للحقول الشرطية والنفسية والمفتاح الدولي ===
    document.getElementById('age').addEventListener('input', handleConditionalFields);
    document.getElementById('course_name').addEventListener('change', handleConditionalFields);
    document.getElementById('joining_reason').addEventListener('keyup', handleReasonTip);
    
    // 💡 (التعديل 2) ربط دالة المفتاح الدولي عند اختيار الجنسية
    document.getElementById('nationality').addEventListener('change', handleNationalityChange);
    
    // تشغيل المنطق الشرطي والمفتاح الدولي عند التحميل
    handleConditionalFields();
    handleNationalityChange();
}


document.addEventListener('DOMContentLoaded', init);
