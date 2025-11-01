// jsc/success_stories_interactiveStat.js

// رابط API لجلب البيانات من Google Sheets
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzOctfCiiqEETEyzuZKEo-D-rCfLUBGXISoiFuOQwl0arcVFj0fB2QXEJOfDdtQ0gBPrQ/exec";

// ======= 5. التحكم بالإحصائية التفاعلية =======
async function checkAgeSuccess() {
    const ageInput = document.getElementById('ageInput');
    const resultDiv = document.getElementById('interactiveResult');
    
    // التحقق من وجود العناصر
    if (!ageInput || !resultDiv) return;

    const age = parseInt(ageInput.value);

    if (isNaN(age) || age < 15 || age > 65) {
        resultDiv.innerHTML = '<span style="color: #e74c3c;">من فضلك أدخل عمراً صحيحاً بين 15 و 65.</span>';
        return;
    }

    try {
        // جلب البيانات من Google Sheet
        const response = await fetch(SHEET_API_URL);
        const data = await response.json();

        // استخراج العمود C (العمر)
        const ages = data.map(row => parseInt(row.age)).filter(v => !isNaN(v));

        // فلترة البيانات بحسب العمر المدخل
        const filtered = ages.filter(a => a === age);

        // حساب عدد النتائج
        const count = filtered.length;

        if (count > 0) {
            resultDiv.innerHTML = `<span style="color: var(--success-color);">
                رائع! وجدنا <strong>${count}</strong> شخصاً في قاعدة بياناتنا بعمر <strong>${age}</strong> نجحوا في تحقيق أهدافهم. 🚀
            </span>`;
        } else {
            resultDiv.innerHTML = `<span style="color: #f39c12;">
                لم نجد بيانات مباشرة لعمر <strong>${age}</strong> حالياً، لكن يمكنك أن تكون الأول! ✨
            </span>`;
        }

    } catch (error) {
        console.error("خطأ أثناء جلب البيانات:", error);
        resultDiv.innerHTML = '<span style="color: #e74c3c;">حدث خطأ أثناء جلب البيانات. حاول مرة أخرى لاحقاً.</span>';
    }
}