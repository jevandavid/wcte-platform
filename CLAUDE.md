# WCTE Module 2 — Auto Email Sender
## Claude Context File (`CLAUDE.md`)

---

## Purpose

Module 2 is a **standalone, single-file HTML application** (`wcte_module2_FINAL.html`) that allows WCTE staff to send personalized competition welcome emails to studio owners in bulk. It is self-contained — no server, no backend, no build step. It is hosted on GitHub Pages at `https://hub.wctedance.com`.

---

## File

| File | Description |
|------|-------------|
| `wcte_module2_FINAL.html` | The complete app — UI + email template generator + EmailJS send logic |
| `wcte_module2_email_preview_FINAL.html` | Standalone email preview (same template, no sender UI) |

**Naming convention:** All updates must be saved as `wcte_module2_FINAL.html` (overwrite in place). Do not rename or version the file.

---

## Architecture

- **No backend.** Pure HTML + vanilla JS + EmailJS SDK.
- **No build process.** Edit the `.html` file directly. Everything — styles, logic, email template — lives in one file.
- **EmailJS** handles all email delivery. The app generates full HTML email bodies client-side and passes them to EmailJS as a variable.
- **Data is session-only.** Studio list, send statuses, and event fields are in-memory JS. Nothing persists on page refresh (Module 3 adds localStorage persistence).

---

## EmailJS Credentials (Hardcoded — Do Not Change)

```js
const EJS_SERVICE_ID  = 'service_dw0woxo';
const EJS_TEMPLATE_ID = 'template_rv6agoo';
const EJS_PUBLIC_KEY  = 'gLlv1ombHvG9bjmcV';
```

These are hardcoded constants at the top of the `<script>` block. They must never be moved to inputs or config UI.

**All email types (Regional, Nationals–Virginia Beach, Nationals–Mystic) use the same EmailJS Service ID, Template ID, and Public Key.** The template switcher is a content switcher only — credentials do not change between templates.

### EmailJS Template Requirements

The EmailJS template (`template_rv6agoo`) must accept exactly two variables:

| Variable | Type | Description |
|----------|------|-------------|
| `to_email` | string | Recipient email address |
| `html_body` | string | Full rendered HTML email body |

The template must use `{{{html_body}}}` (triple curly braces) for unescaped HTML rendering. All email content and formatting is generated inside the app — the EmailJS template editor contains only the shell.

### EmailJS Size Constraint

EmailJS has a **50KB payload limit**. The `html_body` variable is a rendered HTML string. Keep the generated email HTML compact. Never pass large base64 images or inline assets through EmailJS variables — use external URLs instead.

---

## UI Structure

The app has five tabs rendered as a single-page layout:

| Tab | ID | Purpose |
|-----|----|---------|
| Event Setup | `tab-setup` | Fill in event name, dates, venue name, venue address |
| EmailJS Config | `tab-config` | Read-only display of hardcoded credentials + status indicator |
| Studio List | `tab-studios` | CSV import, manual entry, roster table with inline editing |
| Preview | `tab-preview` | Template selector dropdown (3 options) + live iframe preview of the generated email |
| Send | `tab-send` | Send scope, delay slider, progress bar, send log |

---

## Event Fields

Collected from the Event Setup tab. All fields feed directly into `generateEmailHTML()`.

| Field ID | Label | Fallback |
|----------|-------|---------|
| `eventName` | Event Name | `'WCTE Dance Competition'` |
| `startDate` | Competition Start Date | `'TBD'` |
| `endDate` | Competition End Date | `'TBD'` |
| `venueName` | Venue Name | `'Venue TBD'` |
| `venueAddress` | Venue Address | `''` |

All fields trigger `refreshPreview()` on `oninput` — the iframe preview updates live.

---

## Studio List & Data Model

Each studio in the `studios[]` array has this shape:

```js
{
  id: Date.now() + Math.random(),   // unique float
  name: 'Studio Name',
  email: 'email@example.com',
  status: 'pending' | 'sending' | 'sent' | 'error'
}
```

### CSV Import Format
```
Studio Name,email@domain.com
Elite Dance Academy,director@elitedance.com
```
One studio per line. Parser uses `parts[0]` as name and `parts[parts.length - 1]` as email (last comma-delimited value), so studio names with internal commas are tolerated.

---

## Email Templates

The app supports multiple email body templates selectable from the **Preview tab**. All templates share the same EmailJS credentials — the selector is a **content switcher only**.

### Template Selector (Preview Tab)

