# Verification

`npm run build:hostinger` builds deployable assets and defaults. `npm run test:hostinger` checks the package, URL validation and default-phone upgrade.

With PHP 8.2+:

```sh
php hostinger/tests/validation.php
find hostinger -name '*.php' -exec php -l '{}' \;
php -l index.php
php -l setup.php
php -l login.php
php -l logout.php
```

Before switching an actual Hostinger store to live mode, use a test database and HTTPS origin, then:

1. Confirm direct requests for `/hostinger/server/core.php`, `/hostinger/config.example.php`, `/.git/config`, `/package.json`, `/app/storefront.tsx` and `/webassets/.vite/manifest.json` are denied by Apache/LiteSpeed.
2. Complete setup with a random key and fresh admin password. Check that a second setup is rejected. Clear the config setup key.
3. Verify a wrong login fails, valid login redirects to `/admin`, and a logged-out `/api/admin/orders` request is denied.
4. Create a demo order. Repeat the same request/token/idempotency key: it must return the same reference. Change its token with the same key: it must reject with 409.
5. Verify tracking without the token is denied. Verify only the matching token retrieves the summary, which excludes customer name/address/phone.
6. Change order/payment status, save product settings, upload an image and video. Reload to confirm persistence. Verify video seeking returns HTTP 206; out-of-range returns 416.
7. Check a different Origin is denied for POST/PATCH requests. Verify unsupported media and oversized files are rejected.
8. Redeploy the same commit and verify database orders/settings and the outside-root media file remain available.

The creation environment ran frontend build/TypeScript tests and PHP syntax/validation checks. A real Hostinger/MySQL deployment was not available here; the database/authentication/deployment smoke checklist above remains necessary before enabling live orders. Never run these checks against production customer records.
