const SPREADSHEET_ID = "1qJZQIpmhnWsTNRzKKJkHq0sTDlAxtumq-bfviREMCdE";
const HEADERS = ["Company Name", "Student Number", "Resume Collected", "Feedback", "Lunch Collected", "Sponsor Tier", "Assigned PIC", "Latest Interaction", "Latest Check-in PIC"];
const LOG_HEADERS = ["Timestamp", "Day", "Company Name", "PIC"];
const PIC_NAMES = ["Suchir", "Daphne", "Jet Shen", "Thenmolly", "Tiraa", "Pui Yeng", "Jin Hong", "Joash", "Brandon"];
const SPONSORS = [
  ["Nestle Manufacturing Malaysia","BRONZE","Daphne"],["bp","GOLD","Daphne"],["Inchz IoT Sdn Bhd","GOLD","Daphne"],["AMD","GOLD","Daphne"],["Gamuda Berhad","SILVER","Daphne"],["Shortcut Asia","SILVER","Daphne"],["Nokia Services and Networks Malaysia Sdn Bhd","SILVER","Daphne"],
  ["Inno Lab Engineering Sdn Bhd","BRONZE","Jet Shen"],["Micron Malaysia","BRONZE","Jet Shen"],["Rooftop Energy Tech Sdn Bhd","GOLD","Jet Shen"],["WD","GOLD","Jet Shen"],["Ant International (AI Asia Services Sdn. Bhd.)","SILVER","Jet Shen"],["Mi Equipment","SILVER","Jet Shen"],["Alliance Precast Industries Sdn Bhd","SILVER","Jet Shen"],
  ["Netizen Testing Sdn Bhd","BRONZE","Pui Yeng"],["PwC in Malaysia","BRONZE","Pui Yeng"],["Deriv","BRONZE","Pui Yeng"],["Aonic","BRONZE","Pui Yeng"],["HSS Engineers Berhad","BRONZE","Pui Yeng"],["Shopee","GOLD","Pui Yeng"],["Configura Pacific Sdn Bhd","SILVER","Pui Yeng"],["ExxonMobil Business Support Centre Malaysia Sdn Bhd","SILVER","Pui Yeng"],
  ["Core Consulting","BRONZE","Suchir"],["RIFHAN Teknologi Sdn Bhd (Tech D)","BRONZE","Suchir"],["AT&S Austria Technologie & Systemtechnik","GOLD","Suchir"],["Tawk Sdn Bhd","OFFICIAL","Suchir"],["Juris Technologies Sdn Bhd","SILVER","Suchir"],["Solarvest Holdings Berhad (Atlantic Blue Sdn Bhd)","SILVER","Suchir"],["Food Panda","SILVER","Suchir"],
  ["KTA Tenaga Sdn Bhd","BRONZE","Thenmolly"],["JJ-Lurgi Engineering Sdn Bhd","BRONZE","Thenmolly"],["Advanced Semiconductor Academy of Malaysia (ASEM)","BRONZE","Thenmolly"],["Deloitte","GOLD","Thenmolly"],["Reactive Energy","SILVER","Thenmolly"],["JKS Engineering (M) Sdn Bhd","TWO DAY BRONZE","Thenmolly"],["SPX Express (Malaysia)","TWO DAY BRONZE","Thenmolly"],
  ["Averis","BRONZE","Tiraa"],["Bio to Business Sdn Bhd","BRONZE","Tiraa"],["IGB Berhad","BRONZE","Tiraa"],["Baltimore Aircoil Malaysia Sdn Bhd","BRONZE","Tiraa"],["Chuan Sin Sdn Bhd (Spritzer)","GOLD","Tiraa"],["Maistorage","SILVER","Tiraa"],["GlobeOSS Sdn Bhd","SILVER","Tiraa"]
];

function setupSheetMetadata() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  for (let day = 1; day <= 4; day++) ensureHeaders(getDaySheet(spreadsheet, day));
  ensureLogSheet(spreadsheet);
}

function doGet() {
  try {
    const data = listData();
    return jsonResponse({ ok: true, records: data.records, logs: data.logs });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    if (payload.action === "upsert" && payload.record) upsertRecord(payload.record);
    else if (payload.action === "checkin" && payload.day && payload.company && payload.pic) addCheckIn(payload);
    else throw new Error("Invalid request");
    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  }
}

function listData() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const records = [];
  for (let day = 1; day <= 4; day++) {
    const sheet = getDaySheet(spreadsheet, day);
    ensureHeaders(sheet);
    if (sheet.getLastRow() < 2) continue;
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 9).getDisplayValues().forEach(row => {
      if (!row[0]) return;
      records.push({day, company:row[0], student_number:row[1], resume_collected:isYes(row[2]), feedback:row[3], lunch_collected:isYes(row[4]), tier:row[5], assigned_pic:row[6], latest_time:row[7], latest_pic:row[8]});
    });
  }
  const logSheet = ensureLogSheet(spreadsheet);
  const logs = logSheet.getLastRow() < 2 ? [] : logSheet.getRange(2, 1, logSheet.getLastRow() - 1, 4).getDisplayValues().map(row => ({timestamp:row[0], day:Number(row[1]), company:row[2], pic:row[3]})).reverse();
  return { records, logs };
}

