# F-06 — বাংলা ক্যাশ অন ডেলিভারি স্টোর

একই পেজে পণ্যের gallery, checkout, confirmation, ডিভাইসের order history ও server থেকে status refresh। আলাদা /admin পেজে অনুমোদিত বিক্রেতা অর্ডার দেখবেন এবং status বদলাবেন।

ডিফল্টে demo mode। বাস্তব ডেলিভারি বা payment collection হয় না। নাম, ফোন ও ঠিকানা server database-এ থাকে; browser history-তে order summary ও private lookup token থাকে।

## লোকালে চালানো

Node.js 22.13+ ও npm প্রয়োজন।

1. npm ci
2. .env.example থেকে .dev.vars তৈরি করুন। CHECKOUT_MODE=demo রাখুন।
3. npm run build
4. প্রথমবার লোকাল database তৈরি করুন:

    node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_easy_thunderbird.sql

5. npm run dev -- --hostname 127.0.0.1

Terminal-এ দেওয়া ঠিকানা খুলুন। তৈরি build পরীক্ষা করতে npm start ব্যবহার করা যায়। একই database-এ initial SQL দ্বিতীয়বার চালাবেন না। কোনো real customer data দিয়ে পরীক্ষা করবেন না। লোকাল mock sign-in হচ্ছে seedy@sites.test; কেবল লোকাল admin পরীক্ষা করতে .dev.vars-এর ADMIN_EMAILS-এ এই ঠিকানা ব্যবহার করা যায়। Production-এ এই test account অনুমোদন করবেন না।

## Sites-এ প্রকাশ ও বাস্তব অর্ডার

Existing Site ID .openai/hosting.json-এ আছে। একই Site-এর source/build/deploy workflow ব্যবহার করুন। Logical D1 binding DB এবং drizzle migration অন্তর্ভুক্ত আছে; production-এ migration সফল হওয়া যাচাই করুন। Source archive-এ credentials বা পরীক্ষার database নেই।

Sites-এর নিরাপদ environment settings-এ:

- CHECKOUT_MODE=demo: পরীক্ষা। কেবল মালিকের অনুমোদনের পরে live দিলে বাস্তব COD order গ্রহণ চালু হবে।
- ADMIN_EMAILS: অনুমোদিত বিক্রেতার ChatGPT sign-in email; একাধিক হলে comma দিয়ে লিখুন। ফাঁকা থাকলে admin access বন্ধ।
- META_PIXEL_ID: ঐচ্ছিক। ফাঁকা থাকলে tracking বন্ধ। এটি দিলে গ্রাহকের consent নেওয়া হয়।

কোনো password, token বা secret source code কিংবা chat-এ লিখবেন না। বর্তমান private audience স্বয়ংক্রিয়ভাবে public করা হয় না। বিজ্ঞাপনের জন্য public access প্রয়োজন হলে মালিকের নির্দেশে sharing বদলাতে হবে।

## সম্পাদনার জায়গা

- lib/product.ts: মূল্য, delivery fee, contact ও validation। বর্তমান মোট ঢাকায় ৮৬৯ ও ঢাকার বাইরে ৯২৯ টাকা।
- app/storefront.tsx: বাংলা copy, gallery, FAQ, delivery/return policy ও checkout।
- app/globals.css: design ও responsive layout।
- app/layout.tsx: title, description ও social preview URL। অন্য domain হলে metadataBase বদলাতে হবে।
- app/api/orders: server validation, durable order, idempotency, private tracking ও event claim।
- app/api/admin/orders: authenticated order management।
- lib/analytics.ts: consent ও Meta events।

COD order গ্রহণ ও টাকা পাওয়া আলাদা status। WhatsApp খোলায় message স্বয়ংক্রিয়ভাবে পাঠানো হয় না। Purchase কেবল সফলভাবে সংরক্ষিত live order-এ server claim পাওয়ার পরে পাঠানোর চেষ্টা হয়; demo বা history খোলায় Purchase হয় না। বিজ্ঞাপন blocker/network failure-এর কারণে event delivery নিশ্চিত নয়; analytics ব্যর্থ হলেও অর্ডার অক্ষুণ্ণ থাকে।

## লঞ্চের আগে বাকি

