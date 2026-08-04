# -*- coding: utf-8 -*-
"""
=========================================================
  سالي ودرب الأرقام — سكريبت توليد فيديو المقدمة
=========================================================

شو بيعمل؟
  1. sally-intro.mp4  : فيديو مقدمة عمودي (9:16) بالتعليق العربي والموسيقى
  2. sally-cover-1..4.mp4 : أربعة مقاطع غلاف متحركة لبطاقة اللعبة
  3. sally-cover.mp4      : نفس الأربعة مدمجين بمقطع واحد

قبل التشغيل:
  pip install pillow arabic-reshaper python-bidi
  ولازم يكون ffmpeg مثبّت ومضاف على PATH

الملفات المطلوبة جنب السكريبت:
  scenes/scene_01.jpg ... scene_08.jpg    (الصور اللي رح تولّديها)
  scenes/cover_1.jpg ... cover_4.jpg       (صور الغلاف الأربعة - اختياري)
  sally-music.mp3                         (اختياري - موسيقى خلفية)

التشغيل:
  python sally_video.py
=========================================================
"""

import os
import sys
import shutil
import subprocess

from PIL import Image, ImageDraw, ImageFont

# ---------------------------------------------------------
#  ١) الإعدادات — عدّلي من هون فقط
# ---------------------------------------------------------

W, H = 1080, 1920          # مقاس الفيديو (عمودي)
FPS = 24                   # عدد الإطارات بالثانية
SCENES_DIR = "scenes"      # مجلد الصور
MUSIC = "sally-music.mp3"  # الموسيقى (إذا مش موجودة بيتجاهلها)
OUT_INTRO = "sally-intro.mp4"
OUT_COVER = "sally-cover.mp4"       # الغلاف المدمج (4 صور)
COVER_SECONDS = 3.5                 # طول كل مقطع غلاف
COVER_IMAGES = ["cover_1.jpg", "cover_2.jpg", "cover_3.jpg", "cover_4.jpg"]
COVER_FALLBACK = ["scene_01.jpg", "scene_03.jpg", "scene_06.jpg", "scene_08.jpg"]

