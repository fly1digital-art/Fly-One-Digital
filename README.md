# F-06 Sunglasses — Hostinger-ready

**Deploy `main` directly to Hostinger PHP hosting.** Prebuilt assets, PHP endpoints, MySQL schema, secure admin login, settings editor, order management and persistent media uploads are included. No build command is required on Hostinger.

## বাংলা সেটআপ

সম্পূর্ণ ধাপ: **[HOSTINGER-SETUP.md](HOSTINGER-SETUP.md)**

1. বর্তমান সাইট ও database backup নিন।
2. Hostinger → Advanced → Git → `fly1digital-art/Fly-One-Digital` → `main` → document root `public_html` → Deploy।
3. `public_html`-এর পাশের `f06-private/config.php`-তে database/HTTPS origin/setup key দিন (`hostinger/config.example.php` দেখুন)।
4. `/setup.php` দিয়ে admin তৈরি করুন, setup key মুছে দিন।
5. demo order পরীক্ষা করে config-এর `checkout_mode` → `live` করুন।

Phone/WhatsApp: **+8801323527412**. Bangla opens by default with an English switch. Video accepts Facebook/YouTube or uploaded MP4/WebM up to 20 MB and requests muted autoplay. Tracking uses a compact Yes/No consent bar.

**Existing orders are not automatically migrated.** New MySQL tables use the `f06_` prefix and do not alter legacy tables. Keep a backup and migrate previous live data before replacing a store that needs its old order history.

## Developer workflow

- `npm ci`
- `npm run build:hostinger` — builds checked-in `webassets/` and PHP defaults from the shared storefront source
- `npm run test:hostinger` — validates the deployment package and shared video settings
- `hostinger/tests/README.md` — PHP/MySQL integration checks
- Commit source and generated output together. Never commit `f06-private`, credentials, customer data or database exports.

Hostinger runtime: PHP 8.2+, PDO MySQL, mbstring, fileinfo, HTTPS, Apache/LiteSpeed rewrite rules. Database/config/uploads live outside deploy-managed files. `.htaccess` blocks direct access to source and private paths.

The original Sites/Cloudflare source remains available; `npm run build` builds that target. It is not the Hostinger runtime. GitHub updates alone do not prove that Hostinger deployment succeeded.
