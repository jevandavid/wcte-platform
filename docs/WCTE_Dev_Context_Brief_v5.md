# WCTE — World-Class Talent Experience
## Developer Context Brief — Modular Email & Form Platform

> Paste this brief at the start of every new conversation to maintain full build continuity.

---

## 1. Organization Overview

| | |
|---|---|
| **Organization** | World-Class Talent Experience (WCTE) — a dance competition organization |
| **Website** | wctedance.com |
| **Contact** | info@wctedance.com · 954.744.1556 |
| **Address** | 110 East Broward Blvd., #1700, Fort Lauderdale, FL 33301 |
| **Season** | Feb – late May (tour events) + Nationals in Virginia Beach, VA (Jul 6–9, 2026) |
| **Tour Theme** | Season 14 — "Find Your Magic" |

---

## 2. Project Goal

Build a modular, automated email and communication platform to keep competition attendees informed, automate follow-ups, and collect structured data from dancers. WCTE owns this platform entirely — independent of any third-party competition management system. This is a strategic asset.

---

## 3. Technical Stack & Infrastructure

### 3.1 Competition Management (Read-Only)

WCTE's competition system runs on FileMaker Pro via Claris WebDirect, hosted by mydanceregister.com (TourPro26WCTE). WCTE has reporting access only — no API, no DB access. This is intentional: everything built is fully WCTE-owned.

### 3.2 Approved Independent Stack

| Layer | Tool |
|---|---|
| Data feed | FileMaker CSV exports → shared Google Drive folder |
| Contact database | Airtable (planned) |
| Automation | Make or n8n (planned) |
| Transactional email | Postmark (planned) |
| Broadcast email | Mailchimp (planned) |
| SMS | SimpleTexting (planned) |
| Studio owner portal | Softr (planned) |
| Feedback surveys | Tally (planned) |
| Email sending (current) | EmailJS — service_dw0woxo — sends from info@wctedance.com |
| Form backend | Google Apps Script Web App — writes to Google Sheet + Drive |
| Form hosting | GitHub Pages (iframe embed into wctedance.com) |

---

## 4. EmailJS Architecture — Critical

- EmailJS credentials are hardcoded across all modules: **Service ID** `service_dw0woxo` · **Public Key** `gLlv1ombHvG9bjmcV`
- The **50KB variable limit** means base64-embedded logos **cannot** be passed as variables.
- **Solution (established Module 2):** full HTML lives in the EmailJS template; the app/form passes only small string variables via `{{mustache}}` placeholders.
- Logo in email templates uses an **external URL reference** (not base64).
- Base64 logo is only used in the **app UI topbar** (browser rendering, never sent as a variable).

| Template | ID | Variables |
|---|---|---|
| Welcome Email | `template_rv6agoo` | `to_email`, `studio_name`, `event_name`, `start_date`, `end_date`, `venue_name`, `venue_address` |
| Award Thank-You | `REPLACE_WITH_NEW_TEMPLATE_ID` | `to_email`, `dancer_name`, `studio_name`, `award_type`, `event_city`, `award_date`, `commitment_text` |

---

## 5. Brand & Design System

### Colors

| Token | Value |
|---|---|
| Background | Deep purple `#1a0f4a` → `#0e0a22` |
| Header bands | `#2d1b6b` / `#22145c` |
| CTA / Accent | Hot magenta `#e91e8c` |
| Violet mid | `#7c4fd4` / `#4a2da0` |
| Purple light | `#a87ee8` / `#c9a8f5` |
| Footer | Near-black `#0e0a22` / `#13111f` |

### Typography & Logo

| | |
|---|---|
| App UI fonts | Montserrat 700–800 headings / Open Sans body (Google Fonts) |
| Email fonts | Arial Black headings / Arial body (email-safe) |
| Logo: app UI | `WCTE_whitebevel.png` — embedded as base64, `mix-blend-mode:screen` on dark backgrounds |
| Logo: email templates | External URL reference — never base64 in email payloads |
| Tagline | Not shown (removed per Module 2 spec) |

---

## 6. Module Build Status