A dropdown at the top of the Preview tab controls the active template:

| Option | Value | Build Function | Source Document |
|--------|-------|----------------|------------------|
| Regional Welcome | `regional` | `buildRegionalEmail(studioName, event)` | `WCTE_Competition_Information_Welcome.docx` |
| Nationals – Virginia Beach | `nationals_vabeach` | `buildVirginiaBeachEmail(studioName, event)` | `Pre_Event_Director_Virginia_Beach.docx` |
| Nationals – Mystic, CT | `nationals_mystic` | `buildMysticEmail(studioName, event)` | `Pre_Event_Director_Information_Mystic_.docx` |

- **Default on load:** Regional
- **No localStorage persistence** — resets to Regional on page refresh (intentional)
- The selected template determines which build function fires on both preview refresh and at send time
- The active template label is displayed as a badge in the Preview tab header so staff can confirm before sending

### Architecture Decision: Three Flat Functions (Not Shared-Template-With-Variants)

Virginia Beach and Mystic are **not** simple venue/date swaps of one shared template. The two source documents are structurally parallel (same section order) but diverge in real content: different entry-revision deadlines, different dressing-room policies, a Props section unique to Mystic, different Theme Day-to-date mappings (same theme names, different days), different Elite Event/Title Presentation times, different attire formality language (semi-formal vs. semi-casual), and a venue rules section unique to Virginia Beach. Parameterizing this into one function would require enough conditional branching to make content-fidelity verification harder, not easier. Three independent, fully-readable functions were chosen deliberately over a shared-template-plus-variant-data approach.

### Send Logic Integration

At send time, `startSend()` reads the active template selection:

```js
const activeTemplate = document.getElementById('templateSelect').value;
let html_body;
if (activeTemplate === 'nationals_vabeach') html_body = buildVirginiaBeachEmail(studio.name, event);
else if (activeTemplate === 'nationals_mystic') html_body = buildMysticEmail(studio.name, event);
else html_body = buildRegionalEmail(studio.name, event);
```

### `buildRegionalEmail(studioName, event)`

Formerly `generateEmailHTML()`. Returns the full Regional Welcome HTML email string. Structure unchanged from Module 3.

### `buildVirginiaBeachEmail(studioName, event)`

Nationals welcome email for the Virginia Beach Championship at The Sandler Center for the Performing Arts (July 6–9, 2026). Built from `Pre_Event_Director_Virginia_Beach.docx`. Key content distinct from Mystic:

- Side cast entrance policy for dressing-room access; bags checked if entering via front lobby
- Entry revision deadline: Thursday, June 25, 2026, 5:00 PM
- Elite Event / Title Presentation / Opening Number: Thursday, July 9, 2026, 11:00 AM
- Semi-**formal** attire recommended for Title Awards Presentation
- Theme Days: Mon Tropical Vibes → Tue Magic Awaits → Wed Studio Spirit Takeover → Thu Red Carpet Elite Event
- **Sandler Center Venue Policies section** (see below) — unique to this template, not present in Mystic

#### Sandler Center Venue Policies (Virginia Beach only)

A dedicated, clearly-delineated section near the **end of the email, before the footer** — content arrives after the welcome/excitement content, consistent with how Regional handles policy-heavy material (photography, livestream).

