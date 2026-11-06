# Confort4: next admin stage

The user asked to keep an advisor-managed site in mind; an admin interface is not part of this delivery.

## Present boundaries

- `content/site.json` holds structured team and service content, stable member IDs, profile images and page sections. `scripts/build-pages.mjs` builds static pages using shared header/footer templates.
- `confort4.settings`, `confort4.submissions` and `confort4.rate_limits` are private in the existing KW Premier database. No KW tables are changed. Public browsers cannot query these tables or invoke the service-only RPCs.
- `confort4-forms` accepts bounded anonymous form submissions, validates them, persists them, then attempts a Resend notification to a server-configured recipient. Request IDs deduplicate retries. Reviews are pending and do not publish automatically.
- Resend credentials stay in existing Supabase Edge secrets. Notification branding is Confort4; no KW office copy is sent. The recipient is only set after the owner supplies it.

## Future admin implementation

1. Supabase Auth login; explicit membership in a new `confort4.members` table, scoped to this site. Existing KW authentication alone must not grant access. Do not authorize with user-editable metadata.
2. Editable content stored in private versioned Confort4 tables: draft/published page data, profiles, galleries, case studies and selected property IDs. Reuse the structured content model here. Never fabricate past operations.
3. Dedicated storage bucket and policies, separate from KW assets. Upload validation, image optimization and ordering.
4. Leads inbox with follow-up state and controlled exports; review moderation that only approves publication when `publishConsent` is true. Never expose contact emails in a public reviews feed.
5. An authenticated admin API with membership checks for every operation, audit trail and version history. Keep service keys exclusively on the server.
6. An authenticated publish action rebuilds static Pages from approved content or serves a sanitized published-content feed. GitHub credentials must never be shipped to the client. Keep stable public URLs.
7. Retry failed email notifications through a service-authorized job with Resend idempotency keys. Pending records are retained; `email_status` must not be mistaken for email delivery to the inbox.

## Recipient setup

After the owner specifies the destination, update only `confort4.settings.notification_email`. `CONFORT4_FROM` can optionally override the verified address; otherwise the current verified sending address is reused under the name Confort4. No existing project secrets or notification settings are changed.
