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
| **Current Phase** | Post-Nationals — Ambition Workshop certificate redemptions (Fall 2026) |

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
| Form hosting | GitHub Pages via custom domain — `https://hub.wctedance.com/` |

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
| Award Thank-You | `template_8739osi` | `to_email`, `dancer_name`, `studio_name`, `award_type`, `attending_event`, `event_city`, `award_date`, `dancer_age`, `contact_phone` |

**Note:** `commitment_text` variable removed from Award Thank-You template in September 2026 revision. Email no longer includes "Your Commitment" or "What Happens Next" sections.

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
| 4 | **Award Registration Form** | **Ambition Scholarship only** (Sep 2026). Single award type, pre-selected. Attends Ambition Workshops only. Photo upload, Google Apps Script → Sheet + Drive. Simplified thank-you (no commitment section). Live on hub.wctedance.com. | ✅ LIVE |
| 5 | **Airtable Integration** | Replace CSV paste with live Airtable contact pull via API. | PLANNED |
| 6 | **Feedback Form Automation** | Post-event Tally survey trigger, auto-send 24–48h after event end. | PLANNED |
| 7 | **Studio Owner Portal (Softr)** | Schedule view, waiver tracker, entry summary dashboard. | PLANNED |

---

## 7. File Inventory

### 7.1 Project Files — read-only source assets

| File | Description |
|---|---|
| `wcte_module3_FINAL.html` | Sender app Modules 1–3 (all tabs incl. Send Log). Base file to extend for future modules. |
| `wcte_module2_FINAL.html` | Locked. Module 2 reference (no Send Log tab). |
| `wcte_module2_email_preview_FINAL.html` | Locked. Standalone welcome email preview tool. |
| `WCTE_whitebevel.png` | Logo asset — embed as base64 in any new HTML app file. |
| `WCTE_Competition_Information_Welcome.docx` | Source content for welcome email body. |

### 7.2 Delivered Output Files (local: `/Users/jevandavid/Claude/2026 Cert Redemption/`)

| File | Description |
|---|---|
| `forms/wcte_award_form.html` | Module 4 award registration form. Ambition Scholarship only. Live on hub.wctedance.com. |
| `scripts/wcte_award_form_apps_script.js` | Google Apps Script web app. Handles POST from form: writes to Sheet, saves photos to Drive. |
| `email-templates/wcte_emailjs_award_thankyou_template.html` | HTML for EmailJS template editor. Template ID: `template_8739osi`. Simplified version (no commitment/next-steps sections). |
| `docs/WCTE_Dev_Context_Brief_v7.md` | This file. |

### 7.3 GitHub Repository — LIVE

| | |
|---|---|
| **Repo** | `https://github.com/jevandavid/wcte-platform` |
| **Custom Domain** | `https://hub.wctedance.com/` |
| **Live Form URL** | `https://hub.wctedance.com/forms/wcte_award_form.html` |
| **Branch** | `main` — deploy from root |

```
wcte-platform/
  forms/
    wcte_award_form.html
  email-templates/
    wcte_emailjs_award_thankyou_template.html   ← template_8739osi
  scripts/
    wcte_award_form_apps_script.js
  docs/
    WCTE_Dev_Context_Brief_v7.md
  CNAME                                          ← hub.wctedance.com
```

---

## 8. Module 4 — Award Registration Form Detail (September 2026 Revision)

### 8.1 Current Configuration: Ambition Scholarship Only

The form was revised in September 2026 to accept **only Ambition Scholarship** redemptions. Company Member and Apprentice options were removed (Nationals has passed). The form now targets **Ambition Workshops** (Fall 2026).

### 8.2 Form Fields

