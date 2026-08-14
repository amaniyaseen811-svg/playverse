/* ============================================================
   PlayVerse — قفل الاشتراك (يعمل بدون إنترنت)
   د. أماني ياسين
   طريقة الاستخدام: ضعي هذا السطر قبل </body> في index.html
   <script src="playverse-lock.js"></script>
   ============================================================ */
(function () {
  'use strict';

  /* ---------- إعدادات تقدرين تغيّريها ---------- */
  var SECRET       = 'PV#2026$amani!qareb';        // نفس القيمة في صفحة توليد الأكواد
  var TEACHER_PASS = 'amani2026';                   // كلمة سر المعلمة (فتح دائم)
  var WHATSAPP     = '972594090764';                // رقم التواصل
  var TRIAL_DAYS   = 7;                             // التجربة المجانية (0 = بدون تجربة)
  var EPOCH        = Date.UTC(2026, 0, 1);          // بداية حساب التواريخ
  var FREE_UNTIL   = '2026-10-14';                  // التطبيق مجاني للجميع لحد هذا التاريخ (بدون كود)
                                                     // بعده بيرجع يطلب كود تلقائياً. لإلغاء الفترة المجانية اجعليها ''
  /* --------------------------------------------- */

  var LS_LIC   = 'pv_license';
  var LS_SEEN  = 'pv_lastseen';
  var LS_TRIAL = 'pv_trial_used';
  var DAY = 86400000;

  /* ---------- أدوات ---------- */
  function today() { return Math.floor((Date.now() - EPOCH) / DAY); }

  function freeUntilDay() {
    if (!FREE_UNTIL) return -1;
    var d = new Date(FREE_UNTIL + 'T00:00:00Z');
    if (isNaN(d.getTime())) return -1;
    return Math.floor((d.getTime() - EPOCH) / DAY);
  }

  // أبجدية بدون الحرفين I و O لمنع الالتباس مع 1 و 0
  var AB = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';

  function enc(n, len) {
    var s = '';
    n = Math.max(0, Math.floor(n));
    do { s = AB.charAt(n % 34) + s; n = Math.floor(n / 34); } while (n > 0);
    while (s.length < len) s = '0' + s;
    return s.slice(-len);
  }

  function dec(s) {
    var n = 0;
    for (var i = 0; i < s.length; i++) {
      var v = AB.indexOf(s.charAt(i));
      if (v < 0) return -1;
      n = n * 34 + v;
    }
    return n;
  }

  function sign(data) {
    var s = data + SECRET, a = 0x811c9dc5, b = 0x1000193;
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      a = Math.imul(a ^ c, 16777619) >>> 0;
      b = Math.imul(b + c + i, 2246822519) >>> 0;
      b = ((b << 7) | (b >>> 25)) >>> 0;
    }
    return enc((a ^ b) >>> 0, 4).slice(-4);
  }

  function clean(code) {
    return String(code || '')
      .toUpperCase()
      .replace(/[^0-9A-Z]/g, '')
      .replace(/^PV/, '')
      .replace(/O/g, '0')
      .replace(/I/g, '1');
  }

  // يفك الكود ويتحقق منه — بدون إنترنت
  // شكل الكود: نوع(1) + وصول(1) + انتهاء(3) + أجهزة(2) + تسلسل(1) + توقيع(4)
  function readCode(raw) {
    var c = clean(raw);
    if (c.length !== 12) return null;
    var data = c.slice(0, 8), sig = c.slice(8);
    if (sign(data) !== sig) return null;
    var kind = data.charAt(0);
    if ('STC'.indexOf(kind) < 0) return null;
    var tier = data.charAt(1);
    if ('NF'.indexOf(tier) < 0) return null;
    var exp = dec(data.slice(2, 5));                // يوم الانتهاء
    var seats = dec(data.slice(5, 7));              // عدد الأجهزة المسموحة
    if (exp < 0 || seats < 0) return null;
    return { code: c, kind: kind, tier: tier, exp: exp, seats: seats };
  }

  function kindName(k) {
    return k === 'C' ? 'اشتراك مدرسة' : k === 'T' ? 'اشتراك معلّم' : 'اشتراك طالب';
  }

  function tierName(t) {
    return t === 'F' ? 'أوفلاين (تحميل دائم)' : 'أونلاين (يحتاج إنترنت)';
  }

  /* ---------- حالة الترخيص ---------- */
  function load() {
    try { return JSON.parse(localStorage.getItem(LS_LIC) || 'null'); } catch (e) { return null; }
  }

  function save(o) {
    try { localStorage.setItem(LS_LIC, JSON.stringify(o)); } catch (e) {}
  }

  // منع التحايل بتقديم/تأخير ساعة الجهاز
  function clockMovedBack() {
    var seen = parseInt(localStorage.getItem(LS_SEEN) || '-1', 10);
    var now = today();
    if (seen > -1 && now < seen - 1) return true;
    try { localStorage.setItem(LS_SEEN, String(Math.max(seen, now))); } catch (e) {}
    return false;
  }

  function check() {
    var freeDay = freeUntilDay();
    if (freeDay >= 0 && today() < freeDay) {
      return { ok: true, free: true, daysLeftFree: freeDay - today() };
    }
    var lic = load();
    if (!lic) return { ok: false };
    if (lic.forever) return { ok: true, forever: true, kind: 'T', tier: lic.tier || 'F' };
    if (clockMovedBack()) return { ok: false, reason: 'تاريخ الجهاز غير صحيح. اضبطي التاريخ ثم أعيدي الفتح.' };
    var left = lic.exp - today();
    if (left < 0) return { ok: false, reason: 'انتهت مدة الاشتراك. جدّدي للمتابعة.' };
    return { ok: true, left: left, kind: lic.kind, tier: lic.tier || 'N', trial: !!lic.trial };
  }

  // تفعّل التخزين المؤقت (اللعب بدون إنترنت) فقط لأصحاب اشتراك "أوفلاين"
  function applyOfflineMode(tier) {
    if (!('serviceWorker' in navigator)) return;
    if (tier === 'F') {
      navigator.serviceWorker.register('./service-worker.js').catch(function () {});
    }
  }

  /* ---------- الواجهة ---------- */
  var CSS = ''
    + '#pvLock{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;'
    + 'padding:18px;background:radial-gradient(120% 90% at 50% 0%,#1b0b3a 0%,#080018 55%,#050010 100%);'
    + 'font-family:"Tajawal","Segoe UI",system-ui,sans-serif;direction:rtl;overflow:auto}'
    + '#pvLock *{box-sizing:border-box}'
    + '#pvLock .pv-card{width:100%;max-width:390px;text-align:center;color:#fff}'
    + '#pvLock .pv-orb{width:92px;height:92px;margin:0 auto 16px;border-radius:26px;display:flex;align-items:center;'
    + 'justify-content:center;font-size:44px;background:linear-gradient(150deg,#2a1055,#120033);'
    + 'border:1px solid rgba(255,193,69,.35);box-shadow:0 18px 50px rgba(255,193,69,.18)}'
    + '#pvLock h1{margin:0 0 6px;font-size:26px;font-weight:800;letter-spacing:.5px;color:#FFC145}'
    + '#pvLock .pv-sub{margin:0 0 22px;font-size:14px;line-height:1.8;color:rgba(255,255,255,.62)}'
    + '#pvLock label{display:block;text-align:right;font-size:13px;margin:0 0 8px;color:rgba(255,255,255,.75)}'
    + '#pvLock input{width:100%;padding:15px 16px;border-radius:14px;border:1px solid rgba(255,255,255,.16);'
    + 'background:rgba(255,255,255,.05);color:#fff;font-size:19px;font-weight:700;text-align:center;'
    + 'letter-spacing:2px;font-family:inherit;direction:ltr}'
    + '#pvLock input:focus{outline:2px solid #FFC145;outline-offset:2px;border-color:transparent}'
    + '#pvLock input::placeholder{color:rgba(255,255,255,.28);font-weight:500;letter-spacing:1px}'
    + '#pvLock .pv-btn{width:100%;margin-top:12px;padding:15px;border:0;border-radius:14px;cursor:pointer;'
    + 'font-family:inherit;font-size:16px;font-weight:800;color:#2b1500;'
    + 'background:linear-gradient(135deg,#FFD36B,#FFA51F);box-shadow:0 10px 26px rgba(255,165,31,.3);'
    + 'transition:transform .15s ease}'
    + '#pvLock .pv-btn:hover{transform:translateY(-2px)}'
    + '#pvLock .pv-ghost{background:none;border:1px solid rgba(255,255,255,.18);color:rgba(255,255,255,.8);'
    + 'box-shadow:none;font-weight:600;font-size:14px}'
    + '#pvLock .pv-wa{display:block;margin-top:18px;padding:13px;border-radius:14px;text-decoration:none;'
    + 'font-size:14px;font-weight:700;color:#d9ffe6;background:rgba(37,211,102,.12);'
    + 'border:1px solid rgba(37,211,102,.32)}'
    + '#pvLock .pv-msg{min-height:20px;margin-top:12px;font-size:13.5px;font-weight:600;line-height:1.7}'
    + '#pvLock .pv-err{color:#ff8f9c}#pvLock .pv-ok{color:#7ee2a8}'
    + '#pvLock .pv-teach{margin-top:22px;padding-top:16px;border-top:1px solid rgba(255,255,255,.08)}'
    + '#pvLock .pv-link{background:none;border:0;color:rgba(255,255,255,.4);font-size:12.5px;cursor:pointer;'
    + 'font-family:inherit;text-decoration:underline;padding:4px}'
    + '#pvLock .pv-hide{display:none}'
    + '#pvChip{position:fixed;top:10px;inset-inline-start:10px;z-index:2147482000;padding:7px 13px;border-radius:999px;'
    + 'font-family:"Tajawal",system-ui,sans-serif;font-size:12px;font-weight:700;direction:rtl;'
    + 'background:rgba(255,165,31,.14);color:#FFC145;border:1px solid rgba(255,193,69,.4);backdrop-filter:blur(6px)}'
    + '@media (prefers-reduced-motion:reduce){#pvLock .pv-btn{transition:none}}';

  function injectCSS() {
    if (document.getElementById('pvLockCSS')) return;
    var st = document.createElement('style');
    st.id = 'pvLockCSS';
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }

  function showChip(text) {
    var c = document.createElement('div');
    c.id = 'pvChip';
    c.textContent = text;
    document.body.appendChild(c);
  }

  function unlock() {
    var el = document.getElementById('pvLock');
    if (el) el.remove();
    document.documentElement.style.overflow = '';
    var st = check();
    if (st.ok && !st.forever && st.left <= 7) {
      showChip(st.left <= 0 ? 'ينتهي اشتراكك اليوم' : 'باقي ' + st.left + ' يوم على انتهاء الاشتراك');
    }
  }

  function buildLock(reason) {
    injectCSS();
    document.documentElement.style.overflow = 'hidden';

    var trialLeft = TRIAL_DAYS > 0 && !localStorage.getItem(LS_TRIAL);

    var wrap = document.createElement('div');
    wrap.id = 'pvLock';
    wrap.innerHTML = ''
      + '<div class="pv-card">'
      + '  <div class="pv-orb">🎮</div>'
      + '  <h1>PlayVerse</h1>'
      + '  <p class="pv-sub">' + (reason || 'أدخلي كود الاشتراك لفتح كل الألعاب.<br>الألعاب تعمل بعدها بدون إنترنت.') + '</p>'
      + '  <label for="pvCode">كود الاشتراك</label>'
      + '  <input id="pvCode" inputmode="latin" autocomplete="off" spellcheck="false" placeholder="PV-XXXX-XXXX-XXXX" maxlength="18">'
      + '  <button class="pv-btn" id="pvGo">تفعيل الاشتراك</button>'
      + (trialLeft ? '  <button class="pv-btn pv-ghost" id="pvTrial">جرّبي ' + TRIAL_DAYS + ' أيام مجاناً</button>' : '')
      + '  <div class="pv-msg" id="pvMsg"></div>'
      + '  <a class="pv-wa" href="https://wa.me/' + WHATSAPP + '" target="_blank" rel="noopener">ما عندك كود؟ راسلينا على واتساب</a>'
      + '  <div class="pv-teach">'
      + '    <button class="pv-link" id="pvTeachBtn">دخول المعلّمة</button>'
      + '    <div id="pvTeachBox" class="pv-hide">'
      + '      <input id="pvPass" type="password" placeholder="كلمة السر" autocomplete="off" style="margin-top:10px">'
      + '      <button class="pv-btn pv-ghost" id="pvPassGo">دخول</button>'
      + '    </div>'
      + '  </div>'
      + '</div>';
    document.body.appendChild(wrap);

    var input = wrap.querySelector('#pvCode');
    var msg   = wrap.querySelector('#pvMsg');

    function say(text, cls) { msg.className = 'pv-msg ' + cls; msg.textContent = text; }

    // تنسيق تلقائي أثناء الكتابة
    input.addEventListener('input', function () {
      var c = clean(input.value).slice(0, 12);
      var out = c.match(/.{1,4}/g);
      input.value = c ? 'PV-' + (out ? out.join('-') : '') : '';
    });

    wrap.querySelector('#pvGo').addEventListener('click', function () {
      var info = readCode(input.value);
      if (!info) return say('الكود غير صحيح. تأكدي من الحروف والأرقام.', 'pv-err');
      if (info.exp < today()) return say('هذا الكود منتهي الصلاحية.', 'pv-err');
      save({ code: info.code, kind: info.kind, tier: info.tier, exp: info.exp, seats: info.seats, since: today() });
      try { localStorage.setItem(LS_SEEN, String(today())); } catch (e) {}
      applyOfflineMode(info.tier);
      say('تم التفعيل — ' + kindName(info.kind) + ' · ' + tierName(info.tier) + ' لمدة ' + (info.exp - today()) + ' يوم', 'pv-ok');
      setTimeout(unlock, 900);
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') wrap.querySelector('#pvGo').click();
    });

    var tr = wrap.querySelector('#pvTrial');
    if (tr) tr.addEventListener('click', function () {
      try { localStorage.setItem(LS_TRIAL, '1'); } catch (e) {}
      save({ kind: 'S', tier: 'F', exp: today() + TRIAL_DAYS, seats: 1, since: today(), trial: true });
      applyOfflineMode('F');
      say('بدأت التجربة المجانية — ' + TRIAL_DAYS + ' أيام', 'pv-ok');
      setTimeout(unlock, 900);
    });

    wrap.querySelector('#pvTeachBtn').addEventListener('click', function () {
      wrap.querySelector('#pvTeachBox').classList.toggle('pv-hide');
      wrap.querySelector('#pvPass').focus();
    });

    wrap.querySelector('#pvPassGo').addEventListener('click', function () {
      if (wrap.querySelector('#pvPass').value === TEACHER_PASS) {
        save({ forever: true, kind: 'T', tier: 'F', since: today() });
        applyOfflineMode('F');
        unlock();
      } else {
        say('كلمة السر غير صحيحة.', 'pv-err');
      }
    });

    wrap.querySelector('#pvPass').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') wrap.querySelector('#pvPassGo').click();
    });
  }

  function start() {
    var st = check();
    if (st.ok) {
      if (st.free) {
        applyOfflineMode('F');
        showChip('🎁 مجاني الآن — باقي ' + st.daysLeftFree + ' يوم على العرض');
        return;
      }
      applyOfflineMode(st.tier);
      if (!st.forever && st.left <= 7) showChip(st.left <= 0 ? 'ينتهي اشتراكك اليوم' : 'باقي ' + st.left + ' يوم على انتهاء الاشتراك');
      return;
    }
    buildLock(st.reason);
  }

  // أدوات للمعلمة من شريط العنوان (اختياري)
  window.PlayVerseLicense = {
    status: check,
    reset: function () {
      localStorage.removeItem(LS_LIC);
      localStorage.removeItem(LS_SEEN);
      location.reload();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