- **Source:** `Dance_Competition_Rules_-_Studios_2026.pdf`, authored and supplied by the Sandler Center for the Performing Arts (the venue), not WCTE.
- **Intro framing (approved language):** *"The Sandler Center for the Performing Arts has asked us to share the following venue policies with all studios and families:"*
- **Reproduction requirement: verbatim, unparaphrased.** Every rule must remain intact — food/beverage restrictions (concessions-only in lobby, all outside food/drink confined to dressing rooms via performers' entrance, no thermoses in lobby or house), no food anywhere in the theater/stage/wings, no rehearsing in first-floor lobby, no balloons/confetti/sand/beach umbrellas/open flames, no open wifi, dressing room reassignment policy, shoes-required-in-lobby-and-bathrooms rule, no stage-ready prep (hair/makeup/costume changes) in lobbies or bathrooms, dance bags/costumes/equipment confined to dressing room/backstage areas, no firearms.
- **Visual treatment:** styled to match the email's design system (fonts, colors, spacing) but visually set apart — e.g. a bordered/boxed callout — so it reads clearly as venue-issued policy, not WCTE narrative copy.
- **Do not condense, summarize, or soften any individual rule.** This is venue-authored safety/compliance content, not WCTE marketing copy — paraphrasing risk is a liability concern, not just a copy-editing preference.

### `buildMysticEmail(studioName, event)`

Nationals welcome email for the Mystic, CT Championship at The Mystic Marriott Hotel & Spa (July 13–17, 2026). Built from `Pre_Event_Director_Information_Mystic_.docx`. Key content distinct from Virginia Beach:

- No cast-entrance instruction equivalent
- Entry revision deadline: Monday, July 6, 2026, 12:00 PM
- Dedicated **Props section** (unique to Mystic): props cannot be stored backstage during competition, must be brought in/removed immediately around the routine, trailer parking available behind stage
- Dressing rooms assigned by dancer count; additional dressing areas open after AM Master Classes/Opening Number rehearsals
- Elite Event / Title Presentation / Opening Number: Friday, July 17, 2026, 3:00 PM
- Semi-**casual** attire recommended for Title Awards Presentation
- Wristband purchase explicitly at dancer check-in; no wristband = no dance room access
- Opening Number explicitly framed as "Pre-Registered Dance Company" — registration closed
- Theme Days: Mon Tropical Vibes → Tue **Jungle Beat** → Wed Studio Spirit Takeover → Thu Magic Awaits → Fri Red Carpet Elite Event
- **No venue rules section** — Mystic has no equivalent facility-policy document

### Shared Content Across All Nationals Templates (VA Beach + Mystic)

Both Nationals emails share these sections with identical or near-identical language (verify against each source doc rather than assuming parity):
National Championship EXPERIENCE list, VIP Access, Music Submission (MP3 via Studio Account, USB backup recommended), Backstage Etiquette check-in (Routine Name / On-Stage-or-Off-Stage / Prop Information), Parent Showcase (register by Fri June 26, 2026; 1–1.5 min routines), National Title Showcase two-component structure, National Photogenic Division ($65/photo entry), Complimentary Master Classes ($20 Observer Wristband), AMBITION Apprentices, The Elite Event eligibility structure (Small/Large Groups, Line & Production Divisions), Studio of the Year, National Championship Souvenirs, Password-Protected Livestream (`wctemagic!`), WCTE Goes Green, Photography & Videography.

**Status:** All three templates (Regional, Virginia Beach, Mystic) are built and live-tested.

### Nationals Download Buttons (hosted PDFs)

Both Nationals templates deliver PDFs as styled **"⇩ Download …" buttons** linking to files hosted on GitHub Pages (`https://hub.wctedance.com/docs/`, repo `jevandavid/wcte-platform`, folder `docs/`). No EmailJS attachments are used for these.

| Template | Button | File |
|----------|--------|------|
| Virginia Beach | Download Event Overview (in the "Please review the National Championship Event Overview and share it with your dancers and families." paragraph) | `event-overview-va.pdf` |
| Mystic | Download Event Overview (same wording) | `event-overview-ct.pdf` |
| Virginia Beach only | Sandler parking & prop-loading guidelines (button placed after the venue rules section) | `sandler-parking-loading-2026.pdf` |

Closing wording is identical in both: "If you have any questions, please contact our office at info@wctedance.com. Thank you for joining the EXPERIENCE. We cannot wait to celebrate with you in [Virginia Beach / Mystic] and continue to inspire the next generation of dancers." If a PDF changes, replace the file in `docs/` (same filename); no code change is needed.

---

## Brand / Design Tokens

| Token | Value |
|-------|-------|
| `--purple-800` | `#1a0f4a` — page background |
| `--purple-900` | `#13111f` — darkest sections |
| `--purple-950` | `#0e0a22` — topbar, footer |
| `--pink` | `#e91e8c` — accent, CTAs, section labels |
| `--pink-light` | `#ff4db8` |
| `--violet-bright` | `#8b5cf6` |
| `--white` | `#ffffff` |

Fonts: `Montserrat` (headings, labels, badges), `Open Sans` (body). Both loaded from Google Fonts. Email template uses Arial fallbacks only (email client safe).

---

## Key Constraints & Rules

1. **Single-file only.** All CSS, JS, and HTML in one `.html` file. No imports, no bundler.
2. **No base64 in email body.** Logo in email must use external URL. Only the UI topbar uses base64.
3. **Triple curly braces in EmailJS template.** `{{{html_body}}}` required — double braces will HTML-escape the email.
4. **Content integrity.** Policy language (photography ban, livestream disclaimer, video recording prohibition) must not be paraphrased or shortened. It is legally/operationally intentional.
5. **No tagline in topbar.** The WCTE logo in the topbar shows logo only — no subtitle or tagline beneath it.
6. **Credentials are constants, not config.** `EJS_SERVICE_ID`, `EJS_TEMPLATE_ID`, `EJS_PUBLIC_KEY` are JS constants at the top of the script block. They do not belong in form fields or localStorage. They do not change between Regional and Nationals.
7. **`mix-blend-mode: screen` on topbar logo.** Required for the white-bevel PNG to render correctly on the dark purple background.
8. **Template switcher is content-only.** The Regional/Virginia Beach/Mystic dropdown on the Preview tab controls which `build*Email()` function fires. It does not change any EmailJS credentials. Do not introduce credential-switching logic.
9. **`generateEmailHTML()` renamed.** In Module 3 the single email function was `generateEmailHTML()`. In the multi-template build it becomes `buildRegionalEmail()`, `buildVirginiaBeachEmail()`, and `buildMysticEmail()`. All call sites must be updated — no references to the old function name should remain.
10. **Sandler Center venue rules are verbatim-only and Virginia-Beach-exclusive.** Do not paraphrase, condense, or move any rule from `Dance_Competition_Rules_-_Studios_2026.pdf`. Do not add an equivalent section to the Mystic template — no source document exists for it there.
11. **Nationals content fidelity is non-negotiable.** Per Jevan: "a LOT of work has gone into these two welcome emails, they should convey the exact messages and information without any drift." Treat `Pre_Event_Director_Virginia_Beach.docx` and `Pre_Event_Director_Information_Mystic_.docx` with the same fidelity bar as `WCTE_Competition_Information_Welcome.docx` — see Email Content Fidelity rule above.
12. **Virginia Beach is near the 50KB EmailJS payload ceiling.** Minified, the Virginia Beach email runs ~49.2KB (49,174 bytes after the overview and parking buttons were added) — about 98% of the 50KB limit (Mystic is ~43KB, Regional ~26KB). This is the email with the added Sandler Center venue policy section. Any future additions to the Virginia Beach template (more theme-day detail, additional venue rules, etc.) risk pushing it over the limit. Test an actual send before relying on this template at volume, and if it needs to grow, trim card/notice padding or move secondary content (e.g. full Sandler rules) to a linked page rather than adding more inline HTML.

---

## Module 3 Relationship

Module 3 (`wcte_module3_FINAL.html`) extends Module 2 by adding **localStorage send-log persistence** and a **session history panel**. It is built on top of the Module 2 FINAL file. All Module 2 architecture applies to Module 3.

**Fixed (Oct 2026):** the send log's Event column was always "—" because the send and resend code passed `event.eventName`, but `getEventData()` returns the field as `event.name`. All four `logEntry(...)` calls now use `event.name`. Log entries created before the fix still show "—".

---

## AMBITION One-Day Dance Workshop Emailer (separate app)

AMBITION is a standalone one-day convention, **emailed to studio directors only** (not attendees). It is a **separate file**, forked from the Module 3 engine, because it needs its own EmailJS template (attachments are configured per template, which breaks the single-template-ID rule used for Regional/Nationals).

| File | Role |
|------|------|
| `wcte_ambition_emailer.html` | The sender. Run locally (double-click); **do not host publicly** (a public sender would let anyone send from info@wctedance.com via EmailJS). |
| `ambition/index.html` | Live interactive schedule page: `https://hub.wctedance.com/ambition/` |
| `ambition/schedule.json` | **Single source of truth** for the live page, the email's "Day at a Glance" table, and the downloadable calendar (.ics). Edit this to change the schedule. |
| `ambition/ambition-logo.png`, `ambition-logo-email.png` | Page logo (transparent) and 560px email logo (flattened on white) |
| `ambition/ambition-westborough-2026-schedule.pdf` | The print-at-home PDF (supplied by Jevan; static, not generated). |

All five files live in `ambition/` in the `wcte-platform` repo.

- **Event:** Sunday, Nov 1, 2026, DoubleTree by Hilton Westborough, 5400 Computer Drive, Westborough, MA 01581. Timezone America/New_York (DST ends that day at 2 AM, so event day is EST).
- **EmailJS:** same Service ID and Public Key as the rest; **own Template ID `template_ffuw20g`** ("AMBITION Schedule"). Template fields: To `{{to_email}}`, Subject `{{subject}}`, body `{{{html_body}}}`.
- **PDF attachment:** the template has a *Variable Attachment* with **Variable Key `schedule_pdf`** (must match exactly; EmailJS auto-generates a different key that has to be overwritten) and filename `AMBITION-Westborough-Schedule.pdf`. The app sends `schedule_pdf` = the hosted PDF URL. Fallback if a URL is not accepted: Static Attachment (upload the PDF in the template).
- **Payload:** `{to_email, subject, html_body, schedule_pdf}`. Minified email is ~11KB (far under 50KB).
- **Schedule loading:** the app fetches the live `schedule.json` at preview and send time and falls back to a built-in copy if unreachable (badge on the Preview tab shows which). Malformed live JSON is rejected.
- **Differences from Module 3:** no template dropdown; CSV import dedupes by email; send is blocked while the template ID is the `template_REPLACE_ME` placeholder; send log uses its own localStorage key (`ambition_send_log_v1`) and exports `ambition_send_log.csv`, so it never mixes with WCTE logs.
- **Cover letter is data, not code:** the welcome text, registration section, friendly reminders and closing line (from Shawna's cover letter) live in the `letter` block of `schedule.json` (plus `event.room`); `buildAmbitionEmail()` just renders them. `**bold**` markup is supported. A live `schedule.json` without a `letter` block is rejected and the built-in copy is used.
- **Reusing for another one-day event (e.g. Virginia Beach):** same EmailJS template (`template_ffuw20g`) and same app. Make a new hub folder (e.g. `/virginia-beach-day/`) with its own `index.html`, `schedule.json` (new event info, schedule, footnotes and `letter`), logos and PDF; then in the emailer change the constants `AMBITION_BASE_URL`, `SCHEDULE_PDF_URL`, `LOGO_URL`, the Event Setup field defaults, and the built-in `SCHEDULE_FALLBACK` copy so a failed live fetch can never send the wrong event. Brand color (red) and the AMBITION logo are still AMBITION-specific.
- **Content rules:** the two schedule footnotes and all session titles are reproduced verbatim from the PDF. The cover letter text is Shawna's, verbatim except her "Adult supervision" reminder, which was left out because the schedule's under-16 footnote already covers it (the two wordings differ; confirm which is correct).
- **Live page preview:** add `?now=2026-11-01T10:30` to the page URL to see it as if at that time.
- **After a send:** edits to `schedule.json` update the live page automatically, but the attached PDF does not change; a changed schedule needs a follow-up email.

---

## Related Files in This Project

| File | Notes |
|------|-------|
| `wcte_module3_FINAL.html` | Current live module (Module 2 + persistence) — three templates; base for the AMBITION fork |
| `wcte_ambition_emailer.html` | AMBITION director emailer (see AMBITION section) |
| `wcte_module2_email_preview_FINAL.html` | Standalone preview file, same template |
| `WCTE_Dev_Context_Brief_v3.docx` | Full platform context brief |
| `WCTE_Competition_Information_Welcome.docx` | Source document for Regional welcome email content |
| `Pre_Event_Director_Virginia_Beach.docx` | Source document for Virginia Beach Nationals welcome email content |
| `Pre_Event_Director_Information_Mystic_.docx` | Source document for Mystic, CT Nationals welcome email content |
| `Dance_Competition_Rules_-_Studios_2026.pdf` | Sandler Center venue house rules (Virginia Beach only) — venue-authored, reproduce verbatim |
| `WCTE_whitebevel.png` | Logo asset (PNG, used in topbar as base64) |
| `docs/*.pdf` (hub repo) | `event-overview-va.pdf`, `event-overview-ct.pdf`, `sandler-parking-loading-2026.pdf` — linked from Nationals emails |

---

## Contact / Org Info (Used in Email Footer)

```
World-Class Talent Experience, Inc.
110 East Broward Blvd., #1700
Fort Lauderdale, FL 33301
Phone: 954.744.1556
Email: info@wctedance.com
Web:   wctedance.com
```

Sending address: `info@wctedance.com` (configured in EmailJS service)

---

*Last updated: October 26, 2026 (AMBITION cover letter folded into the email and moved into schedule.json; Excel/CSV file import added to both emailers). Earlier: October 25, 2026 — AMBITION emailer and live schedule page added and live-tested; Nationals Event Overview and Sandler parking download buttons documented; Virginia Beach payload now ~49.2KB (~98% of limit); Module 3 send-log Event column bug fixed. Next: real AMBITION send to studio directors (Nov 1 event), then archive and reuse the AMBITION pattern for future one-day events.*