| # | Module | Description | Status |
|---|---|---|---|
| 1 | **Welcome Email Sender Tool** | Single-page HTML/JS app. Event setup, CSV studio import, live preview, send with rate limiting and status log. EmailJS pre-configured. | ✅ COMPLETE |
| 2 | **Email Template — Full Design Pass** | WCTE-branded HTML email. Full color/typography redesign. External logo URL. Mobile-safe inline CSS. All 12 source sections verified. | ✅ COMPLETE |
| 3 | **Send Log Persistence** | localStorage-persisted send log (key: `wcte_send_log_v1`). Session groups, filter chips, live search, per-row Resend, CSV export, confirm-gated clear, tab badge. | ✅ COMPLETE |
| 4 | **Award Registration Form** | Company / Apprentice / Ambition Scholarship self-registration. Google Apps Script → Google Sheet + Drive. EmailJS award thank-you. GitHub Pages / iframe. | ✅ COMPLETE |
| 5 | **Airtable Integration** | Replace CSV paste with live Airtable contact pull via API. | PLANNED |
| 6 | **Feedback Form Automation** | Post-event Tally survey trigger, auto-send 24–48h after event end. | PLANNED |
| 7 | **Studio Owner Portal (Softr)** | Schedule view, waiver tracker, entry summary dashboard. | PLANNED |

---

## 7. File Inventory

### 7.1 Project Files (`/mnt/project/`) — read-only source assets

| File | Description |
|---|---|
| `wcte_module3_FINAL.html` | Sender app Modules 1–3 (all tabs incl. Send Log). Base file to extend for future modules. |
| `wcte_module2_FINAL.html` | Locked. Module 2 reference (no Send Log tab). |
| `wcte_module2_email_preview_FINAL.html` | Locked. Standalone welcome email preview tool. |
| `WCTE_whitebevel.png` | Logo asset — embed as base64 in any new HTML app file. |
| `WCTE_Competition_Information_Welcome.docx` | Source content for welcome email body. |

### 7.2 Delivered Output Files

| File | Description |
|---|---|
| `wcte_award_form.html` | Module 4 award registration form. Embed in GitHub Pages. Calls Apps Script + EmailJS. |
| `wcte_award_form_apps_script.js` | Google Apps Script web app. Handles POST from form: writes to Sheet, saves photo to Drive. |
| `wcte_emailjs_award_thankyou_template.html` | HTML to paste into EmailJS template editor for award thank-you email. No base64. 6 mustache vars. |
| `WCTE_Dev_Context_Brief_v5.md` | This file. |

---

## 8. Module 4 — Award Registration Form Detail

### 8.1 Form Fields

| Field | Input Type | Notes |
|---|---|---|
| Award Type | Radio: Company Member / Apprentice / Ambition Scholarship | Required. Drives commitment copy and consent text dynamically. |
| Event City | Dropdown — 19 tour stops from wctedance.com | Required. Includes dates in label. |
| Award Date | Date picker (2026 only) | Required. |
| Studio Name | Text | Required. |
| Dancer Name | Text | Required. Full name. |
| Dancer Age (Jan 1, 2026) | Number (4–25) | Required. |
| Contact Phone | Tel | Required. Dancer or legal guardian. |
| Contact Email | Email | Required. Also the EmailJS recipient. |
| Certificate Photo | File upload (JPEG/PNG/HEIC/PDF, max 10MB) | Required. Base64 read in browser, POSTed to Apps Script, saved to Drive. |
| Consent: WCTE Contact | Checkbox | Required. Authorizes contact for pre-event planning. |
| Consent: Commitment | Checkbox | Required. Text is dynamic — changes per award type. |

### 8.2 Commitment Copy (by Award Type)

| Award Type | Thank-You / Commitment Text |
|---|---|
| **Company Member** | As a WCTE Company Member, you have agreed and committed to attending all Closed Elite Day Opening Routine rehearsals at WCTE Nationals 2026. A full rehearsal schedule is forthcoming — please plan for daily sessions. |
| **Apprentice** | As a WCTE Apprentice, you have agreed to be available for all Master Instructor classes and to assist the Master Instructors at WCTE Nationals 2026. A complete schedule of sessions will follow. |
| **Ambition Scholarship** | As an Ambition Scholarship recipient, you will receive personalized communication from WCTE with full details about your schedule and commitments for Nationals 2026. |

### 8.3 Data Flow

| Step | Action | Detail |
|---|---|---|
| 1 | Dancer submits form | All fields validated client-side; photo read to base64 via FileReader API. |
| 2 | POST to Apps Script | JSON payload (all fields + base64 photo) sent via `fetch()` to Apps Script Web App URL. |
| 3 | Apps Script: save photo | Decodes base64, saves to Drive subfolder: `Award Type / Event City / unique filename`. |
| 4 | Apps Script: write row | Writes all fields + Drive link to Sheet tab "Award Registrations". Color-coded by award type. |
| 5 | Apps Script returns | JSON `{ success: true }` returned to form. |
| 6 | EmailJS fires | Form calls `emailjs.send()` with 6 string variables. New template (separate from `template_rv6agoo`). |
| 7 | Thank-you screen | Form hides; personalized thank-you screen with commitment text shown. |

