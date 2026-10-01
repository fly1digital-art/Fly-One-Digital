# GitHub → Hostinger: F-06 সাইট

এই repository-এর `main` branch এখন PHP 8.2+ / MySQL হোস্টিংয়ে deploy করার জন্য প্রস্তুত। ডিজাইন, ছবি, ফন্ট এবং তৈরি করা JavaScript/CSS অন্তর্ভুক্ত আছে। Hostinger-এ npm, Node.js, Composer বা Cloudflare দরকার নেই।

## ১. প্রথমে পুরোনো সাইট সুরক্ষিত রাখুন

বর্তমান `public_html` ফাইল ও MySQL database-এর backup নিন। Git সংযোগ বদলালে Hostinger লক্ষ্য ফোল্ডারের ফাইল বদলে দিতে পারে। পুরোনো `.private/config.php`, uploads এবং database backup স্থানীয়ভাবে/হোস্টিংয়ের নিরাপদ স্থানে রাখুন, GitHub-এ নয়। সম্ভব হলে আগে একটি test subdomain-এ deploy করুন।

এই সংস্করণ নতুন `f06_` prefix-এর টেবিল ব্যবহার করে। পুরোনো অর্ডার/অ্যাডমিন/সেটিংস নিজে থেকে import করবে না এবং পুরোনো টেবিল delete করবে না। পূর্বের backend/schema না পাওয়ায় স্বয়ংক্রিয় migration যোগ করা হয়নি। পুরোনো live orders প্রয়োজন হলে cutover-এর আগে migration করুন।

## ২. GitHub যুক্ত করে deploy

Hostinger → Websites → আপনার সাইটের Dashboard → Advanced → Git → Connect with GitHub।

- Repository: `fly1digital-art/Fly-One-Digital`
- Branch: `main`
- Root directory: `public_html` (ডোমেইনের document root)
- Deploy চাপুন।

সাইটটি domain root-এ চলার জন্য তৈরি; `/shop` বা অন্য URL subfolder-এ নয়। যদি আপনার domain-এর document root আলাদা হয়, সেটিই বেছে নিন। প্রথমে Auto-deployment বন্ধ রাখুন; setup ও test সম্পন্ন হলে প্রয়োজন অনুযায়ী চালু করুন। পরের GitHub পরিবর্তন নিতে Redeploy চাপতে পারবেন।

Official guide: https://www.hostinger.com/support/1583302-how-to-deploy-a-git-repository-in-hostinger/

## ৩. একবারের গোপন config

Hostinger File Manager-এ `public_html`-এর **পাশে**, তার ভেতরে নয়, `f06-private` ফোল্ডার বানান। ফোল্ডারে `config.php` তৈরি করুন। Repository-এর `hostinger/config.example.php`-এর লেখা সেখানে কপি করুন।

```text
আপনার domain-এর folder/
  public_html/       ← GitHub deploy
  f06-private/
    config.php       ← শুধু Hostinger-এ; কখনো GitHub-এ নয়
    media/           ← আপলোড হলে নিজে তৈরি হবে
```

`config.php`-তে দিন:

- `origin`: `https://99fay.shop` (test subdomain হলে তার সঠিক HTTPS URL)
- `db_host`: সাধারণত `localhost`
- `db_port`: `3306`
- `db_name`, `db_user`, `db_pass`: Hostinger-এর MySQL database-এর তথ্য
- `setup_key`: password manager থেকে তৈরি অন্তত ৩২ random অক্ষরের একটি গোপন key
- `checkout_mode`: প্রথমে `demo`
- `meta_pixel_id`: নিজের Pixel ID; ব্যবহার না করলে খালি

PHP Configuration-এ PHP 8.2 বা নতুন এবং `pdo_mysql`, `mbstring`, `fileinfo` চালু রাখুন। `f06-private` folder PHP-এর জন্য writable হতে হবে; file 600 / directory 700 permission যেখানে সমর্থিত। যদি hosting restriction-এ ওই folder পড়া না যায়, একই domain folder-এর private storage access Hostinger support দিয়ে নিশ্চিত করুন; public folder-এ password রাখবেন না।

## ৪. অ্যাডমিন তৈরি

`https://99fay.shop/setup.php` খুলুন। একই setup key দিন, প্রথম admin-এর email/password দিন; চাইলে দ্বিতীয় admin-ও যোগ করুন। Password ১২–৭২ অক্ষর।

Setup সফল হলে config.php-এর `setup_key` খালি করে দিন। Database-এর setup lock-এর কারণে আবার admin তৈরি করা যাবে না। আগের admin passwords এই repository-এ অন্তর্ভুক্ত করা হয়নি; এই সংস্করণের admin এখানে নতুন করে তৈরি করুন।

- Admin login: `https://99fay.shop/login.php`
- Admin panel: `https://99fay.shop/admin`

## ৫. যাচাই করে real order চালু

1. ফোন/WhatsApp: `+8801323527412` যাচাই করুন।
2. মোবাইলে বাংলা, EN বোতাম এবং checkout দেখুন।
3. একটি demo order দিন; admin panel-এ সেটি আসে এবং status বদলানো যায় কি না দেখুন।
4. Admin → সাইট সম্পাদনা → রং ও ভিডিও: public Facebook/YouTube URL অথবা MP4/WebM upload দিন, তারপর **পরিবর্তন সেভ করুন**। সর্বোচ্চ ভিডিও ২০ MB, ছবি ৫ MB। মূল Facebook video URL লাগবে; short share URL নয়। Browser অনুমতি দিলে শব্দ বন্ধ রেখে autoplay হবে।
5. প্রয়োজনীয় সব product/SEO settings save করুন।
6. সব ঠিক হলে Hostinger config.php-তে `checkout_mode` → `live` দিন। এরপর নতুন order বাস্তব COD হিসেবে সংরক্ষিত হবে; পুরোনো demo order demo-ই থাকবে।

## পরে পরিবর্তন

এই repo থেকে update deploy করলে `f06-private` ও MySQL ডেটা অক্ষুণ্ণ থাকবে, কারণ এগুলো Git deploy directory-এর বাইরে। Private folder-সহ database backup রাখুন। পুরোনো config ফাইলকে repository-তে এনে commit করবেন না।

ডেভেলপার: frontend পরিবর্তনের পর `npm ci`, `npm run build:hostinger`, `npm run test:hostinger`, PHP tests (নিচে), তারপর source এবং `webassets/` একসঙ্গে commit করুন। Hostinger-এ build নয়। `hostinger/server/defaults.json` build থেকে তৈরি হয়; source of truth `lib/site-content.ts`। পুরোনো Sites/Cloudflare source রাখা হয়েছে, কিন্তু Hostinger request root `index.php`-তে যায়।

PHP backend tests: PHP 8.2+ CLI এবং local MySQL test database থাকলে `hostinger/tests/README.md` দেখুন। Production config/password tests-এ ব্যবহার করবেন না।
