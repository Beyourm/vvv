// js/courseList.js

// رابط Web App من Apps Script
const scriptUrl = "https://script.google.com/macros/s/AKfycbxHyHcUY1hN5K8o4POBiiEZTw2MK72TNyLdNGqXcTsdJRQ5xUP3BJxjZUxAyS5lg9PZOA/exec";

async function populateCourses() {
  const courseSelect = document.getElementById("course_name");
  if (!courseSelect) return;

  // خيار افتراضي أثناء التحميل
  courseSelect.innerHTML = '<option value="">-- جاري تحميل الدورات... --</option>';

  try {
    const response = await fetch(scriptUrl);
    if (!response.ok) {
      throw new Error("Network response was not ok: " + response.statusText);
    }

    const courses = await response.json(); // مصفوفة نصوص من Apps Script

    // إعادة التهيئة
    courseSelect.innerHTML = '<option value="">-- اختر دورتك --</option>';

    // تعبئة القائمة بالدورات
    courses.forEach((title, index) => {
      const option = document.createElement("option");
      option.value = `course_${index + 1}`; // قيمة افتراضية
      option.textContent = title;           // النص من الجدول
      courseSelect.appendChild(option);
    });

  } catch (error) {
    console.error("خطأ في جلب الدورات:", error);
    courseSelect.innerHTML = '<option value="">-- تعذَّر تحميل الدورات --</option>';
  }
}

// تنفيذ عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", populateCourses);