function upsertRecord(record) {
  withLock(() => {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getDaySheet(spreadsheet, Number(record.day));
    ensureHeaders(sheet);
    const rowNumber = findCompanyRow(sheet, record.company);
    const sponsor = findSponsor(record.company);
    const existing = sheet.getRange(rowNumber, 1, 1, 9).getDisplayValues()[0];
    sheet.getRange(rowNumber, 1, 1, 9).setValues([[
      record.company, record.student_number || "", record.resume_collected ? "Yes" : "No",
      record.feedback || "", record.lunch_collected ? "Yes" : "No",
      sponsor ? sponsor[1] : existing[5], sponsor ? sponsor[2] : (record.assigned_pic || existing[6]),
      existing[7], existing[8]
    ]]);
  });
}

function addCheckIn(payload) {
  withLock(() => {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getDaySheet(spreadsheet, Number(payload.day));
    ensureHeaders(sheet);
    const rowNumber = findCompanyRow(sheet, payload.company);
    const timestamp = new Date();
    sheet.getRange(rowNumber, 8, 1, 2).setValues([[timestamp, payload.pic]]);
    sheet.getRange(rowNumber, 8).setNumberFormat("dd MMM yyyy, HH:mm");
    const logSheet = ensureLogSheet(spreadsheet);
    logSheet.appendRow([timestamp, Number(payload.day), payload.company, payload.pic]);
    logSheet.getRange(logSheet.getLastRow(), 1).setNumberFormat("dd MMM yyyy, HH:mm");
  });
}

function ensureHeaders(sheet) {
  const oldHeaders = sheet.getRange(1, 1, 1, Math.min(sheet.getMaxColumns(), 10)).getDisplayValues()[0];
  const isOld = oldHeaders[4] === "Chat Time 1" && oldHeaders[5] === "PIC";
  if (isOld && sheet.getLastRow() > 1) {
    const oldRows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).getDisplayValues();
    const migrated = oldRows.map(row => {
      const sponsor = findSponsor(row[0]);
      return [row[0],row[1],row[2],row[3],"",sponsor ? sponsor[1] : row[8],sponsor ? sponsor[2] : row[9],row[6] || row[4],row[7] || row[5]];
    });
    sheet.getRange(2, 1, migrated.length, 9).setValues(migrated);
  }
  sheet.getRange(1, 1, 1, 9).setValues([HEADERS]).setFontWeight("bold").setBackground("#1e4b3a").setFontColor("#ffffff");
  sheet.setFrozenRows(1);
  const picValidation = SpreadsheetApp.newDataValidation().requireValueInList(PIC_NAMES, true).setAllowInvalid(false).build();
  sheet.getRange(2, 7, Math.max(sheet.getMaxRows() - 1, 1), 1).setDataValidation(picValidation);
  const checkValidation = SpreadsheetApp.newDataValidation().requireCheckbox("Yes", "No").build();
  sheet.getRange(2, 3, Math.max(sheet.getMaxRows() - 1, 1), 1).setDataValidation(checkValidation);
  sheet.getRange(2, 5, Math.max(sheet.getMaxRows() - 1, 1), 1).setDataValidation(checkValidation);
  if (sheet.getLastRow() > 1) {
    const names = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getDisplayValues().flat();
    const metadata = names.map(name => { const sponsor = findSponsor(name); return sponsor ? [sponsor[1], sponsor[2]] : ["", ""]; });
    sheet.getRange(2, 6, metadata.length, 2).setValues(metadata);
  }
}

function ensureLogSheet(spreadsheet) {
  const sheet = spreadsheet.getSheetByName("Interaction Logs") || spreadsheet.insertSheet("Interaction Logs");
  sheet.getRange(1, 1, 1, 4).setValues([LOG_HEADERS]).setFontWeight("bold").setBackground("#1e4b3a").setFontColor("#ffffff");
  sheet.setFrozenRows(1);
  return sheet;
}
function getDaySheet(spreadsheet, day) {
  for (const name of [`Day ${day}`, `Day${day}`, `DAY ${day}`, `day ${day}`]) { const sheet = spreadsheet.getSheetByName(name); if (sheet) return sheet; }
  return spreadsheet.insertSheet(`Day ${day}`);
}
function findCompanyRow(sheet, company) {
  const names = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getDisplayValues().flat() : [];
  const index = names.findIndex(name => normalizeCompany(name) === normalizeCompany(company));
  return index >= 0 ? index + 2 : sheet.getLastRow() + 1;
}
function findSponsor(company) { return SPONSORS.find(item => normalizeCompany(item[0]) === normalizeCompany(company)); }
function normalizeCompany(value) { return String(value || "").toLowerCase().replace(/\b(sdn|bhd|berhad)\b/g, "").replace(/[^a-z0-9]/g, ""); }
function isYes(value) { return ["yes","true","✓","checked"].includes(String(value).toLowerCase()); }
function withLock(callback) { const lock = LockService.getScriptLock(); lock.waitLock(10000); try { callback(); SpreadsheetApp.flush(); } finally { lock.releaseLock(); } }
function jsonResponse(payload) { return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON); }
