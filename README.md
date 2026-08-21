# 🏆 بطولة المول الكيميائي - عبة كاملة مترجمة

## 📋 نظرة عامة

**عبة تعليمية ترجمة بالكامل 100%** لحسابات المول والكيمياء:
- ✅ **نصوص مترجمة** لـ 8 لغات
- ✅ **صور مترجمة** (غلاف، مقدمة، معلومات)
- ✅ **فيديوهات تعريفية** لكل لغة
- ✅ **30 سؤال** متدرج مع حلول تفصيلية
- ✅ **نظام نقاط وميداليات**
- ✅ **واجهة تفاعلية** سهلة الاستخدام

---

## 🌍 اللغات المدعومة

| اللغة | الكود | الملفات |
|------|------|--------|
| **العربية** | ar | 3 صور + 1 فيديو |
| **English** | en | 3 صور + 1 فيديو |
| **Français** | fr | 3 صور + 1 فيديو |
| **Español** | es | 3 صور + 1 فيديو |
| **Türkçe** | tr | 3 صور + 1 فيديو |
| **Português** | pt | 3 صور + 1 فيديو |
| **Deutsch** | de | 3 صور + 1 فيديو |
| **中文** | zh | 3 صور + 1 فيديو |

---

## 📁 هيكل الملفات

```
mole_tournament/
├── mole_tournament_full_multilingual.html    (الملف الرئيسي - HTML كامل)
├── images/
│   ├── cover_ar.png, cover_en.png, ... (8 صور غلاف)
│   ├── intro_ar.png, intro_en.png, ... (8 صور مقدمة)
│   └── info_ar.png, info_en.png, ... (8 صور معلومات)
├── videos/
│   ├── intro_ar.mp4, intro_en.mp4, ... (8 فيديوهات)
│   └── videos_metadata.json
├── README.md (هذا الملف)
└── scripts/
    ├── generate_images.py (لإنشاء الصور)
    └── generate_videos.py (لإنشاء الفيديوهات)
```

---

## 🚀 طرق الاستخدام

### 1️⃣ **الطريقة السريعة** (بدون صور/فيديوهات)
فقط اسخي الملف `mole_tournament_full_multilingual.html` وافتحيه في المتصفح:
- ✅ جميع النصوص مترجمة
- ✅ تبديل لغات فوري
- ✅ أسئلة مترجمة بالكامل

### 2️⃣ **الطريقة الكاملة** (مع الصور والفيديوهات)
انسخي الملفات إلى خادم ويب:

```bash
# هيكل المجلد
www/
├── mole_tournament_full_multilingual.html
├── images/
│   ├── cover_ar.png, cover_en.png, ...
│   ├── intro_ar.png, intro_en.png, ...
│   └── info_ar.png, info_en.png, ...
└── videos/
    ├── intro_ar.mp4, intro_en.mp4, ...
    └── videos_metadata.json
```

ثم عدّلي الـ HTML لتحميل الصور:

```html
<div class="home-media" id="homeMedia">
  <img id="coverImage" alt="Cover">
</div>

<script>
  function updateCoverImage() {
    const coverImg = document.getElementById('coverImage');
    coverImg.src = `images/cover_${currentLang}.png`;
  }
  // استدعي updateCoverImage() عند تغيير اللغة
</script>
```

### 3️⃣ **النشر على GitHub Pages**
```bash
git add .
git commit -m "Multilingual Mole Tournament Game"
git push origin main
```

ثم افتحي: `https://username.github.io/playverse/mole_tournament_full_multilingual.html`

---

## 🎮 المميزات الرئيسية

### 📚 ورقتا عمل تدريبية
- **الورقة الأولى**: 6 أسئلة أساسية
- **الورقة الثانية**: 3 أسئلة متقدمة
- جميع الأسئلة مترجمة لـ 8 لغات

### ✨ نظام النقاط
- نقطة واحدة لكل إجابة صحيحة
- حل مفصل لكل سؤال
- عرض النسبة المئوية بالنهاية

### 🏅 نظام الميداليات
- 🥇 ذهبية: 90% فما فوق
- 🥈 فضية: 70% - 89%
- 🥉 برونزية: 50% - 69%
- 📚 كتاب: أقل من 50%

### 🌍 تبديل اللغات
- اختيار سريع من القائمة المنسدلة
- يتم حفظ التفضيل في localStorage
- تحديث فوري لجميع النصوص

