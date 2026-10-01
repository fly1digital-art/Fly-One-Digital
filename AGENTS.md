# Site maintenance

This repository contains the F-06 sunglasses website. The owner requested automatic GitHub upload of assistant-made changes to `fly1digital-art/Fly-One-Digital` after each completed task. Fetch the latest main branch, preserve others' changes, verify updates and use a non-force push. Respect platform approvals and branch protections.

## Hostinger deployment target

The owner chose direct Hostinger PHP deployment on 2026-10-01. The root `index.php`, `.htaccess`, `hostinger/server/` and checked-in `webassets/` are the deployable application. Reuse the shared React storefront and admin components. Always run `npm run build:hostinger` after frontend/default changes and commit regenerated `webassets/` and `hostinger/server/defaults.json` alongside source. Run `npm run test:hostinger`; run PHP validation and applicable integration tests too.

Hostinger uses MySQL and PHP sessions, not Cloudflare D1/R2 or ChatGPT login. Do not deploy a new Sites version for a Hostinger-only request. Preserve the original Sites source; `npm run build` builds that separate target.

Credentials and uploads live in `../f06-private/`, outside `public_html`. Never commit secrets, customer records, database exports or runtime uploads. Schema updates must be additive and non-destructive. Existing legacy orders are not automatically migrated; do not claim they are.

GitHub updates do not prove that Hostinger deployment happened. The owner controls Hostinger deployment unless explicitly asking the assistant to deploy. Manual Hostinger changes are not automatically synchronized back to GitHub.
