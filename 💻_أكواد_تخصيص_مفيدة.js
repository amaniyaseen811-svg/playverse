/**
 * PlayVerse Enhanced - كود تخصيص وتطويرات مستقبلية
 * استخدمي هذه الأكواد لتطوير الميزات
 */

// ====== 1. تغيير ألوان الدوائر ======
// ابحثي عن الأقسام التالية في الـ HTML وعدّليها:

const colorSchemes = {
  // النظام الحالي (أزرق، أخضر، برتقالي، وردي)
  'default': [
    'rgba(59, 130, 246, 0.85)',    // أزرق
    'rgba(34, 197, 94, 0.65)',     // أخضر
    'rgba(249, 115, 22, 0.75)',    // برتقالي
    'rgba(236, 72, 153, 0.85)'     // وردي
  ],
  
  // خيارات إضافية
  'sunset': [
    'rgba(249, 115, 22, 0.9)',     // برتقالي
    'rgba(239, 68, 68, 0.8)',      // أحمر
    'rgba(236, 72, 153, 0.85)',    // وردي
    'rgba(168, 85, 247, 0.8)'      // بنفسجي
  ],
  
  'ocean': [
    'rgba(6, 182, 212, 0.85)',     // سماوي
    'rgba(34, 197, 94, 0.75)',     // أخضر
    'rgba(59, 130, 246, 0.8)',     // أزرق
    'rgba(147, 51, 234, 0.85)'     // بنفسجي
  ],
  
  'neon': [
    'rgba(0, 255, 200, 0.9)',      // نيون أخضر
    'rgba(255, 0, 255, 0.8)',      // نيون بنفسجي
    'rgba(0, 200, 255, 0.85)',     // نيون أزرق
    'rgba(255, 100, 0, 0.9)'       // نيون برتقالي
  ]
};

// ====== 2. إضافة نظام ألوان جديد ======
function setColorScheme(schemeName) {
  const colors = colorSchemes[schemeName] || colorSchemes.default;
  
  // تحديث الـ CSS variables
  const style = document.documentElement.style;
  style.setProperty('--color-1', colors[0]);
  style.setProperty('--color-2', colors[1]);
  style.setProperty('--color-3', colors[2]);
  style.setProperty('--color-4', colors[3]);
}

// الاستخدام: setColorScheme('sunset');

// ====== 3. إضافة نظام الثيم (Light/Dark) ======
function toggleDarkMode(enabled = true) {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const newTheme = enabled ? 'dark' : 'light';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('playverse-theme', newTheme);
  
  if (enabled) {
    document.body.style.background = '#0a0a1a';
  } else {
    document.body.style.background = '#f5f5f5';
  }
}

// الاستخدام: toggleDarkMode(true); // للـ dark mode

// ====== 4. إضافة ألعاب جديدة ديناميكياً ======
function addGame(emoji, name, link = '#') {
  const gamesGrid = document.getElementById('gamesGrid');
  
  const card = document.createElement('div');
  card.className = 'game-card';
  card.innerHTML = emoji;
  card.style.cursor = 'pointer';
  card.onclick = () => {
    if (link !== '#') window.location.href = link;
  };
  
  gamesGrid.appendChild(card);
  
  // تأثير الإضافة
  card.style.animation = 'fadeIn 0.5s ease-out';
}

// الاستخدام:
// addGame('🎲', 'Dice Game', '/games/dice.html');
// addGame('🧩', 'Puzzle', '/games/puzzle.html');

// ====== 5. نظام إحصائيات اللعبة ======
class GameStats {
  constructor() {
    this.data = JSON.parse(localStorage.getItem('playverse-stats')) || {
      gamesPlayed: 0,
      totalScore: 0,
      achievements: [],
      lastPlayed: null
    };
  }
  
  play(gameName, score = 0) {
    this.data.gamesPlayed++;
    this.data.totalScore += score;
    this.data.lastPlayed = new Date().toISOString();
    this.save();
  }
  
  unlockAchievement(achievement) {
    if (!this.data.achievements.includes(achievement)) {
      this.data.achievements.push(achievement);
      this.save();
      return true;
    }
    return false;
  }
  
  save() {
    localStorage.setItem('playverse-stats', JSON.stringify(this.data));
  }
  
  getStats() {
    return this.data;
  }
}

// الاستخدام:
// const stats = new GameStats();
// stats.play('Chemistry', 150);
// stats.unlockAchievement('first-game');

// ====== 6. نظام الإخطارات ======
function showNotification(message, type = 'info', duration = 3000) {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    font-size: 14px;
    z-index: 10000;
    animation: slideUp 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideDown 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

// الاستخدام:
// showNotification('تم فتح اللعبة بنجاح!', 'success');
// showNotification('حدث خطأ!', 'error');

// ====== 7. نظام الترجمة ديناميكي ======
class MultiLanguage {
  constructor() {
    this.translations = {
      ar: {
        'learn': 'تعلّم',
        'play': 'لعب',
        'compete': 'تنافس',
        'games': 'الألعاب',
        'subjects': 'المواد'
      },
      en: {
        'learn': 'Learn',
        'play': 'Play',
        'compete': 'Compete',
        'games': 'Games',
        'subjects': 'Subjects'
      },
      fr: {
        'learn': 'Apprendre',
        'play': 'Jouer',
        'compete': 'Concourir',
        'games': 'Jeux',
        'subjects': 'Sujets'
      }
    };
    
    this.currentLang = localStorage.getItem('playverse-lang') || 'ar';
  }
  
  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('playverse-lang', lang);
      this.applyLanguage();
    }
  }
  
  get(key) {
    return this.translations[this.currentLang][key] || key;
  }
  
  applyLanguage() {
    document.documentElement.dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = this.currentLang;
  }
}

