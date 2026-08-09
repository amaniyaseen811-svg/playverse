/* ============================================================
   PlayVerse — Service Worker
   الإصدار: غيّري الرقم فقط عند أي تحديث كبير لإجبار التحديث
   الاستراتيجية:
     • صفحات HTML  → الشبكة أولاً (فما بتظهر نسخة قديمة أبداً)
     • باقي الملفات → من الذاكرة فوراً + تحديث بالخلفية
   ============================================================ */
const VERSION = 'pv-v3';
const CACHE   = VERSION;

/* التثبيت: يفعّل النسخة الجديدة فوراً بدون انتظار */
self.addEventListener('install', function (e) {
  self.skipWaiting();
});

/* التفعيل: يمسح كل الذاكرات القديمة ويسيطر على الصفحات المفتوحة */
self.addEventListener('activate', function (e) {
  e.waitUntil((async function () {
    const keys = await caches.keys();
    await Promise.all(keys.map(function (k) {
      return k === CACHE ? null : caches.delete(k);
    }));
    await self.clients.claim();
  })());
});

/* رسالة يدوية لتفريغ كل شيء عند الحاجة */
self.addEventListener('message', function (e) {
  if (e.data === 'PV_CLEAR') {
    e.waitUntil((async function () {
      const keys = await caches.keys();
      await Promise.all(keys.map(function (k) { return caches.delete(k); }));
      const cl = await self.clients.matchAll({ type: 'window' });
      cl.forEach(function (c) { c.navigate(c.url); });
    })());
  }
});

function isHTML(req) {
  return req.mode === 'navigate' ||
         (req.headers.get('accept') || '').indexOf('text/html') !== -1;
}

self.addEventListener('fetch', function (e) {
  const req = e.request;

  /* نتعامل فقط مع طلبات GET من نفس الموقع */
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;

  /* ---- صفحات HTML: الشبكة أولاً ---- */
  if (isHTML(req)) {
    e.respondWith((async function () {
      try {
        const fresh = await fetch(req, { cache: 'no-store' });
        const c = await caches.open(CACHE);
        c.put(req, fresh.clone());
        return fresh;
      } catch (err) {
        const cached = await caches.match(req);
        return cached || caches.match('./index.html');
      }
    })());
    return;
  }

  /* ---- باقي الملفات: من الذاكرة + تحديث بالخلفية ---- */
  e.respondWith((async function () {
    const cached = await caches.match(req);
    const network = fetch(req).then(function (res) {
      if (res && res.status === 200 && res.type === 'basic') {
        caches.open(CACHE).then(function (c) { c.put(req, res.clone()); });
      }
      return res;
    }).catch(function () { return cached; });
    return cached || network;
  })());
});
