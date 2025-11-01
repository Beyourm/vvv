/**
 * التحقق من كود المسوّق (marketer_id)
 * @param {string} marketerId - كود التخفيض المدخل من المستخدم
 * @param {string} validationUrl - رابط Apps Script للتحقق
 * @returns {Promise<Object>} كائن JSON يحتوي على الحالة والرسالة
 */
async function validateMarketerCode(marketerId, validationUrl) {
  if (!marketerId || marketerId.length !== 8) {
    throw new Error("الرجاء إدخال كود التخفيض بشكل صحيح (8 خانات).");
  }

  if (!validationUrl || validationUrl.includes("YOUR_VALIDATION_SCRIPT_URL_HERE")) {
    throw new Error("لم يتم تعيين رابط التحقق من الكود.");
  }

  const response = await fetch(`${validationUrl}?marketer_id=${encodeURIComponent(marketerId)}`);
  if (!response.ok) {
    throw new Error("فشل الاتصال بخادم التحقق.");
  }

  const result = await response.json();
  return result;
}