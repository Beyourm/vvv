(function() {
  // 💡 رابط التتبع (الذي يرسل إليه sendData)
  const TRACKER_ENDPOINT = "https://script.google.com/macros/s/AKfycbzxpOuX1SRSFW1e7Qj09afl0qixCxrKGi_ChXN-MqYHye3h-SZkjhc6XZwXnd0zL7TR/exec";
  
  // 💡 رابط مصدر البيانات الجديد (الذي يجلب منه الجدول)
  // يرجى استبدال هذا الرابط بالرابط الخاص بك الذي يرسل بيانات الجدول بصيغة JSON
  const DATA_SOURCE_ENDPOINT = "https://script.google.com/macros/s/AKfycbzamA0mnv0fPEXS4A_xjGIGtzSOnwUus4huljPGF8QjNLEdoegC-ByC5Xw_-3oTtVnjTA/exec"; 
  
  const COUNTRY_KEY = "visitorCountry";
  const SESSION_KEY = "analyticsSessionId";
  const BUFFER_KEY = "analyticsEventBuffer";
  
  let visitorCountry = "غير معروف";
  let sessionId = getSessionId();
  let lastEventTime = performance.now(); 
  
  const IDLE_TIMEOUT_MS = 30000;
  let activeTimeInSeconds = 0;
  let lastActivityTime = performance.now();
  let activityTimer;

  // --- 1. وظائف توليد المعرفات والمقاييس الأساسية (بدون تغيير) ---

  function generateUuid() {
      // توليد UUID بسيط (v4)
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
      });
  }

  function getSessionId() {
      let id = sessionStorage.getItem(SESSION_KEY);
      if (!id) {
          id = generateUuid();
          sessionStorage.setItem(SESSION_KEY, id);
      }
      return id;
  }

  function getDevice() {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua) && !/tablet/i.test(ua)) return "هاتف";
    if (/tablet/i.test(ua)) return "جهاز لوحي";
    return "كمبيوتر";
  }

  function getBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes("Edg")) return "Edge";
    if (ua.includes("Chrome") && !ua.includes("Chromium")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
    if (ua.includes("OPR") || ua.includes("Opera")) return "Opera";
    return "آخر/مخصص";
  }
  
  function getScreenInfo() {
      return `${window.screen.width}x${window.screen.height}`;
  }

  // --- 2. تحديد الموقع (Geolocation) (بدون تغيير) ---
  
  function fetchCountry(callback) {
    const cached = localStorage.getItem(COUNTRY_KEY);
    if (cached) {
      visitorCountry = cached;
      return callback();
    }

    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(location => {
        visitorCountry = location.country_name || "غير معروف";
        localStorage.setItem(COUNTRY_KEY, visitorCountry);
        callback();
      })
      .catch(() => callback()); 
  }

  // --- 3. وظيفة الإرسال مع Buffer وال Queue (تم تغيير ENDPOINT إلى TRACKER_ENDPOINT) ---
  
  const dataQueue = [];
  let isSending = false;

  function sendData(data) {
    const currentTime = performance.now();
    const timeSinceLastEvent = Math.round((currentTime - lastEventTime) / 1000); 
    lastEventTime = currentTime;
      
    const payload = {
        sessionId: sessionId,
        page: window.location.pathname,
        country: visitorCountry,
        device: getDevice(),
        browser: getBrowser(),
        screen_res: getScreenInfo(),
        time_since_last: timeSinceLastEvent, 
        timestamp: new Date().toISOString(),
        ...data
    };
      
    dataQueue.push(payload);
    if (!isSending) processQueue();
  }
  
  function trySendBufferedEvents() {
      try {
          const bufferedData = JSON.parse(localStorage.getItem(BUFFER_KEY) || '[]');
          if (bufferedData.length > 0) {
              dataQueue.unshift(...bufferedData);
              localStorage.removeItem(BUFFER_KEY);
              if (!isSending) processQueue();
          }
      } catch (e) {
          localStorage.removeItem(BUFFER_KEY);
      }
  }

  function bufferEvent(eventData) {
      try {
          const bufferedData = JSON.parse(localStorage.getItem(BUFFER_KEY) || '[]');
          bufferedData.push(eventData);
          if (bufferedData.length > 50) bufferedData.shift(); 
          localStorage.setItem(BUFFER_KEY, JSON.stringify(bufferedData));
      } catch (e) {
          // تجاهل الأخطاء
      }
  }

  function processQueue() {
    if (dataQueue.length === 0) {
      isSending = false;
      return;
    }

    isSending = true;
    const data = dataQueue.shift();
    const params = new URLSearchParams(data);
    const url = TRACKER_ENDPOINT + "?" + params.toString(); // 💡 استخدام TRACKER_ENDPOINT

    if (navigator.sendBeacon) {
        const success = navigator.sendBeacon(url);
        if (!success) bufferEvent(data); 
        processQueue(); 
    } else {
        fetch(url, { keepalive: true, signal: AbortSignal.timeout(500) })
            .then(res => {
                if (!res.ok) throw new Error('Failed to send');
            })
            .catch(() => {
                bufferEvent(data); 
            })
            .finally(() => {
                processQueue();
            });
    }
  }
  
  // --- 4. وظيفة جلب البيانات وملء الجدول (التحسين المطلوب) ---

  // وظيفة مساعدة لإنشاء وسم الحالة HTML
  function getStatusHtml(status) {
      const statusClass = status === 'مكتمل' ? 'complete' : status === 'معلق' ? 'pending' : 'canceled';
      return `<span class="status ${statusClass}">${status}</span>`;
  }
  
  async function fetchAndPopulateTable() {
    const tableBody = document.querySelector('.scrollable-table-content tbody');
    if (!tableBody) return; // تأكد من وجود وسم tbody

    try {
        // يمكنك تمرير وسائط بحث هنا إذا لزم الأمر
        const response = await fetch(DATA_SOURCE_ENDPOINT); 
        const data = await response.json(); 

        // تأكد من أن البيانات هي مصفوفة من العمليات
        if (!Array.isArray(data) || data.length === 0) {
             tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">لا توجد عمليات حاليًا.</td></tr>';
             return;
        }

        // مسح الصفوف الموجودة (الصفوف الثابتة في HTML)
        tableBody.innerHTML = ''; 

        // ملء الجدول بالبيانات الجديدة
        data.forEach(item => {
            const row = tableBody.insertRow();
            
            // افتراض أن هيكل بيانات الـ JSON هو:
            // { id: '#A123', user: 'اسم', operation: 'العملية', date: 'التاريخ', status: 'الحالة' }
            row.innerHTML = `
                <td>${item.id || 'N/A'}</td>
                <td>${item.user || 'N/A'}</td>
                <td>${item.operation || 'N/A'}</td>
                <td>${item.date || 'N/A'}</td>
                <td>${getStatusHtml(item.status || 'N/A')}</td>
            `;
        });

        // إرسال حدث تتبع بنجاح تحميل البيانات
        sendData({
          action: "تحميل بيانات الجدول",
          event_type: "DataLoad",
          details: `تم تحميل ${data.length} صفًا للجدول`
        });

    } catch (error) {
        console.error("خطأ في جلب بيانات الجدول:", error);
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #ef5350;">فشل في تحميل بيانات العمليات.</td></tr>';
        // إرسال حدث تتبع بفشل تحميل البيانات
        sendData({
          action: "فشل تحميل البيانات",
          event_type: "DataLoadError",
          details: error.message
        });
    }
  }

  // --- 5. تتبع العناصر المشاهدة (Modals / Scroll View Tracking) (بدون تغيير) ---

  function trackVisibleElements() {
      // ... (الكود السابق لوظيفة trackVisibleElements)
      if (!('IntersectionObserver' in window)) return;

      const observer = new IntersectionObserver((entries, obs) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  const element = entry.target;
                  const trackAction = element.dataset.viewAction || "عنصر مرئي";
                  const trackValue = element.dataset.viewValue || element.id || element.className.split(' ')[0];
                  
                  sendData({
                      action: trackAction,
                      event_type: "ElementView",
                      details: `تمت مشاهدة: ${trackValue}`
                  });
                  obs.unobserve(element); 
              }
          });
      }, {
          root: null, 
          threshold: 0.5 
      });

      document.querySelectorAll('[data-view-track="true"]').forEach(el => {
          observer.observe(el);
      });
  }

  // --- 6. الإعداد الأولي (Initialization) ---
  
  fetchCountry(() => {
    trySendBufferedEvents(); 

    // تسجيل الزيارة
    sendData({
      action: "زيارة",
      ref: document.referrer || "مباشر",
      details: "تحميل الصفحة بنجاح"
    });

    // 💡 جديد: جلب البيانات وتعبئة الجدول مباشرة بعد تسجيل الزيارة
    fetchAndPopulateTable(); 

    // تفعيل تتبع الأنشطة (Active Time)
    initActivityTracking(); // يجب أن تكون هذه الوظائف معرفة في مكان ما

    // تفعيل التتبعات (يجب أن تكون هذه الوظائف معرفة في مكان ما)
    // trackPerformance(); 
    // trackScrollDepth();
    // trackFormSubmissions();
    // trackDownloads();         
    // trackCopy();              
    // trackCustomElements();    
    trackVisibleElements(); 

    // تتبع النقر على الروابط والعناصر المخصصة
    document.addEventListener("click", e => {
      // تفادي التكرار إذا كان العنصر يحتوي على data-track
      if (e.target.closest('[data-track="true"]')) {
          // يجب أن يتم استدعاء وظيفة trackCustomElements هنا إذا كانت معرفة
          // return trackCustomElements(e);
          return;
      }
        
      const link = e.target.closest("a");
      if (link) { 
        sendData({
          action: "نقرة على رابط",
          event_type: "LinkClick",
          ref: link.href,
          link_text: link.textContent.trim().slice(0, 50) || link.href.slice(0, 50)
        });
      }
    });

    // تتبع ملخص الجلسة عند المغادرة
    window.addEventListener('beforeunload', () => {
        const totalTimeSpent = Math.round(performance.now() / 1000); 
        clearTimeout(activityTimer); 
        
        sendData({
             action: "مغادرة",
             event_type: "SessionSummary",
             details: `Session Time: ${totalTimeSpent}s, Active Time: ${activeTimeInSeconds}s`
        });
    });

  });

  // --- (الوظائف المفقودة مثل initActivityTracking, trackPerformance إلخ... 
  //      يجب أن تكون موجودة في النسخة الكاملة من tracker.js لتجنب الأخطاء.)
  //      لغرض هذا التحديث، نحن نفترض وجودها.

  // 💡 إضافة تعريفات وهمية للوظائف المفقودة لتشغيل الكود دون أخطاء (للاستخدام الفوري)
  function initActivityTracking() { 
      // الوظيفة المنطقية لتتبع الأنشطة
  }
  // function trackPerformance() {}
  // function trackScrollDepth() {}
  // function trackFormSubmissions() {}
  // function trackDownloads() {}
  // function trackCopy() {}
  // function trackCustomElements(e) {}
  
})();