// الاستخدام:
// const i18n = new MultiLanguage();
// i18n.setLanguage('en');
// console.log(i18n.get('learn')); // "Learn"

// ====== 8. نظام تتبع الأداء ======
class PerformanceTracker {
  constructor() {
    this.metrics = {};
  }
  
  startMeasure(label) {
    this.metrics[label] = performance.now();
  }
  
  endMeasure(label) {
    if (this.metrics[label]) {
      const duration = performance.now() - this.metrics[label];
      console.log(`${label}: ${duration.toFixed(2)}ms`);
      return duration;
    }
  }
  
  getMemory() {
    if (performance.memory) {
      return {
        usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
        totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
        jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
      };
    }
    return null;
  }
}

// الاستخدام:
// const perf = new PerformanceTracker();
// perf.startMeasure('gameLoad');
// // ... بعض العمليات
// perf.endMeasure('gameLoad');
// console.log(perf.getMemory());

// ====== 9. معالج الأخطاء العام ======
function setupErrorHandler() {
  window.addEventListener('error', (event) => {
    console.error('Error:', event.error);
    showNotification(`خطأ: ${event.error.message}`, 'error');
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise rejection:', event.reason);
    showNotification('حدث خطأ غير متوقع', 'error');
  });
}

// الاستخدام: setupErrorHandler();

// ====== 10. نظام التخزين المحلي الآمن ======
class SecureStorage {
  static set(key, value) {
    try {
      localStorage.setItem(`playverse-${key}`, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  }
  
  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(`playverse-${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Retrieval error:', e);
      return defaultValue;
    }
  }
  
  static remove(key) {
    try {
      localStorage.removeItem(`playverse-${key}`);
      return true;
    } catch (e) {
      console.error('Remove error:', e);
      return false;
    }
  }
  
  static clear() {
    try {
      const keys = Object.keys(localStorage)
        .filter(k => k.startsWith('playverse-'));
      keys.forEach(k => localStorage.removeItem(k));
      return true;
    } catch (e) {
      console.error('Clear error:', e);
      return false;
    }
  }
}

// الاستخدام:
// SecureStorage.set('userLevel', 5);
// const level = SecureStorage.get('userLevel', 0);

// ====== 11. نظام الإطارات والرسوميات ======
class AdvancedParticles {
  static createExplosion(x, y, color = 'rgba(255, 255, 255, 0.8)', count = 20) {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const velocity = 3 + Math.random() * 2;
      
      const particle = {
        x, y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: 60,
        maxLife: 60,
        color
      };
      
      // ستحتاجي لإضافة هذا للـ particle system الأساسي
    }
  }
  
  static createRipple(x, y, maxRadius = 100) {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let radius = 0;
    const speed = 2;
    
    const animate = () => {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
      
      radius += speed;
      if (radius < maxRadius) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }
}

// الاستخدام:
// AdvancedParticles.createExplosion(window.innerWidth/2, window.innerHeight/2);
// AdvancedParticles.createRipple(100, 100);

// ====== 12. نظام الإحصائيات المتقدمة ======
class AnalyticsTracker {
  constructor() {
    this.events = [];
  }
  
  track(eventName, data = {}) {
    const event = {
      name: eventName,
      timestamp: new Date().toISOString(),
      ...data
    };
    
    this.events.push(event);
    
    // إرسال للـ server إذا أردت (مثلاً Firebase)
    if (window.gtag) {
      gtag('event', eventName, data);
    }
  }
  
  getReport() {
    return {
      totalEvents: this.events.length,
      events: this.events,
      summary: this.events.reduce((acc, e) => {
        acc[e.name] = (acc[e.name] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

// الاستخدام:
// const analytics = new AnalyticsTracker();
// analytics.track('game_started', { gameName: 'Chemistry' });
// console.log(analytics.getReport());

// ====== طرق إضافية مفيدة ======

// إضافة animation frame smoothing
function requestAnimationFrameSmooth(callback, fpsLimit = 60) {
  let lastTime = 0;
  const frameInterval = 1000 / fpsLimit;
  
  const animate = (currentTime) => {
    if (currentTime - lastTime >= frameInterval) {
      callback(currentTime);
      lastTime = currentTime;
    }
    requestAnimationFrame(animate);
  };
  
  requestAnimationFrame(animate);
}

// الاستخدام: requestAnimationFrameSmooth(() => console.log('frame'), 30);

// Utility: العثور على العناصر بسهولة
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Utility: إضافة event listener مع إزالة سهلة
const on = (el, event, handler) => el.addEventListener(event, handler);
const off = (el, event, handler) => el.removeEventListener(event, handler);

// Utility: إضافة CSS ديناميكياً
function injectCSS(css) {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

// مثال:
injectCSS(`
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes slideDown {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(20px); opacity: 0; }
  }
`);

// ====== التصدير ======
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    colorSchemes,
    setColorScheme,
    toggleDarkMode,
    addGame,
    GameStats,
    showNotification,
    MultiLanguage,
    PerformanceTracker,
    setupErrorHandler,
    SecureStorage,
    AdvancedParticles,
    AnalyticsTracker,
    $,
    $$,
    on,
    off,
    injectCSS
  };
}

// تم الإنشاء بـ ❤️
// آخر تحديث: أغسطس 2026