| Field | Input Type | Notes |
|---|---|---|
| Award Type | Pre-selected checkbox: Ambition Scholarship | Single option, pre-checked. |
| Attending Event | Dropdown — Ambition Workshops only | Worcester MA (Nov 1) or Virginia Beach VA (Nov 8). |
| Event City | Dropdown — 19 tour stops from wctedance.com | Required. Where certificate was awarded. |
| Award Date | Date picker (2026 only) | Required. |
| Studio Name | Text | Required. |
| Dancer Name | Text | Required. Full name. |
| Dancer Age (Jan 1, 2026) | Number (4–25) | Required. |
| Contact Phone | Tel | Required. Dancer or legal guardian. |
| Contact Email | Email | Required. Also the EmailJS recipient. |
| Certificate Photo | Single file upload (JPEG/PNG/HEIC/PDF, max 10MB) | Required. One photo for Ambition Scholarship. |
| Consent: WCTE Contact | Checkbox | Required. Authorizes contact for Ambition Workshop planning. |
| Consent: Commitment | Checkbox | Required. Simplified text for Ambition Scholarship. |

### 8.3 What Was Removed (September 2026)

| Component | Removed From | Reason |
|---|---|---|
| Company Member option | Form | Nationals passed |
| Apprentice option | Form | Nationals passed |
| Nationals event options | Attending Event dropdown | Nationals passed |
| "Your Commitment" section | Form thank-you screen | WCTE not sending personalized communications |
| "Your Commitment" section | Email template | WCTE not sending personalized communications |
| "What Happens Next" section | Email template | No follow-up schedules being sent |
| "View Nationals Info" button | Email template | Nationals passed |
| `commitment_text` variable | EmailJS template | Section removed |

### 8.4 Data Flow

| Step | Action | Detail |
|---|---|---|
| 1 | Dancer submits form | All fields validated client-side. Single photo required. |
| 2 | POST to Apps Script | JSON payload (all fields + `files` array) sent via `fetch()`. |
| 3 | Apps Script: save photo | Saves to Drive subfolder: `Event City / Dancer Name / unique filename`. |
| 4 | Apps Script: write row | Writes to Sheet tab "Award Registrations". |
| 5 | Apps Script returns | JSON `{ success: true }` returned. |
| 6 | EmailJS fires | Form calls `emailjs.send()` with variables. Template `template_8739osi`. |
| 7 | Thank-you screen | Simple confirmation (no commitment section). |

### 8.5 Configuration Constants — ALL SET

| Constant | Value |
|---|---|
| `EMAILJS_SERVICE_ID` | `service_dw0woxo` |
| `EMAILJS_TEMPLATE_ID` | `template_8739osi` |
| `EMAILJS_PUBLIC_KEY` | `gLlv1ombHvG9bjmcV` |
| `APPS_SCRIPT_URL` | `https://script.google.com/macros/s/AKfycby14USrv7UuwAGCP0H-Uuxi-6G2wWCsQyZE4zFU9N6Ll1LK3IV7S4HWE4foKYE1Nr7s/exec` |

### 8.6 Apps Script Constants — ALL SET

| Constant | Value |
|---|---|
| `SHEET_ID` | `1ONm5aRY27asBa_cRMUJpVQwguOMictICCsINPk15Eto` |
| `DRIVE_FOLDER_ID` | `1xnG-DKnm9t8nkTeQYEw4fPEFrfjc6SG1` |
| `SHEET_TAB_NAME` | `Award Registrations` |

---

## 9. Google Sheet & Drive Structure

### 9.1 Sheet: "WCTE Award Registrations 2026"

- **Sheet ID:** `1ONm5aRY27asBa_cRMUJpVQwguOMictICCsINPk15Eto`
- **Tab:** `Award Registrations` — auto-created with styled headers on first submission

Columns (in order): `Submission ID` · `Submitted At` · `Award Type` · `Attending Event` · `Event City` · `Award Date` · `Studio Name` · `Dancer Name` · `Dancer Age (Jan 1 2026)` · `Contact Phone` · `Contact Email` · `Certificate Photo (Drive Link)` · `Photo File Name` · `Status`