- প্রকৃত delivery সময়সীমা ও return/exchange policy দিন।
- বাস্তব অর্ডার চালুর অনুমতি ও admin হিসেবে অনুমোদিত email নিশ্চিত করুন; নিরাপদ Sites settings-এ সংযোগ সম্পন্ন করুন।
- Tracking চাইলে Meta Pixel ID দিন এবং Meta test events দিয়ে বাস্তব integration যাচাই করুন।

মূল্য ও delivery fee ইতিমধ্যে নির্ধারিত আছে।

## ভাষা, থিম ও নিরাপত্তা

বাংলা/English এবং light/dark সেটিংস একই নকশায় কাজ করে। পছন্দ এই ব্রাউজারে রাখা হয়; ভাষা বা থিম বদলালে চলতি ফর্মের তথ্য অক্ষুণ্ণ থাকে। lib/translations.ts-এ অনুবাদ এবং app/preferences.tsx-এ সেটিংস আছে।

JSON request body সর্বোচ্চ 8 KiB; same-origin যাচাই, private/no-store API response এবং CSP/security headers রয়েছে। D1-এ atomic shared rate limit: ফোনপ্রতি ঘণ্টায় সর্বোচ্চ 5 নতুন order attempt, client IP পাওয়া গেলে endpointপ্রতি মিনিটে 60, এবং site-wide ceiling। Admin allowlist default-deny থাকে। এগুলো প্রতিরক্ষার অতিরিক্ত স্তর; পূর্ণ security audit-এর বিকল্প নয়।

নতুন লোকাল সেটআপে initial migration-এর পরে drizzle/0001_moaning_spitfire.sql-ও একই d1 execute পদ্ধতিতে চালান। আগে প্রয়োগ করা migration পুনরায় চালাবেন না।

Meta server-side Conversions API এই সংস্করণে যোগ করা হয়নি; এটি কেবল সম্ভাব্য সুবিধা হিসেবে আলোচনা হয়েছে। বিদ্যমান browser Pixel আচরণ বজায় আছে। Site-এর বর্তমান public audience বজায় রাখা হয়েছে; বাস্তব checkout চালু এবং production admin অনুমোদন আলাদা settings।


## Content editor and appearance

- /admin requires the configured ADMIN_EMAILS allowlist and Sites sign-in. It edits both languages, product details, nationwide delivery fee, pictures, YouTube video, section visibility and SEO.
- /editor-demo shows a public sample editor without order/customer data; changes there do not publish.
- Ten preset palettes and custom RGB colours are available in the header. Visitor preferences persist only in that browser. The admin palette sets the default for visitors without an override.
- Orders use the saved server price plus one nationwide Bangladesh delivery fee (default BDT 130). Existing orders retain their original totals.
- Images accept JPG/PNG/WebP up to 5 MB through authenticated uploads into MEDIA storage.
- The included YouTube sample is labelled as a player demonstration, not an F-06 product demo. Replace its link in the editor. Playback loads on click and starts muted where the browser permits autoplay.
- Checkout remains in demo mode until explicitly configured for real orders. Meta CAPI is not enabled.
- This source package uses Sites/Cloudflare D1 and R2 with Sites authentication. It is not a direct Hostinger shared-hosting upload; Hostinger database/auth/storage need a separate port once the hosting plan is known.

## October 2026 storefront update

- Default phone and WhatsApp: +8801323527412. The old default saved phone is upgraded when settings are read; custom admin numbers are preserved.
- Every fresh page load starts in Bangla. The EN button switches the current page to English.
- Admin → Site editor → Colours and video accepts a public Facebook video/reel URL, YouTube URL, or an uploaded MP4/WebM (up to 20 MB). Use the original Facebook video URL, not a shortened share link. Upload and then save settings. Videos are stored in the existing MEDIA R2 binding; the selected URL is stored in the settings document. No schema migration is needed.
- Playback requests muted autoplay on page load, with player controls and an external link fallback. Facebook privacy/embedding settings and browser autoplay restrictions can prevent playback.
- Advertising consent is a compact Yes/No bar, with the existing Meta Pixel consent gating preserved.
- This repository is still the Sites/Cloudflare implementation, not the separate PHP installation on 99fay.shop. It requires D1, R2 and Sites authentication. Uploading this source to Hostinger PHP shared hosting will not deploy it. No live deployment is performed by a GitHub commit.
