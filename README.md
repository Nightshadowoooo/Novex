# NOVEX — راهنمای راه‌اندازی

## ۱. ساخت Supabase (باید خودت انجام بدهی)
1. در supabase.com یک پروژه بساز.
2. SQL Editor → محتوای `supabase/001_schema.sql` را اجرا کن (جدول‌ها، RLS و توابع سمت سرور).
3. Settings → API: مقدارهای `Project URL` و `anon public key` را در `config.js` بگذار. **کلید service_role را هرگز در پروژه نگذار.**
4. Authentication → URL Configuration: Site URL را `https://nightshadowoooo.github.io/Novex/` و در Redirect URLs همین آدرس را با `/*` اضافه کن.
5. Authentication → Providers → Email: «Confirm email» را فعال بگذار (تأیید ایمیل و بازیابی رمز از همین سرویس کار می‌کند).

## ۲. انتشار روی GitHub Pages
همه فایل‌ها را در ریشه مخزن `Nightshadowoooo/Novex` کامیت کن → Settings → Pages → Branch: `main` / root. مسیرها نسبی‌اند و روی `/Novex/` و محیط محلی کار می‌کنند (برای تست محلی: `python3 -m http.server`).

## ۳. اولین مدیر
اول با ثبت‌نام عادی یک حساب بساز، سپس در SQL Editor:
```sql
update public.profiles set role='admin' where lower(username)=lower('نام_کاربری_تو');
```
هیچ کاربری از مرورگر نمی‌تواند نقش خود را تغییر دهد (روی جدول‌ها فقط SELECT مجاز است).

## ۴. تعرفه‌ها و سفارش‌ها
- تعرفه‌ها: `admin-pricing.html`. قیمت سفارش‌های قبلی تغییر نمی‌کند (Snapshot). قانون اختلاف ۲۰۰۰ تومان در تابع `admin_update_plan` اعمال می‌شود؛ برای تغییر آن باید تابع را ویرایش کنی.
- سفارش‌ها: `admin-orders.html`. درگاه پرداخت وصل نیست؛ سفارش‌ها «در انتظار بررسی» ثبت می‌شوند و مدیر وضعیت را دستی تغییر می‌دهد. مبلغ در سرور (`create_order`) محاسبه می‌شود.
- سابقه عملیات مدیریتی در جدول `audit_log`.

## ۵. بکاپ و خطاها
Supabase → Database → Backups (و `pg_dump` برای بکاپ دستی). لاگ‌ها: Logs → API / Postgres / Auth.

## ۶. انتشار نسخه جدید
فایل‌ها را کامیت و push کن؛ GitHub Pages خودکار به‌روز می‌شود.

## نکته امنیتی
برای ورود با نام کاربری، تابع `email_for_username` ایمیل را برمی‌گرداند؛ این یعنی از روی نام کاربری می‌توان ایمیل را حدس زد. اگر مهم است، ورود را فقط با ایمیل بگذار.
