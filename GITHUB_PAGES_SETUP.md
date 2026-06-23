# 🚀 كيفية رفع NEON RUNNER على GitHub Pages

## الخطوات الكاملة

### 1. أنشئ مستودعاً جديداً على GitHub
- اذهب إلى: https://github.com/new
- اسم المستودع: `neon-runner`
- اجعله **Public**
- اضغط **Create repository**

### 2. عدّل اسم المستودع في ملف الـ Vite
افتح ملف `vite.gh-pages.config.ts` وغيّر السطر:
```ts
const REPO_NAME = "/neon-runner/";
```
إلى اسم الـ repo الذي اخترته.

### 3. ارفع الكود من جهازك
```bash
git init
git add .
git commit -m "🎮 NEON RUNNER - Initial release"
git branch -M main
git remote add origin https://github.com/USERNAME/neon-runner.git
git push -u origin main
```
استبدل `USERNAME` باسم مستخدمك على GitHub.

### 4. فعّل GitHub Pages
- اذهب إلى إعدادات المستودع: **Settings → Pages**
- في **Source** اختر: **GitHub Actions**
- احفظ

### 5. انتظر النشر
- اذهب إلى تبويب **Actions** في المستودع
- سيبدأ الـ workflow تلقائياً
- بعد دقيقتين رابطك سيكون:

```
https://USERNAME.github.io/neon-runner/
```

---

## إضافة Google AdSense
1. سجّل على: https://adsense.google.com
2. احصل على **Publisher ID** يبدأ بـ `ca-pub-`
3. في ملف `index.html`، استبدل كل `ca-pub-XXXXXXXXXXXXXXXX` بـ ID الخاص بك
4. ارفع التعديل: `git push`