# الخط العربي — على ويندوز Tahoma أفضل خيار
FONT_CANDIDATES = [
    r"C:\Windows\Fonts\tahoma.ttf",
    r"C:\Windows\Fonts\tahomabd.ttf",
    r"C:\Windows\Fonts\arial.ttf",
    "/System/Library/Fonts/Supplemental/Tahoma.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]

TITLE = "مغامرة سالي مع الأرقام"
SUBTITLE = "قصة ولعبة تعليمية"
END_LINE_1 = "ابدأ المغامرة الآن"
END_LINE_2 = "PlayVerse"

# الألوان (من هوية اللعبة)
PINK = (255, 111, 165)
PURPLE = (149, 117, 205)
YELLOW = (255, 201, 60)
CREAM = (255, 248, 238)
INK = (74, 59, 70)

# المشاهد: الصورة + النص + المدة بالثواني
SCENES = [
    ("scene_01.jpg", "في صباح مشمس، خرجت سالي إلى الحديقة تقطف الزهور مع صديقها الأرنب نونو.", 6),
    ("scene_02.jpg", "في الحديقة درب عجيب: عشرة أحجار، على كل حجر رقم مضيء يدلّ الجميع على طريقه.", 6),
    ("scene_03.jpg", "لكن الغراب شطّاب طار فوق الدرب، ومسح الأرقام واحدًا واحدًا بممحاته!", 7),
    ("scene_04.jpg", "ركض نونو خائفًا: سالي! الأحجار صارت فاضية، وما عاد حدا يعرف طريقه!", 7),
    ("scene_05.jpg", "قالت سالي: لا تخف يا نونو. كل سؤال نحلّه صح، بيرجع رقم لحجر، وبنقفز خطوة.", 7),
    ("scene_06.jpg", "في بستان التفاح استقبلتهم القطة مشمش، وعلّمتهم كيف نجمع ونطرح التفاح.", 6),
    ("scene_07.jpg", "وفي الغابة، سألتهم البومة حكيمة أصعب الأسئلة: أعداد كبيرة وأرقام ناقصة.", 6),
    ("scene_08.jpg", "وأخيرًا أضاء الدرب… وحتى شطّاب تعلّم العدّ وصار صديقًا للجميع!", 8),
]

FADE = 0.35        # مدة الظهور/الاختفاء بين المشاهد (ثانية)
ZOOM = 1.10        # قوة حركة الزوم (1.10 = تكبير 10%)


# ---------------------------------------------------------
#  ٢) تجهيز الخط والنص العربي
# ---------------------------------------------------------

def find_font():
    for p in FONT_CANDIDATES:
        if os.path.exists(p):
            return p
    print("⚠️  ما لقيت خط عربي. عدّلي FONT_CANDIDATES وحطّي مسار خط عندك.")
    sys.exit(1)


FONT_PATH = find_font()

try:
    import arabic_reshaper
    from bidi.algorithm import get_display
    _SHAPING = True
except ImportError:
    _SHAPING = False
    print("⚠️  ناقص arabic-reshaper / python-bidi — الحروف رح تطلع مقطّعة.")
    print("    شغّلي: pip install arabic-reshaper python-bidi")


def ar(text):
    """يرتّب النص العربي حتى يطلع موصول وبالاتجاه الصحيح."""
    if not _SHAPING:
        return text
    return get_display(arabic_reshaper.reshape(text))


def font(size):
    return ImageFont.truetype(FONT_PATH, size)


def text_size(draw, txt, fnt):
    box = draw.textbbox((0, 0), txt, font=fnt)
    return box[2] - box[0], box[3] - box[1]


def wrap_arabic(draw, text, fnt, max_width):
    """يقسّم النص لأسطر حسب العرض المتاح (يقسّم قبل التشكيل حتى ما تنكسر الكلمات)."""
    words = text.split()
    lines, cur = [], []
    for w in words:
        trial = " ".join(cur + [w])
        if text_size(draw, ar(trial), fnt)[0] <= max_width or not cur:
            cur.append(w)
        else:
            lines.append(" ".join(cur))
            cur = [w]
    if cur:
        lines.append(" ".join(cur))
    return lines


# ---------------------------------------------------------
#  ٣) رسم لوحة النص (مرة وحدة لكل مشهد — أسرع بكثير)
# ---------------------------------------------------------

def make_caption(text):
    """يرجّع طبقة شفافة فيها النص داخل صندوق ناعم أسفل الشاشة."""
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    fnt = font(52)
    margin = 70
    lines = wrap_arabic(d, text, fnt, W - margin * 2 - 60)

    line_h = 78
    box_h = line_h * len(lines) + 70
    box_top = H - box_h - 140

    # الصندوق
    d.rounded_rectangle(
        [margin, box_top, W - margin, box_top + box_h],
        radius=44, fill=(255, 248, 238, 235),
        outline=PINK + (255,), width=6
    )

    y = box_top + 35
    for ln in lines:
        shaped = ar(ln)
        tw = text_size(d, shaped, fnt)[0]
        d.text(((W - tw) // 2, y), shaped, font=fnt, fill=INK)
        y += line_h

    return layer


# ---------------------------------------------------------
#  ٤) تحضير الصور (قص وتكبير ليملأ الشاشة)
# ---------------------------------------------------------

def load_cover(path):
    """يفتح الصورة ويقصّها لتملأ 9:16 مع هامش زوم."""
    img = Image.open(path).convert("RGB")
    tw, th = int(W * ZOOM), int(H * ZOOM)
    scale = max(tw / img.width, th / img.height)
    img = img.resize((int(img.width * scale) + 1, int(img.height * scale) + 1), Image.LANCZOS)
    left = (img.width - tw) // 2
    top = (img.height - th) // 2
    return img.crop((left, top, left + tw, top + th))


def ken_burns(big, t, zoom_in=True):
    """يقصّ نافذة متحركة من الصورة الكبيرة — t من 0 إلى 1."""
    bw, bh = big.size
    if zoom_in:
        f = 1.0 - (1.0 - 1.0 / ZOOM) * t          # يبدأ واسع ويقرّب
    else:
        f = 1.0 / ZOOM + (1.0 - 1.0 / ZOOM) * t   # يبدأ قريب ويوسّع
    cw, ch = int(bw * f), int(bh * f)
    left = (bw - cw) // 2
    top = int((bh - ch) * (0.35 + 0.30 * t))      # حركة عمودية خفيفة
    return big.crop((left, top, left + cw, top + ch)).resize((W, H), Image.BILINEAR)


def fade_factor(i, total, fade_frames):
    if i < fade_frames:
        return i / fade_frames
    if i > total - fade_frames:
        return max(0.0, (total - i) / fade_frames)
    return 1.0


def apply_fade(img, f):
    if f >= 0.999:
        return img
    black = Image.new("RGB", img.size, (0, 0, 0))
    return Image.blend(black, img, f)


# ---------------------------------------------------------
#  ٥) بطاقات البداية والنهاية (مرسومة بالكود — بدون صور)
# ---------------------------------------------------------

def gradient_card():
    card = Image.new("RGB", (W, H), CREAM)
    d = ImageDraw.Draw(card)
    for y in range(H):
        t = y / H
        r = int(191 + (255 - 191) * t)
        g = int(233 + (248 - 233) * t)
        b = int(255 + (238 - 255) * t)
        d.line([(0, y), (W, y)], fill=(r, g, b))
    return card


def draw_flower(d, cx, cy, r, color):
    import math
    for k in range(6):
        a = math.radians(k * 60)
        px, py = cx + math.cos(a) * r, cy + math.sin(a) * r
        d.ellipse([px - r * 0.75, py - r * 0.75, px + r * 0.75, py + r * 0.75], fill=color)
    d.ellipse([cx - r * 0.6, cy - r * 0.6, cx + r * 0.6, cy + r * 0.6], fill=YELLOW)


def title_card(line1, line2, big=True):
    card = gradient_card()
    d = ImageDraw.Draw(card)
    draw_flower(d, W // 2, H // 2 - 320, 90, PINK)
    f1 = font(96 if big else 84)
    f2 = font(52)
    s1, s2 = ar(line1), ar(line2)
    w1 = text_size(d, s1, f1)[0]
    w2 = text_size(d, s2, f2)[0]
    d.text(((W - w1) // 2, H // 2 - 60), s1, font=f1, fill=PURPLE)
    d.text(((W - w2) // 2, H // 2 + 90), s2, font=f2, fill=PINK)
    draw_flower(d, W // 2 - 300, H // 2 + 300, 45, YELLOW)
    draw_flower(d, W // 2 + 300, H // 2 + 300, 45, PINK)
    return card


# ---------------------------------------------------------
#  ٦) التصدير عبر ffmpeg
# ---------------------------------------------------------

def open_ffmpeg(out_path, with_music):
    if shutil.which("ffmpeg") is None:
        print("❌ ffmpeg مش موجود. نزّليه من ffmpeg.org وأضيفيه على PATH.")
        sys.exit(1)

    cmd = ["ffmpeg", "-y", "-loglevel", "error",
           "-f", "rawvideo", "-pix_fmt", "rgb24",
           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-"]
    if with_music:
        cmd += ["-i", MUSIC, "-shortest",
                "-c:a", "aac", "-b:a", "160k",
                "-af", "volume=0.55,afade=t=out:st=45:d=4"]
    cmd += ["-c:v", "libx264", "-pix_fmt", "yuv420p",
            "-crf", "21", "-preset", "medium", "-movflags", "+faststart",
            out_path]
    return subprocess.Popen(cmd, stdin=subprocess.PIPE)


def write(proc, img):
    proc.stdin.write(img.tobytes())


# ---------------------------------------------------------
#  ٧) بناء فيديو المقدمة
# ---------------------------------------------------------

def build_intro():
    missing = [s[0] for s in SCENES if not os.path.exists(os.path.join(SCENES_DIR, s[0]))]
    if missing:
        print("❌ صور ناقصة داخل مجلد", SCENES_DIR, ":", ", ".join(missing))
        return

    with_music = os.path.exists(MUSIC)
    print("🎬 ببلّش فيديو المقدمة" + (" مع موسيقى" if with_music else " بدون موسيقى"))
    proc = open_ffmpeg(OUT_INTRO, with_music)
    fade_frames = max(1, int(FADE * FPS))

    # بطاقة البداية
    card = title_card(TITLE, SUBTITLE)
    n = int(2.6 * FPS)
    for i in range(n):
        write(proc, apply_fade(card, fade_factor(i, n, fade_frames)))

    # المشاهد
    for idx, (fname, text, dur) in enumerate(SCENES):
        print(f"   • المشهد {idx+1}/{len(SCENES)} — {fname}")
        big = load_cover(os.path.join(SCENES_DIR, fname))
        cap = make_caption(text)
        n = int(dur * FPS)
        for i in range(n):
            frame = ken_burns(big, i / max(1, n - 1), zoom_in=(idx % 2 == 0))
            frame = frame.convert("RGBA")
            frame.alpha_composite(cap)
            write(proc, apply_fade(frame.convert("RGB"), fade_factor(i, n, fade_frames)))

    # بطاقة النهاية
    card = title_card(END_LINE_1, END_LINE_2, big=False)
    n = int(3.0 * FPS)
    for i in range(n):
        write(proc, apply_fade(card, fade_factor(i, n, fade_frames)))

    proc.stdin.close()
    proc.wait()
    print("✅ جاهز:", OUT_INTRO)


# ---------------------------------------------------------
#  ٨) بناء مقطع الغلاف (بدون نص — للبطاقة على المنصة)
# ---------------------------------------------------------

def cover_sources():
    """يرجّع أربع صور للغلاف — من cover_1..4 وإذا مش موجودة بياخد من المشاهد."""
    out = []
    for i in range(4):
        p = os.path.join(SCENES_DIR, COVER_IMAGES[i])
        if not os.path.exists(p):
            p = os.path.join(SCENES_DIR, COVER_FALLBACK[i])
        out.append(p if os.path.exists(p) else None)
    return out


def render_cover_clip(src, out_path, zoom_in=True):
    proc = open_ffmpeg(out_path, with_music=False)
    big = load_cover(src)
    n = int(COVER_SECONDS * FPS)
    fade_frames = max(1, int(0.45 * FPS))
    for i in range(n):
        frame = ken_burns(big, i / max(1, n - 1), zoom_in=zoom_in)
        write(proc, apply_fade(frame, fade_factor(i, n, fade_frames)))
    proc.stdin.close()
    proc.wait()


def build_covers():
    """
    بيطلّع 4 مقاطع غلاف منفصلة (وحدة لكل صورة) + مقطع مدمج فيهم كلهم.
    المنفصلة: sally-cover-1.mp4 ... sally-cover-4.mp4
    المدمج  : sally-cover.mp4  (حوالي 14 ثانية)
    """
    srcs = cover_sources()
    if not any(srcs):
        print("⚠️  ما في صور للغلاف — تخطّيت مقاطع الغلاف")
        return

    print("🃏 ببلّش مقاطع الغلاف (4 صور)")
    made = []
    for i, src in enumerate(srcs):
        if src is None:
            print(f"   ⚠️ ناقصة صورة الغلاف رقم {i+1}")
            continue
        out = f"sally-cover-{i+1}.mp4"
        print(f"   • {out} ← {os.path.basename(src)}")
        render_cover_clip(src, out, zoom_in=(i % 2 == 0))
        made.append(out)

    # المقطع المدمج
    print("   • sally-cover.mp4 (مدمج)")
    proc = open_ffmpeg(OUT_COVER, with_music=False)
    fade_frames = max(1, int(0.45 * FPS))
    for i, src in enumerate(srcs):
        if src is None:
            continue
        big = load_cover(src)
        n = int(COVER_SECONDS * FPS)
        for k in range(n):
            frame = ken_burns(big, k / max(1, n - 1), zoom_in=(i % 2 == 0))
            write(proc, apply_fade(frame, fade_factor(k, n, fade_frames)))
    proc.stdin.close()
    proc.wait()

    print("✅ جاهز:", ", ".join(made + [OUT_COVER]))


# ---------------------------------------------------------
if __name__ == "__main__":
    print("=" * 50)
    print("  سالي ودرب الأرقام — توليد الفيديو")
    print("=" * 50)
    build_covers()
    build_intro()
    print("\n🌸 خلصنا! ارفعي الملفات جنب sally.html على GitHub.")
