 // تفعيل الوضع الداكن مع حفظ التفضيل
document.addEventListener("DOMContentLoaded", function(){
  const toggle = document.getElementById('dark-mode-toggle');
  const root = document.documentElement;
  const key = 'darkMode';

  function applyDark(isDark){
    root.classList.toggle('dark', isDark);
    toggle.checked = isDark;
    localStorage.setItem(key, isDark ? 'on' : 'off');
  }

  const saved = localStorage.getItem(key);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if(saved === 'on') applyDark(true);
  else if(saved === 'off') applyDark(false);
  else applyDark(prefersDark);

  toggle.addEventListener('change', () => applyDark(toggle.checked));
});