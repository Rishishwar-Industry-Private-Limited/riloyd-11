<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- This remix starts with an empty Drizzle migration history; create future database changes through the migration tool rather than restoring the source project's copied migrations, so the new database has its own history.
- Website registrations and enquiries use validated server functions and a durable submission limiter; admin inbox reads/reviews use authenticated RLS-scoped functions, and registration documents stay in private Storage with admin-authorized download by application ID, so visitors cannot access other people's submissions.
- Preserve the summit popup's Zoho embed as its existing submission destination; do not imply those external submissions are in the local admin inbox without a verified synchronization integration.
- Generate submission PDFs and Excel workbooks lazily in the browser from authenticated inbox data; prepare blobs before download clicks and export both inboxes across all pages, so private details remain admin-only and mobile downloads retain user activation.
- Customer reports use a private bucket and admin-only metadata policies; a rate-limited public server function verifies both report number and publish date before issuing a short-lived download URL, so the footer Downloads page never lists private reports.
- Setup diagnostics use an admin-authorized STABLE SECURITY INVOKER catalog RPC and metadata-only storage reads; compare retained SQL declarations plus an explicit legacy application baseline while Drizzle's managed placeholder is empty, and report incomplete coverage rather than claiming schema parity.

- Keep each detailed service layout in `src/components/services/` and select it by slug in `src/routes/services.$slug.tsx`, so service URLs retain one shared metadata and navigation route.
- Keep the Global Presence experience in its own `/global-presence` route, but reach it only from the footer while it is unpublished: no header navigation item and no promoted links elsewhere, and `noindex` on both routes, so the pages stay out of sight until the user re-enables them.
- Keep the full company story in a dedicated `/about` route, while the homepage retains only a short About teaser, so the navigation and metadata remain clear.
- Keep market content centralized and render each country through `/global-presence/$slug`, so the hub and the footer country list stay consistent.
- Manage country logo overrides in an admin-only RLS table and a restricted Storage bucket; a shared query/provider renders overrides across the footer and market pages with bundled artwork as fallback, and unsaved preview messages remain same-origin and parent-scoped.
- Keep Investors, Mentors and Team as public pages; employee verification goes through security-definer database functions and admins manage records at `/admin`, so codes stay hashed and never reach the browser.
- Optimize static images offline before serving them; preserve dimensions and transparency, use lossless compression for logos, and keep the original format when conversion would increase file size, so appearance stays consistent without runtime image processing.
- Import static website images directly from local frontend asset files so managed Git sync includes the actual image bytes; retain unused historical CDN pointers without deleting hosted assets to preserve earlier deployments.
- Investor, Mentor and Team profiles live in the backend, are readable only by signed-in users and editable only by admins at /admin, so no sample or private profile data ships in the site code.
- Approving a registration (status approved) publishes a public-safe profile (no email/phone) to the matching Investors/Mentors/Startups/Businesses page via a database trigger keyed by source_application_id; any other status removes it, so admin review is the single publish switch.
- Admin AI review summaries call the AI Gateway only from an admin-checked server function and exclude applicant contact details from the prompt, so private data stays minimal.
- Store country programme fees in a public-readable, admin-write RLS table and validate changes through authenticated server functions; unknown fees stay null so the site never invents prices.
- Keep international service scope and country context in one shared browser-safe module, with country pages under the existing dynamic market route and verified payment accounts on a separate route, so country navigation and programme pricing stay consistent.
- Keep country-page editorial detail in a browser-safe content module and reusable presentation sections, with separately imported HD market artwork, so existing service facts can be adapted without duplicating fees or expanding overseas service scope.
- Keep the separate prototype programme's rules and timelines in a browser-safe module used by its page and tests; do not reuse summit registration or claim a programme-specific submission destination until verified, so programme prices and applications stay distinct.
- Prototype eligibility AI uses a validated same-origin streaming server route, shared published criteria and a durable service-only access-denial circuit breaker; it never stores descriptions or submits applications, so advice stays separate from selection.
- Generate the static applicant PDF from the shared prototype programme module and ship it under public/downloads; regenerate after criteria changes so the download stays aligned with the page.
- Use small country preview images for market cards, retain full-HD country heroes, and attach silent autoplay video only near the viewport, so offscreen media does not compete with the first screen.
