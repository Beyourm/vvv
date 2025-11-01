// JS_T/filter.js

/**
 * محتوى قسم أدوات التصفية.
 * سيتم تحميل هذا المحتوى ديناميكياً إلى الصفحة بواسطة script.js.
 */
const filterSectionHTML = `
    <section class="filter-section animated-section" id="filterSection">
        <input type="text" id="searchInput" placeholder="ابحث بالاسم أو التخصص..." aria-label="البحث عن المدربين">
        <select id="specialtyFilter" aria-label="تصفية حسب التخصص">
            <option value="">كل التخصصات</option>
            <option value="القيادة">القيادة الإدارية</option>
            <option value="الرقمي">التحول الرقمي</option>
            <option value="البرمجة">البرمجة والتطوير</option>
        </select>
        <select id="experienceFilter" aria-label="تصفية حسب سنوات الخبرة">
            <option value="">كل الخبرات</option>
            <option value="10">خبرة أكثر من 10 سنوات</option>
            <option value="5">خبرة أكثر من 5 سنوات</option>
        </select>
        <button onclick="applyFilters()"><i class="fas fa-filter"></i> تصفية</button>
    </section>
    `;

