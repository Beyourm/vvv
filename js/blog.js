document.addEventListener('DOMContentLoaded', () => {
    // ** رابط Web App API الذي تم نشره **
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzciLhQusx5EYjZU_AG_UCTivhd5U5kjD10DgbiBF8F7vVDL0QhU2tw9PokJ3Bn2IhzMQ/exec';
    
    // عناصر الشبكة والأقسام
    const categoriesContainer = document.querySelector('.categories');
    const postsGrid = document.querySelector('.blog-posts-grid');
    
    // عناصر الـ Modal (يتم البحث عنها بعد التأكد من وجود postModal)
    const postModal = document.getElementById('post-modal');
    
    const closeButton = postModal ? postModal.querySelector('.close-button') : null;
    const postImage = postModal ? document.getElementById('post-image') : null;
    const postCategory = postModal ? document.getElementById('post-category') : null;
    const postTitle = postModal ? document.getElementById('post-title') : null;
    const postDate = postModal ? document.getElementById('post-date') : null;
    const postBody = postModal ? document.getElementById('post-body') : null;

    const CORE_HEADERS = ['المعرف', 'العنوان', 'الملخص', 'القسم', 'صورة_الغلاف', 'التاريخ', 'المحتوى_الكامل'];

    // ----------------------------------------------------
    // 1. وظيفة بناء بطاقة مقال
    // ----------------------------------------------------
    
    function createPostCard(post, index) {
        const card = document.createElement('div');
        card.className = 'post-card'; 
        card.setAttribute('data-aos', 'fade-up');
        if (index % 3 !== 0) card.setAttribute('data-aos-delay', (index % 3) * 100);
        card.setAttribute('data-post-id', post['المعرف']);
        
        let date = '---';
        try {
            if (post['التاريخ']) date = new Date(post['التاريخ']).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
        } catch (e) {}

        card.innerHTML = `
            <img src="${post['صورة_الغلاف'] || 'https://via.placeholder.com/400x250'}" alt="${post['العنوان']}">
            <div class="post-content">
                <span class="post-category">${post['القسم'] || 'غير مصنف'}</span>
                <h3>${post['العنوان']}</h3>
                <p>${post['الملخص']}</p>
                <a href="#" class="read-more">اقرأ المزيد <i class="fas fa-chevron-left"></i></a>
                <div class="post-meta">
                    <span><i class="fas fa-calendar"></i> ${date}</span>
                </div>
            </div>
        `;

        const readMoreLink = card.querySelector('.read-more');
        if (readMoreLink) {
            readMoreLink.addEventListener('click', (event) => {
                event.preventDefault();
                showModal(post['المعرف']);
            });
        }
        return card;
    }

    // ----------------------------------------------------
    // 2. وظيفة جلب وعرض الفئات والمقالات
    // ----------------------------------------------------
    
    async function loadContent() {
        if (!WEB_APP_URL || !postsGrid || !categoriesContainer) return console.error('أحد العناصر الأساسية غير موجود.');

        try {
            // استخدام response.json() المباشر (الأكثر موثوقية بعد تعديل Apps Script)
            const response = await fetch(WEB_APP_URL, { mode: 'cors' }); 
            if (!response.ok) throw new Error('Network response was not ok');
            
            // 🛑 التعديل الأخير هنا 🛑
            const data = await response.json(); 

            if (data.status === 'success') {
                // الفئات (الأقسام)
                categoriesContainer.innerHTML = '';
                const allTag = document.createElement('span');
                allTag.className = 'category-tag active';
                allTag.textContent = 'الكل';
                categoriesContainer.appendChild(allTag);

                // استخدام slice(7) للبدء من العنصر الثامن (الأقسام الفعلية)
                const realCategories = data.categories.slice(7);
                
                realCategories.forEach(cat => {
                    const cleanCategory = cat.toString().trim();
                    if (cleanCategory.length > 0) {
                        const tag = document.createElement('span');
                        tag.className = 'category-tag';
                        tag.textContent = cleanCategory;
                        categoriesContainer.appendChild(tag);
                    }
                });

                // المقالات
                postsGrid.innerHTML = '';
                if (data.posts.length === 0) {
                    postsGrid.innerHTML = '<p style="text-align:center;color:#888;">لا يوجد مقالات حالياً</p>';
                    return;
                }

                data.posts.forEach((post, index) => {
                    // فلترة المقال للتركيز على الأعمدة الأساسية فقط
                    const filteredPost = CORE_HEADERS.reduce((obj, key) => {
                        if (post[key] !== undefined) obj[key] = post[key];
                        return obj;
                    }, {});
                    if (filteredPost['المعرف']) postsGrid.appendChild(createPostCard(filteredPost, index));
                });
            }
        } catch (err) {
            console.error("فشل في تحميل المحتوى أو تحليل الـ JSON:", err);
            // يظهر هذا الخطأ إذا كان هناك مشكلة في CORS أو إذا كانت ملفات الـ Modal مفقودة في HTML
            postsGrid.innerHTML = '<p style="text-align:center;color:red;">فشل تحميل المحتوى. تأكد من إعدادات API وعناصر Modal في HTML.</p>';
        }
    }

    // ----------------------------------------------------
    // 3. وظيفة جلب مقال واحد وملء الـ Modal
    // ----------------------------------------------------
    
    async function fetchPostDetails(postId) {
        const url = `${WEB_APP_URL}?action=getPost&postId=${postId}`;
        
        // التحقق من وجود عناصر الـ Modal قبل محاولة ملئها
        if (!postImage || !postTitle || !postBody) return console.error("عناصر الـ Modal غير موجودة!");

        try {
            const response = await fetch(url, { mode: 'cors' });
            if (!response.ok) throw new Error('Failed to fetch post details');
            
            const data = await response.json(); // استخدام .json() مباشرة

            if (data.status === 'success' && data.post) {
                const post = data.post;
                let date = post['التاريخ'] ? new Date(post['التاريخ']).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }) : '---';
                
                postImage.src = post['صورة_الغلاف'] || 'https://via.placeholder.com/900x400';
                postCategory.textContent = post['القسم'] || 'غير مصنف';
                postTitle.textContent = post['العنوان'];
                postDate.innerHTML = `<i class="fas fa-calendar"></i> ${date}`;
                postBody.innerHTML = post['المحتوى_الكامل'] || `<p>المحتوى غير متوفر.</p>`;
            } else {
                postTitle.textContent = 'خطأ';
                postBody.innerHTML = `<p>تعذر تحميل المقال رقم ${postId}.</p>`;
            }
        } catch (err) {
            console.error("خطأ في جلب تفاصيل المقال:", err);
            postTitle.textContent = 'خطأ في الاتصال';
            postBody.innerHTML = `<p>حدث خطأ أثناء الاتصال بالخادم.</p>`;
        }
    }

    // ----------------------------------------------------
    // 4. وظائف التحكم في الواجهة المنبثقة (Modal)
    // ----------------------------------------------------
    
    function showModal(postId) {
        if (!postModal) return;
        fetchPostDetails(postId);
        postModal.style.display = 'flex'; 
        document.body.style.overflow = 'hidden';
        postModal.scrollTop = 0;
    }

    function hideModal() {
        if (!postModal) return;
        postModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    // ----------------------------------------------------
    // 5. ربط الأحداث
    // ----------------------------------------------------
    
    if (closeButton) closeButton.addEventListener('click', hideModal);
    if (postModal) postModal.addEventListener('click', e => { if (e.target === postModal) hideModal(); });

    // تشغيل وظيفة التحميل
    loadContent();
});
