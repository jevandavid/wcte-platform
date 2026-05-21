/**
 * WCTE Award Registration — Google Apps Script Web App
 * =====================================================
 * Handles POST submissions from wcte_award_form.html
 * - Writes all form fields to a Google Sheet
 * - Saves the uploaded certificate photo to Google Drive
 * - Organizes photos into subfolders by award type
 *
 * SETUP INSTRUCTIONS:
 * 1. Open script.google.com and create a new project
 * 2. Paste this entire file into the editor
 * 3. Update SHEET_ID and DRIVE_FOLDER_ID constants below
 * 4. Click Deploy → New Deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL and paste into wcte_award_form.html
 *    (replace APPS_SCRIPT_URL constant)
 * 6. On first run, authorize the required Google permissions
 */

// ═══════════════════════════════════════════════════════
// CONFIGURATION — UPDATE THESE BEFORE DEPLOYING
// ═══════════════════════════════════════════════════════

// The ID of your Google Sheet (from the URL: .../spreadsheets/d/SHEET_ID/edit)
const SHEET_ID = '1ONm5aRY27asBa_cRMUJpVQwguOMictICCsINPk15Eto';

// The ID of your Google Drive folder for certificate photos
// (from the URL: .../drive/folders/FOLDER_ID)
const DRIVE_FOLDER_ID = '1xnG-DKnm9t8nkTeQYEw4fPEFrfjc6SG1';

// Sheet tab name — will be created if it doesn't exist
const SHEET_TAB_NAME = 'Award Registrations';

// Column headers (matches the order data is written)
const HEADERS = [
  'Submission ID',
  'Submitted At',
  'Award Type',
  'Attending Event',
  'Event City',
  'Award Date',
  'Studio Name',
  'Dancer Name',
  'Dancer Age (Jan 1 2026)',
  'Contact Phone',
  'Contact Email',
  'Certificate Photo (Drive Link)',
  'Photo File Name',
  'Status'
];


// ═══════════════════════════════════════════════════════
// MAIN: Handle POST request from the form
// ═══════════════════════════════════════════════════════

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // 1. Save photo to Drive
    const photoLink = savePhotoToDrive(data);

    // 2. Write row to Sheet
    writeToSheet(data, photoLink);

    // 3. Return success
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('WCTE Form Error: ' + err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


// ═══════════════════════════════════════════════════════
// SAVE PHOTO TO DRIVE
// Organizes into subfolders: Award Type / Event City
// ═══════════════════════════════════════════════════════

function savePhotoToDrive(data) {
  const rootFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);

  // Create/get subfolder by award type
  const awardFolder = getOrCreateFolder(rootFolder, sanitizeFolderName(data.awardType || 'Unknown Award'));

  // Create/get subfolder by event city (sanitized)
  const cityLabel = (data.eventCity || 'Unknown City').split('(')[0].trim(); // strip date
  const cityFolder = getOrCreateFolder(awardFolder, sanitizeFolderName(cityLabel));

  // Decode base64 file data
  // Format: data:image/jpeg;base64,XXXXXX
  const fileDataUrl = data.fileData || '';
  const matches = fileDataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) throw new Error('Invalid file data');

  const mimeType = matches[1];
  const base64Data = matches[2];
  const decoded = Utilities.base64Decode(base64Data);
  const blob = Utilities.newBlob(decoded, mimeType, data.fileName || 'certificate');

  // Create unique filename: DancerName_StudioName_Date_timestamp
  const ts = new Date().getTime();
  const safeDancer = sanitizeFolderName(data.dancerName || 'Unknown');
  const safeStudio = sanitizeFolderName(data.studioName || 'Unknown');
  const ext = getExtension(data.fileName || 'file.jpg');
  const fileName = safeDancer + '_' + safeStudio + '_' + (data.awardDate || 'unknown') + '_' + ts + ext;
  blob.setName(fileName);

  const file = cityFolder.createFile(blob);
  return file.getUrl();
}


// ═══════════════════════════════════════════════════════
// WRITE ROW TO GOOGLE SHEET
// Creates the sheet and headers if they don't exist
// ═══════════════════════════════════════════════════════

function writeToSheet(data, photoLink) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_TAB_NAME);

  // Create tab + headers if needed
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_TAB_NAME);
    sheet.appendRow(HEADERS);
    // Style header row
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground('#1a0f4a');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setFontFamily('Arial');
    sheet.setFrozenRows(1);
    // Auto-resize columns
    sheet.autoResizeColumns(1, HEADERS.length);
  }

  // Generate submission ID
  const submissionId = 'WCTE-' + new Date().getFullYear() + '-' + String(sheet.getLastRow()).padStart(4, '0');
  const submittedAt = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });

  const row = [
    submissionId,
    submittedAt,
    data.awardType || '',
    data.attendingEvent || '',
    data.eventCity || '',
    data.awardDate || '',
    data.studioName || '',
    data.dancerName || '',
    data.dancerAge || '',
    data.contactPhone || '',
    data.contactEmail || '',
    photoLink || '',
    data.fileName || '',
    'Received'
  ];

  sheet.appendRow(row);

  // Color-code row by award type
  const lastRow = sheet.getLastRow();
  const rowRange = sheet.getRange(lastRow, 1, 1, HEADERS.length);
  const bgColor = getRowColor(data.awardType || '');
  if (bgColor) rowRange.setBackground(bgColor);
}


// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════

function getOrCreateFolder(parent, name) {
  const existing = parent.getFoldersByName(name);
  if (existing.hasNext()) return existing.next();
  return parent.createFolder(name);
}

function sanitizeFolderName(name) {
  return name.replace(/[\\/:*?"<>|]/g, '').trim().substring(0, 50);
}

function getExtension(filename) {
  const parts = filename.split('.');
  return parts.length > 1 ? '.' + parts[parts.length - 1].toLowerCase() : '.jpg';
}

function getRowColor(awardType) {
  switch (awardType) {
    case 'Company Member':      return '#e8d5f5'; // soft purple
    case 'Apprentice':          return '#fce4f0'; // soft pink
    case 'Ambition Scholarship': return '#dde8ff'; // soft blue
    default:                    return null;
  }
}


// ═══════════════════════════════════════════════════════
// OPTIONAL: Handle GET (health check / test)
// ═══════════════════════════════════════════════════════

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'WCTE Award Form API is live', timestamp: new Date().toISOString() }))
    .setMimeType(ContentService.MimeType.JSON);
}
