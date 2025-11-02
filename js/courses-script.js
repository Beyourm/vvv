// ملف: js/courses-script.js


document.addEventListener('DOMContentLoaded', () => {
    // 1. تعريف الرابط الذي سيتم من خلاله جلب البيانات (يجب استبداله برابط نشر السكربت الحقيقي)
    const sheetsAPIUrl = 'https://script.google.com/macros/s/AKfycbwm6l3Wi5vG5Hzt2WWd72AU_epgNDX2eK4i_Zt9UcVCa21B5i_a_TVMNXYwTk1LKATN/exec?page=courses'; 
    
    // العناصر الأساسية
    const searchInput = document.getElementById('courseSearch');
    const searchResultsInfo = document.getElementById('searchResultsInfo');
    const courseSections = document.querySelectorAll('section');
    const sectionTitles = document.querySelectorAll('.section-title');

    // 2. دالة لبناء زر دورة (تم تعديلها لاستخدام خصائص name و iconClass)
    // 2. دالة لبناء زر دورة (تم تعديلها لاستخدام خصائص name و iconClass)
function createCourseButton(course) {
    const courseButton = document.createElement('a');
    
    // الحل النهائي: تأكد أن course.name موجود قبل استخدامه
    const courseTitle = (course.name ? String(course.name).trim() : 'دورة غير معرفة'); 
    
    courseButton.href = `cs.html?id=${course.id}`;
    courseButton.className = 'course-button';
    courseButton.setAttribute('aria-label', `دورة ${courseTitle}`);
    
    // استخدام خاصية iconClass
    const icon = document.createElement('i');
    icon.className = course.iconClass || 'fas fa-graduation-cap';
    courseButton.appendChild(icon);
    
    // اسم الدورة
    const span = document.createElement('span');
    span.textContent = courseTitle; // استخدام القيمة النظيفة والمُؤكّدة
    courseButton.appendChild(span);

    return courseButton;
}


    // 3. دالة لجلب البيانات من الـ API وبناء الأزرار (تم تعديلها لاستخدام خاصية sectionId)
    async function loadCourses() {
        try {
            // جلب البيانات من Google Sheets API المنشورة
            const response = await fetch(sheetsAPIUrl);
            if (!response.ok) {
                // قد يكون الخطأ هنا هو فشل في الاستجابة (مثل خطأ 500)، وهنا يجب أن نقوم بإلقاء الخطأ
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }
            
            // تحويل الاستجابة إلى JSON
            const coursesData = await response.json(); 
            
            // بما أن كود Google Apps Script القديم لم يرجع البيانات في خاصية .data، بل كمصفوفة مباشرة، سنستخدم المصفوفة مباشرة
            const courses = coursesData; 

            if (!Array.isArray(courses)) {
                throw new Error("API response is not an array of courses.");
            }

            // المرور على كل دورة وبناء زرها وإضافته للقسم المناسب
            courses.forEach(course => {
                // استخدام خاصية sectionId بدلاً من ID_Department
                const departmentId = course.sectionId; 
                const departmentSection = document.getElementById(departmentId);
                
                if (departmentSection) {
                    const courseGrid = departmentSection.querySelector('.course-grid');
                    if (courseGrid) {
                        const courseButton = createCourseButton(course);
                        courseGrid.appendChild(courseButton);
                    }
                }
            });
            
            // بعد تحميل وبناء الأزرار، نقوم بتفعيل وظائف البحث والطي
            initializeSearchAndToggle();

        } catch (error) {
            console.error('Error loading courses:', error);
            // عرض رسالة الخطأ للمستخدم
            searchResultsInfo.textContent = 'عذراً، حدث خطأ في تحميل قائمة الدورات.';
        }
    }

    // 4. دالة لتفعيل وظائف البحث والطي بعد تحميل الدورات (لا تحتاج لتعديل جوهري)
    function initializeSearchAndToggle() {
        // يجب أن يتم جلب الأزرار هنا (بعد بنائها) لتسجيل الأحداث عليها
        const allDynamicButtons = document.querySelectorAll('.course-button');
        
        // وظيفة الطي والتوسيع (من كودك الأصلي)
        sectionTitles.forEach(title => {
            title.addEventListener('click', () => {
                const courseGrid = title.nextElementSibling;
                
                // إغلاق أي قسم آخر مفتوح
                document.querySelectorAll('.course-grid.active').forEach(grid => {
                    if (grid !== courseGrid) {
                        grid.classList.remove('active');
                        grid.previousElementSibling.classList.remove('active');
                        grid.style.maxHeight = "0";
                        grid.style.paddingTop = "0";
                        grid.style.paddingBottom = "0";
                    }
                });
                
                courseGrid.classList.toggle('active');
                title.classList.toggle('active');

                // إعادة حساب الـ max-height لضمان سلاسة الانتقال
                if (courseGrid.classList.contains('active')) {
                    courseGrid.style.maxHeight = courseGrid.scrollHeight + "px";
                    courseGrid.style.paddingTop = "10px";
                    courseGrid.style.paddingBottom = "20px";
                } else {
                    courseGrid.style.maxHeight = "0";
                    courseGrid.style.paddingTop = "0";
                    courseGrid.style.paddingBottom = "0";
                }
            });
        });
        
        // وظيفة البحث (من كودك الأصلي، معدلة لاستخدام الأزرار الديناميكية)
        const updateSearchResults = () => {
            const searchTerm = searchInput.value.toLowerCase().trim();
            let foundCount = 0;
            const sectionsToDisplay = new Set();
            
            // استخدم allDynamicButtons بدلاً من allCourseButtons الثابتة
            allDynamicButtons.forEach(button => {
                const buttonText = button.textContent.toLowerCase();
                const parentSection = button.closest('section');
                
                if (searchTerm === '' || buttonText.includes(searchTerm)) {
                    button.style.display = 'flex';
                    foundCount++;
                    sectionsToDisplay.add(parentSection.id);
                } else {
                    button.style.display = 'none';
                }
            });

            courseSections.forEach(section => {
                const sectionGrid = section.querySelector('.course-grid');
                const sectionTitle = section.querySelector('.section-title');
                
                // منطق عرض القسم بناءً على نتائج البحث (للحفاظ على التنسيق الأصلي)
                if (sectionsToDisplay.has(section.id) && searchTerm !== '') {
                    // فقط قم بتوسيع القسم الذي يحتوي على نتائج مطابقة
                    sectionGrid.classList.add('active');
                    sectionTitle.classList.add('active');
                    sectionGrid.style.maxHeight = sectionGrid.scrollHeight + "px";
                    sectionGrid.style.paddingTop = "10px";
                    sectionGrid.style.paddingBottom = "20px";
                    section.style.display = 'block'; // تأكد من عرض القسم نفسه
                } else {
                    // إخفاء الأقسام التي لا تحتوي على نتائج في وضع البحث
                    if (searchTerm !== '') {
                         section.style.display = 'none'; 
                    } else {
                        // إغلاق جميع الأقسام والعودة للوضع الطبيعي بعد مسح البحث
                        section.style.display = 'block';
                        sectionGrid.classList.remove('active');
                        sectionTitle.classList.remove('active');
                        sectionGrid.style.maxHeight = "0";
                        sectionGrid.style.paddingTop = "0";
                        sectionGrid.style.paddingBottom = "0";
                    }
                }
            });

            if (searchTerm === '') {
                searchResultsInfo.textContent = '';
                // تأكد من عرض جميع الأزرار عند مسح مربع البحث
                document.querySelectorAll('.course-button').forEach(button => button.style.display = 'flex');
            } else {
                if (foundCount > 0) {
                    searchResultsInfo.textContent = `تم العثور على ${foundCount} دورة.`;
                } else {
                    searchResultsInfo.textContent = 'لم يتم العثور على أي دورة.';
                }
            }
        };

        searchInput.addEventListener('input', updateSearchResults);
        
        // لتشغيل البحث عند الضغط على زر البحث أيضاً
        document.getElementById('searchButton').addEventListener('click', updateSearchResults);

    }

    // 5. استدعاء دالة تحميل الدورات عند بدء التشغيل
    loadCourses();
});



