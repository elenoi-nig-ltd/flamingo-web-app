# Marketplace Spec — Implementation Plan

Tracks the gap between the live site and the client's 12-section spec.
Source: `Flamingo_Marketplace_Implementation_and_SEO_Specification.pdf` (byte-identical to
`live-site-audit.pdf`). Branch: `feat/homepage-marketplace-reposition`.
Started 2026-09-30. Tick items as they land.

**Delivered in sections, not all at once.** The client is being given sections one at a time. Work
the sections below in order — they are ordered by dependency, so a later section assumes the
earlier ones landed. Section 1 is the target for the next meeting (2026-10-02); the rest are
sequenced to follow.

---

## Scope boundary

**In scope:** the PDF spec — that is the client's requirement.

**Beyond the spec (recorded, not scheduled):** admin-managed locations, admin-managed marketplace
categories, and a client-authored guides/blog section. None are asked for by the PDF. The first two
are deferred because the client may want to expand to other states "but not any time soon"; the
model and URL decisions for that day are in memory (`flamingo-location-model-decisions`). The
guides CMS is Section 6 below, pending the user's decision.

---

## Hard constraints (carried from earlier sessions — do not violate)

- **Never run `npm run build`, typecheck or lint on this repo.** The app is in production and the
  user verifies by running it. Because the compiler can't catch them, **verify every new import by
  hand** against `node_modules` before writing it (e.g. confirm icon names in
  `node_modules/lucide-react/dist/lucide-react.d.ts`).
- **Verify by running the app:** `npm run dev` (turbopack, port 3000), then `curl` the page and
  confirm the content is in the **server HTML**, not just after hydration.
- **After any `globals.css` edit:** the dev server serves a **stale CSS chunk** and the chunk name
  doesn't change. Kill the server by PID, `rm -rf .next/cache`, restart, and verify against the
  compiled CSS. Tell the user to hard-refresh.
- **Real icons, never emoji.**
- **Backend `area` means floor size in square metres.** Any new location field must not be called
  `area` — that collision is what made `resolvePropertyAreaSlug` throw and silently empty every
  listing page.
- **Don't edit `tailwind.config.js`** — it is dead (Tailwind v4, no `@config` directive).
- **Brand orange stays `#f58c55`.** Settled; do not re-propose.
- **Header is light in light mode, `gray-900` in dark.** Header controls need their `dark:` twins
  or they vanish in one theme.

---

# Section 1 — Backend foundation + the verified flag

**Target: next meeting (2026-10-02).**

**Why this is first:** five separate spec gaps close with one additive schema pass, and the
frontend items in Sections 3–5 are all blocked on it. It also fixes the single hardest blocker
found so far — see B8.

Repo: `flamingo-web-backend` (NestJS + Mongoose). All of B1–B6 are **additive and non-breaking**:
optional field + DTO + landlord form input.

- [x] **B1. Structured location on `real-estate.schema.ts`** — `state`, `city`, `areaName`, and a
      stored `slug`. Spec §4/§5. Must not be named `area`.
      *Why:* the frontend parses the free-text `address`, and `resolvePropertyAreaSlug`
      (`src/config/urls.ts`) **silently defaults to `gidan-kwano`** when nothing matches —
      confirmed live on "Alheri Lodge Gidan-Mangoro", a real Flamingo location filed under the
      wrong area. This is what lets the default be deleted.
- [x] **B2. `listingType`** (`rent` | `sale`) — spec §6 Rent/Sale filter.
      `resolvePropertyCategorySlug` already reads `listingType`, so it lands into working code.
- [x] **B3. Amenity fields** — `parking`, `water`/`borehole`, `furnished`, plus actually populating
      `amenities: string[]`. Spec §6 card fields + the furnished filter.
- [x] **B4. Verification tiers** — `verificationLevels: ('phone' | 'seller' | 'property')[]`,
      replacing the single `verified` boolean. Spec §7. `deriveVerificationLevels` in
      `VerifiedBadge.tsx` already accepts a `levels` array.
- [x] **B5. Listing status + expiry** — `status` (`active` | `expired` | …) and `expiresAt`.
      Spec §11 expired-listing handling.
- [ ] **B6. Save / Report endpoints** — a save (favourite) relation and a report submission.
      Spec §6. Only needed by F5 in Section 4, so it can slip if time is short.