- Submission ID auto-generated: `WCTE-2026-NNNN`
- Submitted At in Eastern Time
- Status defaults to `"Received"`

### 9.2 Drive Folder Structure

- **Root Folder:** `WCTE Award Photos 2026` (ID: `1xnG-DKnm9t8nkTeQYEw4fPEFrfjc6SG1`)
- Located inside: `2026 WCTE Season / Award Certificate Redemption /`

```
WCTE Award Photos 2026/  ← DRIVE_FOLDER_ID
  ├── Roanoke, VA/
  │     ├── Jane Smith/
  │     └── John Doe/
  ├── Tampa, FL/
  │     └── Alex Rivera/
  └── (one folder per event city, one subfolder per dancer)
```

**File naming:** `DancerName_StudioName_AwardDate_timestamp.ext`

---

## 10. Key Learnings & Principles

| Topic | Detail |
|---|---|
| **EmailJS 50KB limit** | Base64 logos push over the limit. Solution: full HTML in EmailJS template, app/form sends only small string variables. Established Module 2, carried forward to all templates. |
| **Logo in emails** | Use external URL in email templates (never base64). Use base64 + `mix-blend-mode:screen` only in app UI topbar. |
| **Drive folder hierarchy** | Organized as `Event City / Dancer Name /`. City label strips date suffix via `.split('(')[0].trim()`. |
| **Apps Script CORS** | `fetch()` POST to Apps Script URL returns a CORS error on the response — but the request IS received and processed. Fix: wrap fetch in `try/catch` and ignore `corsErr`. Do NOT use `mode: 'no-cors'` — it strips the request body. |
| **Apps Script access** | Must deploy with **Who has access: Anyone** — "Only myself" returns 401 Unauthorized to external callers. |
| **Apps Script version deployment** | After editing code, must deploy as **New version** — redeploying on same version does not pick up changes. |
| **GitHub Pages custom domain** | CNAME file in repo root points to `hub.wctedance.com`. DNS configured at domain registrar. |
| **Platform independence** | No FileMaker/mydanceregister.com access required. All data lands in WCTE-owned Google infrastructure. |
| **Form simplification** | When event-specific content becomes outdated (e.g., Nationals passed), remove those sections entirely rather than leaving stale references. |

---

## 11. Deployment Checklist — Module 4 Status

### Original Deployment (Spring 2026)
- [x] Create Google Sheet (`WCTE Award Registrations 2026`)
- [x] Create Drive folder (`WCTE Award Photos 2026`)
- [x] Deploy Apps Script as Web App
- [x] Create EmailJS award thank-you template — ID: `template_8739osi`
- [x] Create GitHub repo (`jevandavid/wcte-platform`)
- [x] Enable GitHub Pages with custom domain `hub.wctedance.com`
- [x] End-to-end test passed

### September 2026 Revision — Ambition Only
- [x] Remove Company Member and Apprentice options from form
- [x] Update hero/title to "Ambition Scholarship Certificate Redemption"
- [x] Limit Attending Event dropdown to Ambition Workshops only
- [x] Remove "Your Commitment" section from form thank-you screen
- [x] Remove "Your Commitment" section from email template
- [x] Remove "What Happens Next" section from email template
- [x] Remove "View Nationals Info" button from email template
- [x] Remove all references to personalized communications/schedules
- [x] Push updated form to GitHub Pages
- [ ] **PENDING:** Paste updated HTML into EmailJS template `template_8739osi`

---

## 12. Remaining Next Steps

- [ ] **Paste updated email template** into EmailJS (`template_8739osi`) — file: `email-templates/wcte_emailjs_award_thankyou_template.html`
- [ ] **Module 5** — Airtable integration (replace CSV paste in sender app)
- [ ] **Module 6** — Post-event feedback automation (Tally + trigger)
- [ ] **Module 7** — Studio owner portal (Softr)

---

*World-Class Talent Experience® · info@wctedance.com · 954.744.1556 · wctedance.com*