### 8.4 Configuration Constants (in `wcte_award_form.html`)

| Constant | Value |
|---|---|
| `EMAILJS_SERVICE_ID` | `service_dw0woxo` |
| `EMAILJS_TEMPLATE_ID` | `REPLACE_WITH_NEW_TEMPLATE_ID` — create new template in EmailJS, paste HTML from `wcte_emailjs_award_thankyou_template.html` |
| `EMAILJS_PUBLIC_KEY` | `gLlv1ombHvG9bjmcV` |
| `APPS_SCRIPT_URL` | `REPLACE_WITH_YOUR_APPS_SCRIPT_URL` — from Apps Script deployment |

---

## 9. Google Sheet & Drive Structure

### 9.1 Sheet Tab: "Award Registrations"

Columns (in order): `Submission ID` · `Submitted At` · `Award Type` · `Event City` · `Award Date` · `Studio Name` · `Dancer Name` · `Dancer Age (Jan 1 2026)` · `Contact Phone` · `Contact Email` · `Certificate Photo (Drive Link)` · `Photo File Name` · `Status`

- Submission ID auto-generated: `WCTE-2026-NNNN`
- Submitted At in Eastern Time
- Status defaults to `"Received"`

### 9.2 Drive Folder Structure

```
[Root Drive Folder]  ← ID set in DRIVE_FOLDER_ID constant
  ├── Company Member/
  │     ├── Roanoke, VA/
  │     └── Tampa, FL/
  ├── Apprentice/
  └── Ambition Scholarship/
```

**File naming:** `DancerName_StudioName_AwardDate_timestamp.ext`

**Row colors:** Company Member = soft purple · Apprentice = soft pink · Ambition Scholarship = soft blue

---

## 10. Key Learnings & Principles

| Topic | Detail |
|---|---|
| **EmailJS 50KB limit** | Base64 logos push over the limit. Solution: full HTML in EmailJS template, app/form sends only small string variables. Established Module 2, carried forward to all templates. |
| **Logo in emails** | Use external URL in email templates (never base64). Use base64 + `mix-blend-mode:screen` only in app UI topbar. |
| **Photo upload (no server)** | FileReader API converts photo to base64 in browser. POSTed as JSON to Apps Script, which decodes and saves to Drive. No external upload service needed. |
| **Apps Script as backend** | Google Apps Script Web App = free serverless POST endpoint. Writes to Sheet + Drive. Deploy with Execute as: Me, Who has access: Anyone. |
| **Checkbox validation** | Native HTML `required` on checkboxes inside `<label>` wrappers needs JS reinforcement. `showFieldError()` targets the wrapper `label` for visual feedback, not the hidden input. |
| **Form hero copy** | Eyebrow: "Are you planning on attending a WCTE event in 2026?" · Title: "WCTE Nationals & Ambition Fall Dance Workshop" · Subtitle: calls out both event paths with the invitation qualifier. |
| **Platform independence** | No FileMaker/mydanceregister.com access required. All data lands in WCTE-owned Google infrastructure. |
| **Module continuity** | Each module extends the prior `FINAL.html` rather than rebuilding. `wcte_module3_FINAL.html` is the base for Modules 5+. |
| **Source doc typo** | `{{EventLoacationName}}` in source docs — normalized to `{venueName}` internally. |

---

## 11. GitHub Repository Structure (Planned)

```
wcte-platform/
  forms/
    wcte_award_form.html
  email-templates/
    wcte_emailjs_welcome_template.html       ← template_rv6agoo
    wcte_emailjs_award_thankyou_template.html ← new award template
  scripts/
    wcte_award_form_apps_script.js
  docs/
    WCTE_Dev_Context_Brief_v5.md
```

---

## 12. Next Steps to Go Live

- [ ] Create Google Sheet and Drive folder; get their IDs; update Apps Script constants `SHEET_ID` and `DRIVE_FOLDER_ID`
- [ ] Deploy Apps Script as Web App (Execute as: Me, Who has access: Anyone); copy URL into `APPS_SCRIPT_URL` in form
- [ ] Create new EmailJS template: paste `wcte_emailjs_award_thankyou_template.html` into template editor; copy template ID into `EMAILJS_TEMPLATE_ID` in form
- [ ] Create GitHub repo (`wcte-platform`); push all files; enable GitHub Pages
- [ ] Embed form in wctedance.com via `<iframe src="https://[username].github.io/wcte-platform/forms/wcte_award_form.html">`
- [ ] Run end-to-end test: submit form → verify Sheet row + Drive photo + thank-you email receipt

---

*World-Class Talent Experience® · info@wctedance.com · 954.744.1556 · wctedance.com*