---

## 📊 المحتوى العلمي

### الأسئلة تغطي:
✅ رقم أفوغادرو  
✅ الكتلة المولية  
✅ حسابات المول  
✅ الصيغ الكيميائية  
✅ الحجم المولي  
✅ النسب المئوية  
✅ التركيز المولاري  
✅ التفاعلات الكيميائية  

---

## 🔧 إعادة توليد الصور والفيديوهات

إذا أردتِ تعديل الترجمات أو إعادة توليد الملفات:

### 📸 توليد الصور:
```bash
python3 generate_images.py
```
ينتج: 24 صورة (3 × 8 لغات) بدقة عالية

### 🎥 توليد الفيديوهات:
```bash
python3 generate_videos.py
```
ينتج: 8 فيديوهات (1 لكل لغة) بصيغة MP4

---

## 💾 متطلبات النشر على Google Play

✅ **ملف manifest.json**
```json
{
  "name": "Mole Tournament Chemistry",
  "short_name": "Mol Tournament",
  "description": "Chemistry mole calculations game",
  "start_url": "mole_tournament_full_multilingual.html",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#ffd700",
  "background_color": "#0a1f3d",
  "screenshots": [
    {"src": "images/cover_ar.png", "sizes": "1080x1920", "type": "image/png"}
  ]
}
```

✅ **Firebase Configuration**
بيانات الدرجات وإحصائيات الطلاب تُحفظ في:
- Firebase Firestore: `cursed-castle-bb43b`
- كلمة المعلم: `amani2026`

---

## 🎯 الخطوات التالية

### ✨ تحسينات مقترحة:

1. **إضافة مؤثرات صوتية**
   - أصوات الإجابة الصحيحة/الخاطئة
   - موسيقى خلفية هادئة

2. **شارات إنجازات**
   - الإجابة الكاملة دون أخطاء
   - إكمال الورقتين
   - التفوق في كل لغة

3. **لوحة تصدر عالمية**
   - حفظ أسماء الطلاب
   - ترتيب حسب النقاط
   - إحصائيات بالنسبة المئوية

4. **وضع معلم**
   - عرض تحليل أداء الطلاب
   - تقارير تقدم المجموعة
   - إرسال الدرجات عبر البريد

---

## 📞 دعم فني

### الملفات المتاحة:
- ✅ mole_tournament_multilingual.html (نصوص فقط)
- ✅ mole_tournament_full_multilingual.html (نصوص + صور + فيديوهات)
- ✅ generate_images.py (سكريبت توليد الصور)
- ✅ generate_videos.py (سكريبت توليد الفيديوهات)

### التوافقية:
- ✅ جميع المتصفحات الحديثة (Chrome, Safari, Firefox, Edge)
- ✅ هواتف ذكية (iOS, Android)
- ✅ أجهزة لوحية
- ✅ أجهزة سطح المكتب

---

## 📝 ملاحظات مهمة

1. **RTL/LTR**: الواجهة تتكيف تلقائياً حسب اللغة
2. **التخزين**: اللغة المختارة تحفظ في localStorage
3. **الأداء**: جميع الأصول محسّنة للهواتف الذكية
4. **الأمان**: لا توجد بيانات حساسة في الملف الرئيسي

---

## 🎓 عن المشروع

**طورت بواسطة**: د. أماني ياسين (داود)  
**المشروع**: PlayVerse - منصة ألعاب تعليمية مترجمة  
**الجمعية**: جمعية تأملات شبابية للإبداع (قارب)  
**التاريخ**: 2024-2025

---

## ✅ قائمة التحقق قبل النشر

- [ ] اختبار جميع اللغات الثماني
- [ ] التحقق من الصور (إذا استخدمتِ النسخة الكاملة)
- [ ] اختبار على الهواتف الذكية
- [ ] التحقق من روابط الفيديوهات (إذا استخدمتِ النسخة الكاملة)
- [ ] تحديث ملف manifest.json
- [ ] إضافة ملف privacy policy
- [ ] رفع على GitHub/Google Play

---

## 🎉 شكراً لاستخدامكِ PlayVerse!

**رابط GitHub**: https://github.com/amaniyaseen811-svg/playverse  
**البريد الإلكتروني**: amaniyaseen811@gmail.com

---

*آخر تحديث: أغسطس 2024*