- [x] **B8. Make `verified` writable — the one hard blocker.** *(This is the code half of spec
      sprint item #7.)* Add an admin endpoint (`PATCH /real-estates/:id/verify`) guarded with
      `JwtAuthGuard, RolesGuard` — `AdminRoleGuard` already exists in `src/common/guards/`.
      **Nothing in the backend can currently set `verified: true`:** it is hardcoded `false` in
      three places (`real-estate.repository.ts:18`, `real-estates.controller.ts:88` and `:219`),
      the update DTO omits it, and a repo-wide grep finds no write. So 0 verified listings is
      **structural, not a data gap** — and without this, §7's badges stay unreachable and §9's
      VERIFIED LISTINGS rail stays empty no matter how many listings are entered.
      **Done** on `feat/verified-flag-admin-endpoint` (backend): `PATCH /real-estates/:id/verify`
      with `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(UserRole.ADMIN)` and a new
      `SetVerifiedDto`; `RealEstateRepository.setVerified()` is the only write path. Create-time
      `false` is kept. Frontend: `setRealEstateVerified` in `useRealEstates`, and a
      Verify/Unverify toggle plus a verified pill in `EstateManagement.tsx`.
      *Two notes from the work:*
      - Of the three "hardcoded `false`" sites, **only `real-estate.repository.ts:18` was a write** —
        `:88` and `:219` are Swagger response examples. That one is untouched (create still pins false).
      - **The flag was already reachable, contrary to the diagnosis above.** `main.ts` runs
        `ValidationPipe({ transform: true })` with **no `whitelist`**, so an undecorated body field
        survives the DTO transform and was passed straight into `findByIdAndUpdate` by `update()` —
        meaning `PUT /real-estates/:id` with `{"verified": true}` would have set it, as the listing's
        own landlord. Not empirically confirmed (no `node_modules` to run against), so it needs a
        runtime check. `update()` now discards `verified` defensively. **The same hole still applies
        to every other undecorated field on every DTO in the API** — notably `landlordId`, which would
        let an owner reassign a listing. Real fix is `whitelist: true` globally; needs a decision,
        tracked as the security aside below.
- [x] **B7. Guard the open controllers** *(security, not spec — confirm before changing)*.
      `/categories` (`src/categories/category.controller.ts`) has **zero `@UseGuards`**; create,
      rename and delete are open to anyone who can reach the API. The only global guard is
      `ThrottlerGuard`, not auth. `home-item-categories` is inconsistent the same way: its `:id`
      routes use `JwtAuthGuard`, its `POST` doesn't.

---

# Section 2 — Listings data (client-side, gates every visible result)

**This is the data half of spec sprint item #7.** No code — but Sections 3–5 demo as *empty rails*
until it lands, so it sits here deliberately, before the frontend work that shows it off.

- [ ] **Enter genuine Gidan Kwano listings.** The admin UI already exists and does full CRUD:
      `/admin/dashboard/real-estates` → `EstateManagement.tsx`, with image upload via
      `src/utils/cloudinary.ts` (browser → Cloudinary, URLs into `images[]`). `POST /real-estates`
      is `JwtAuthGuard` only, so an authenticated admin session can create listings today.
- [ ] **Mark the inspected ones verified** — using B8, and only after a real visit, since §7
      defines Property Verified as *existence and basic listing information physically confirmed*.
- [ ] **Target ~15–25 listings** with a spread of property types and a handful verified. The
      homepage has four listing rails plus area and category hubs; under ~10 listings the rails
      still read as thin.
- Per-listing data required by the DTO and schema: title, description, price, address,
  propertyType, bedrooms, bathrooms, **`area` in m²**, photos. Two friction points to plan around:
  **`area` is required and non-skippable** (informal landlords rarely know their floor area, so
  someone must measure or estimate), and photos have to actually be taken.
- **Decision needed: the ownership/contact model.** `landlordId` comes from the JWT user, so
  listings created through the admin UI are owned by *that* account. Contact falls back to
  `SITE_CONTACT.phone` when no landlord phone is attached, so **Call Advertiser / WhatsApp dial
  Flamingo, not a landlord**. That's a legitimate agent model and the fallback already supports it
  — but it has to be a deliberate choice.

---

# Section 3 — Frontend consumes it (spec §6 card fields, §7 badges)

- [ ] **F9. Delete the `?? 'gidan-kwano'` default** in `resolvePropertyAreaSlug` now that B1 is
      populated, so an unknown area segment 404s instead of silently mis-filing. The live bug, not
      a nicety.
- [x] **F1. `PropertyCard` card fields** — spec §6. `parking` and `water/borehole`
      (`PropertyCard.tsx:30-34`) are gated on `amenities`, which **the backend never sends**;
      `lib/properties.ts:152` coerces absent → `[]`, so both are permanently false and the icons
      never render. Wire to B3, show a label not just an icon, add `furnished`.
      Same dead branch: `ListingDetailView.tsx:177` (`amenities.length > 0`) never renders.
- [ ] **F2. Verification badges** — spec §7, all three tiers:
      - `deriveVerificationLevels` (`VerifiedBadge.tsx:61-69`) maps `true → ['property']`,
        `false → []`, so **Phone and Seller Verified are unreachable by construction**, and an
        unverified listing shows no badge at all — the inverse of the trust signal the spec wants.
      - `VerifiedBadgeRow` caps at `max = 2` + a `+1` chip; raise it so a 3-tier listing is complete.
      - `VerificationLegend` (the explicit definitions the spec demands) renders only on the
        listing detail page — add it to hub, area and category pages too.
      - Confirm the badge copy never implies a transaction guarantee.

---

# Section 4 — Property listing experience (spec §6)

- [ ] **F3. `/real-estates` listing experience.** Decision needed first:
      - [ ] **Decide:** point `/real-estates` at `PropertyListingView` (already used by `/minna/*`
            and `/search`, with intent/price/bedrooms/type/verified/newest) **or** upgrade
            `RealEstatesInterface`. *Recommendation: point it at `PropertyListingView`* — the better
            component already exists, and re-implementing filters in the other one is the duplicate
            work this plan should be removing.
      - [ ] Wire the **Buy/Rent buttons** — `RealEstatesInterface.tsx:259-264` has styled buttons
            with **no `onClick` at all**. They currently do nothing.
      - [ ] Add the **verified toggle** and a **newest** sort (the select offers only price / area,
            `:352-359`).
      - [ ] Its cards (`:361-411`) render only price/title/area/beds/baths — no verification badge,
            no date posted. Align with `PropertyCard`.
- [ ] **F4. Missing filters** — spec §6: **furnished/unfurnished** (absent site-wide, needs B3) and
      an **area filter control** (area exists only as URL hubs today).
- [ ] **F6. Legacy `/real-estates/[id]` detail page** — spec §6. `PropertyDetails.tsx` lacks
      WhatsApp, Save and Report entirely (it has Book Now + a `mailto:` contact). Align it, or
      confirm it as a legacy shim alongside its existing canonical redirect.
- [ ] **F5. Persist Save Property and Report Listing** — spec §6. Both are UI-only today: Save is
      local component state (`ListingDetailView.tsx:266-278`), Report opens a modal with no API
      submit (`:346-419`). Needs B6. Also decide who receives a report.

---

# Section 5 — SEO completion (spec §11)

- [ ] **F7. Expired listings** — spec §11. Render an expired state and 404 removed listings; needs
      B5. `getPublicProperties` currently filters nothing.
- [ ] **C1. Google Search Console + analytics** — spec §11. Nothing exists: no GA, GTM,
      `google-site-verification` or plausible anywhere in the repo. The only tracking is first-party
      `TrafficTracker.tsx` → your own `/admin/analytics/traffic`.
      **External dependency — needs the client's GA property and Search Console access**, so this
      may not be closable inside the sprint. Ask at the next meeting.
- [ ] **F10. Section headings** — spec §9 shows uppercase section titles ("HOUSES FOR RENT IN
      MINNA"); `SectionHeading.tsx` renders sentence case with no uppercase transform. Cosmetic —
      confirm whether the spec's casing is intended or just PDF styling.
- [ ] **F8. Homepage "VERIFIED LISTINGS" rail** — spec §9/§7. Renders correctly but is **empty
      today** (heading + "No verified listings yet"). Closes itself once B8 + Section 2 land. No
      code expected.
- [ ] **C2. Confirm the nine categories can carry inventory** — spec §3. All nine are configured,
      but **Vehicles, Jobs and Services have no backend module at all**; Properties and Internet
      have dedicated modules, Home & Furniture maps to the separate Home Items catalogue, and
      phones/electronics/food would ride the generic Products module. A category with no inventory
      model is an **empty hub page** — a thin-content risk for the sitemap, which currently
      enumerates every area × category combination. Decide per category: build, point at an
      existing catalogue, or keep it out of the sitemap until it has listings.

---

# Section 6 — Client-authored guides (BEYOND SPEC — pending decision)

The client wants to write guide articles himself, as a mini blog. **Not asked for by the PDF** —
§10's ten articles already exist and are complete. Recorded here as a candidate, not scheduled
work.

- [ ] **Decide whether this is wanted at all.** It only pays off if he will genuinely self-serve;
      if he writes rarely, keeping `src/config/guides.ts` and adding articles on request is
      near-zero work. Ask how often he expects to write.
- [ ] If yes: a new backend articles module — `title`, `slug`, `seoTitle`, `description`, `body`,
      cover image, `tags`, `readMinutes`, `published`, `publishedAt` — plus admin CRUD **guarded
      properly** (don't repeat the unguarded `/categories` mistake, see B7).
- [ ] Switch the four hardcoded consumers from config to data: `minna-guide/page.tsx` (index),
      `minna-guide/[slug]/page.tsx` (`getGuideBySlug` + `generateStaticParams`), `GuideTeaser.tsx`
      (homepage rail) and `sitemap.ts`. Same shape as the location/category swap.
- [ ] **Keep the existing block body format.** `GuideBlock` (`{ type: 'p' | 'h2' | 'ul', text?,
      items? }`) is already built and already renders. It gives a non-technical author
      paragraph/heading/bullet buttons with no syntax to learn and makes HTML injection
      structurally impossible. Markdown or HTML would need a new dependency — there is **no
      markdown or rich-text library in `package.json`** today, and `dompurify` is only present as a
      transitive dependency, so importing it directly would be fragile. Add `image`/`quote` block
      types if he needs them.
- [ ] **Slug and draft rules** (same as locations): slug generated server-side and immutable after
      publish (or a 301 on rename); a `published` flag so drafts never enter the sitemap or get
      indexed — a self-serve blog makes draft leakage a real risk, since he will save half-written
      posts. Sitemap and homepage teaser read published articles only.
- [ ] **Flag the quality bar to the client.** §10 asks for articles "supported by real marketplace
      observations and data rather than generic keyword-heavy articles". A CMS provides the format,
      not the substance — and unbounded articles are the same thin-content risk as empty category
      hubs.

---

## Conflicts between the spec and reality (recorded, not silently skipped)

- **§2 "POST AN AD - FREE"** — not deliverable as written. The public ad system (`Advertisement`)
  is **paid banner advertising** (image, target URL, Paystack, impressions), not free classifieds.
  Decided earlier: the CTA is property-first and honest — `/landlord/add-properties` is free,
  `/create-ad` is paid. Revisit only if the client wants a real free-classifieds module built.
- **§7 "Flamingo Verified"** — the three tiers must not imply a transaction guarantee. Badge copy
  has to stay explicit about what each tier confirms.
- **§11 analytics** — blocked on client access (C1), so it may not be closable in this sprint.

---

## Already done (for reference — keeps this file the single spec tracker)

- [x] §1 Homepage reposition — `9415bd2`, `b7d5834`, `2c21ab0`, `191e293`
- [x] §2 Search at the centre — `/search` (`a51514d`), `HeroSearch`, `Hero`
- [x] §3 Nine-category taxonomy — `f221d80` (caveat: C2 above)
- [x] §4 Location architecture in URLs — config + `/minna` route tree (caveat: F9)
- [x] §5 Permanent per-listing URLs — `src/app/minna/[...slug]/page.tsx`
- [x] §6 Property-first marketplace — canonical detail page carries all five actions (UI only; F5)
- [x] §8 Property loading — server-rendered with an 8s `FETCH_TIMEOUT_MS` bound (`a52b21a`)
- [x] §9 Homepage sequence — every required section renders (`MarketplaceHome.tsx`)
- [x] §10 Minna Information Centre — all ten articles exist (`src/config/guides.ts`)
- [x] §11 Sitemap, robots, canonicals, OG, JSON-LD, alt text, custom 404 — `df0e6cb`
      (outstanding: F7 expired listings, C1 analytics)
- [x] §12 Branding architecture — footer presents the umbrella hierarchy (header and metadata do not)

---

## Deferred backlog (agreed, not scheduled)

- **Admin-managed locations** — model, URL preservation and non-technical-admin safeguards already
  decided; see memory `flamingo-location-model-decisions`. Trigger: the client wants to expand
  beyond Minna.
- **Admin-managed marketplace categories** — no slug/subcategory/ordering fields on the backend
  `Category` model today (`{ name, description }` only), so the existing CRUD can't drive
  `/minna/<area>/<category>` URLs. Reuses the same admin patterns as locations.

---

## Verification protocol (every item)

1. `npm run dev`, then `curl` the affected route and confirm the content is in the raw server HTML.
2. Re-check dark mode for any UI touched — both themes, since header controls need `dark:` twins.
3. For `globals.css` changes: kill the server by PID, `rm -rf .next/cache`, restart, verify against
   compiled CSS, and tell the user to hard-refresh.
4. Hand-verify every new import against `node_modules` before writing it (no compiler safety net).
5. Confirm no new listing text implies a transaction guarantee (§7).
