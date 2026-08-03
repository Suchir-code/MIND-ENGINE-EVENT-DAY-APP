const SPREADSHEET_ID = "1qJZQIpmhnWsTNRzKKJkHq0sTDlAxtumq-bfviREMCdE";
const HEADERS = ["Company Name", "Student Number", "Resume Collected", "Feedback", "Lunch Collected", "Lanyard Returned", "Sponsor Tier", "Assigned PIC", "Latest Interaction", "Latest Check-in PIC"];
const LOG_HEADERS = ["Timestamp", "Day", "Company Name", "PIC", "Log ID"];
const PIC_NAMES = ["Suchir", "Daphne", "Jet Shen", "Thenmolly", "Tiraa", "Pui Yeng", "Jin Hong", "Joash", "Brandon"];
const SPONSORS = [
  ["Nestle Manufacturing Malaysia","BRONZE","Daphne"],["bp","GOLD","Daphne"],["Inchz IoT Sdn Bhd","GOLD","Daphne"],["AMD","GOLD","Daphne"],["Gamuda Berhad","SILVER","Daphne"],["Shortcut Asia","SILVER","Daphne"],["Nokia Services and Networks Malaysia Sdn Bhd","SILVER","Daphne"],
  ["Inno Lab Engineering Sdn Bhd","BRONZE","Jet Shen"],["Micron Malaysia","BRONZE","Jet Shen"],["Rooftop Energy Tech Sdn Bhd","GOLD","Jet Shen"],["WD","GOLD","Jet Shen"],["Ant International (AI Asia Services Sdn. Bhd.)","SILVER","Jet Shen"],["Mi Equipment","SILVER","Jet Shen"],["Alliance Precast Industries Sdn Bhd","SILVER","Jet Shen"],
  ["Netizen Testing Sdn Bhd","BRONZE","Pui Yeng"],["PwC in Malaysia","BRONZE","Pui Yeng"],["Deriv","BRONZE","Pui Yeng"],["Aonic","BRONZE","Pui Yeng"],["HSS Engineers Berhad","BRONZE","Pui Yeng"],["Shopee","GOLD","Pui Yeng"],["Configura Pacific Sdn Bhd","SILVER","Pui Yeng"],["ExxonMobil Business Support Centre Malaysia Sdn Bhd","SILVER","Pui Yeng"],
  ["Core Consulting","BRONZE","Suchir"],["RIFHAN Teknologi Sdn Bhd (Tech D)","BRONZE","Suchir"],["AT&S Austria Technologie & Systemtechnik","GOLD","Suchir"],["Tawk Sdn Bhd","OFFICIAL","Suchir"],["Juris Technologies Sdn Bhd","SILVER","Suchir"],["Solarvest Holdings Berhad (Atlantic Blue Sdn Bhd)","SILVER","Suchir"],["Food Panda","SILVER","Suchir"],
  ["KTA Tenaga Sdn Bhd","BRONZE","Thenmolly"],["JJ-Lurgi Engineering Sdn Bhd","BRONZE","Thenmolly"],["Advanced Semiconductor Academy of Malaysia (ASEM)","BRONZE","Thenmolly"],["Deloitte","GOLD","Thenmolly"],["Reactive Energy","SILVER","Thenmolly"],["JKS Engineering (M) Sdn Bhd","TWO DAY BRONZE","Thenmolly"],["SPX Express (Malaysia)","TWO DAY BRONZE","Thenmolly"],
  ["Averis","BRONZE","Tiraa"],["Bio to Business Sdn Bhd","BRONZE","Tiraa"],["IGB Berhad","BRONZE","Tiraa"],["Baltimore Aircoil Malaysia Sdn Bhd","BRONZE","Tiraa"],["Chuan Sin Sdn Bhd (Spritzer)","GOLD","Tiraa"],["Maistorage","SILVER","Tiraa"],["GlobeOSS Sdn Bhd","SILVER","Tiraa"]
];
const DAY_ROSTERS = {
  2: ["Advanced Semiconductor Academy of Malaysia (ASEM)","Averis","Bio to Business Sdn. Bhd","bp Malaysia","Inchz IoT Sdn Bhd","Rooftop Energy Tech Sdn Bhd","AT&S Austria Technologie & Systemtechnik","Deloitte","Tawk Sdn Bhd","Gamuda Berhad","Shortcut Asia Sdn. Bhd.","Ant International (AI Asia Services Sdn. Bhd.)","Configura Pacific Sdn Bhd","Juris Technologies Sdn. Bhd.","Food Panda","Reactive Energy","Maistorage","JKS Engineering (M) Sdn Bhd"],
  3: ["Nestle Manufacturing Malaysia","Inno Lab Engineering Sdn Bhd","PwC in Malaysia","Deriv","bp Malaysia","Inchz IoT Sdn Bhd","Advanced Micro Devices Global Services (M) Sdn. Bhd.","WD","AT&S Austria Technologie & Systemtechnik","Chuan Sin Sdn Bhd (Spritzer)","Tawk Sdn Bhd","Shortcut Asia Sdn. Bhd.","Mi Equipment","Alliance Precast Industries Sdn Bhd","Configura Pacific Sdn Bhd","ExxonMobil Business Support Centre Malaysia Sdn Bhd","Juris Technologies Sdn. Bhd.","Solarvest Holdings Berhad (Atlantic Blue Sdn Bhd)","GlobeOSS Sdn Bhd","JKS Engineering (M) Sdn Bhd"],
  4: ["Micron Malaysia","Aonic","HSS Engineers Berhad","RIFHAN Teknologi Sdn Bhd (Tech D)","IGB Berhad","Baltimore Aircoil Malaysia Sdn. Bhd.","Advanced Micro Devices Global Services (M) Sdn. Bhd.","WD","Shopee","Chuan Sin Sdn Bhd (Spritzer)","Tawk Sdn Bhd","Nokia Services and Networks Malaysia Sdn Bhd","Ant International (AI Asia Services Sdn. Bhd.)","Mi Equipment","Alliance Precast Industries Sdn Bhd","ExxonMobil Business Support Centre Malaysia Sdn Bhd","Solarvest Holdings Berhad (Atlantic Blue Sdn Bhd)","GlobeOSS Sdn Bhd","SPX Express (Malaysia)"]
};

function setupSheetMetadata() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  [2, 3, 4].forEach(day => ensureHeaders(getDaySheet(spreadsheet, day)));
  [2, 3, 4].forEach(day => syncDayRoster(spreadsheet, day, DAY_ROSTERS[day]));
  [2, 3, 4].forEach(day => ensureHeaders(getDaySheet(spreadsheet, day)));
  ensureLogSheet(spreadsheet);
}

function syncDayRoster(spreadsheet, day, roster) {
  const sheet = getDaySheet(spreadsheet, day);
  const existingRows = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).getValues().filter(row => String(row[0]).trim()) : [];
  const used = {};
  const renames = [];
  const rows = roster.map(company => {
    const index = existingRows.findIndex((row, rowIndex) => !used[rowIndex] && companiesMatch(row[0], company));
    if (index >= 0) {
      used[index] = true;
      const row = existingRows[index].slice();
      if (String(row[0]) !== company) renames.push([String(row[0]), company]);
      row[0] = company;
      return row;
    }
    const sponsor = findSponsor(company);
    return [company, "", "No", "", "No", "No", sponsor ? sponsor[1] : "", sponsor ? sponsor[2] : "", "", ""];
  });
  const rowsToClear = Math.max(sheet.getLastRow() - 1, roster.length, 1);
  sheet.getRange(2, 1, rowsToClear, 10).clearContent().clearDataValidations();
  sheet.getRange(2, 1, rows.length, 10).setValues(rows);
  const logSheet = spreadsheet.getSheetByName("Interaction Logs");
  if (logSheet && logSheet.getLastRow() > 1) {
    const logRows = logSheet.getRange(2, 2, logSheet.getLastRow() - 1, 2).getDisplayValues();
    const updated = logRows.map(row => {
      if (Number(row[0]) !== day) return row;
      const rename = renames.find(item => companiesMatch(row[1], item[0]));
      return rename ? [row[0], rename[1]] : row;
    });
    logSheet.getRange(2, 2, updated.length, 2).setValues(updated);
  }
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
    else if (payload.action === "undo_checkin" && payload.log_id) undoCheckIn(payload.log_id);
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
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).getDisplayValues().forEach(row => {
      if (!row[0]) return;
      records.push({day, company:row[0], student_number:row[1], resume_collected:isYes(row[2]), feedback:row[3], lunch_collected:isYes(row[4]), lanyard_returned:isYes(row[5]), tier:row[6], assigned_pic:row[7], latest_time:row[8], latest_pic:row[9]});
    });
  }
  const logSheet = ensureLogSheet(spreadsheet);
  const logs = logSheet.getLastRow() < 2 ? [] : logSheet.getRange(2, 1, logSheet.getLastRow() - 1, 5).getDisplayValues().map(row => ({timestamp:row[0], day:Number(row[1]), company:row[2], pic:row[3], log_id:row[4]})).reverse();
  return { records, logs };
}

function upsertRecord(record) {
  withLock(() => {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getDaySheet(spreadsheet, Number(record.day));
    ensureHeaders(sheet);
    const rowNumber = findCompanyRow(sheet, record.company);
    const sponsor = findSponsor(record.company);
    const existing = sheet.getRange(rowNumber, 1, 1, 10).getDisplayValues()[0];
    sheet.getRange(rowNumber, 1, 1, 10).setValues([[
      record.company, record.student_number || "", record.resume_collected ? "Yes" : "No",
      record.feedback || "", record.lunch_collected ? "Yes" : "No", record.lanyard_returned ? "Yes" : "No",
      sponsor ? sponsor[1] : existing[6], sponsor ? sponsor[2] : (record.assigned_pic || existing[7]),
      existing[8], existing[9]
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
    sheet.getRange(rowNumber, 9, 1, 2).setValues([[timestamp, payload.pic]]);
    sheet.getRange(rowNumber, 9).setNumberFormat("dd MMM yyyy, HH:mm");
    const logSheet = ensureLogSheet(spreadsheet);
    logSheet.appendRow([timestamp, Number(payload.day), payload.company, payload.pic, Utilities.getUuid()]);
    logSheet.getRange(logSheet.getLastRow(), 1).setNumberFormat("dd MMM yyyy, HH:mm");
  });
}

function undoCheckIn(logId) {
  withLock(() => {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const logSheet = ensureLogSheet(spreadsheet);
    if (logSheet.getLastRow() < 2) throw new Error("Interaction log not found");
    const values = logSheet.getRange(2, 1, logSheet.getLastRow() - 1, 5).getValues();
    const index = values.findIndex(row => String(row[4]) === String(logId));
    if (index < 0) throw new Error("Interaction log not found");
    const removed = values[index];
    logSheet.deleteRow(index + 2);
    const remaining = values.filter((row, rowIndex) => rowIndex !== index && Number(row[1]) === Number(removed[1]) && companiesMatch(row[2], removed[2]));
    remaining.sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
    const daySheet = getDaySheet(spreadsheet, Number(removed[1]));
    const companyRow = findCompanyRow(daySheet, removed[2]);
    daySheet.getRange(companyRow, 9, 1, 2).setValues([[remaining[0] ? remaining[0][0] : "", remaining[0] ? remaining[0][3] : ""]]);
    daySheet.getRange(companyRow, 9).setNumberFormat("dd MMM yyyy, HH:mm");
  });
}

function ensureHeaders(sheet) {
  const oldHeaders = sheet.getRange(1, 1, 1, Math.min(sheet.getMaxColumns(), 10)).getDisplayValues()[0];
  const isOld = oldHeaders[4] === "Chat Time 1" && oldHeaders[5] === "PIC";
  const isNineColumnVersion = oldHeaders[4] === "Lunch Collected" && oldHeaders[5] === "Sponsor Tier";
  sheet.getRange(2, 1, Math.max(sheet.getMaxRows() - 1, 1), 10).clearDataValidations();
  if (isOld && sheet.getLastRow() > 1) {
    const oldRows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).getDisplayValues();
    const migrated = oldRows.map(row => {
      const sponsor = findSponsor(row[0]);
      return [row[0],row[1],row[2],row[3],"","",sponsor ? sponsor[1] : row[8],sponsor ? sponsor[2] : row[9],row[6] || row[4],row[7] || row[5]];
    });
    sheet.getRange(2, 1, migrated.length, 10).setValues(migrated);
  } else if (isNineColumnVersion && sheet.getLastRow() > 1) {
    const currentRows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 9).getDisplayValues();
    const migrated = currentRows.map(row => [row[0],row[1],row[2],row[3],row[4],"",row[5],row[6],row[7],row[8]]);
    sheet.getRange(2, 1, migrated.length, 10).setValues(migrated);
  }
  sheet.getRange(1, 1, 1, 10).setValues([HEADERS]).setFontWeight("bold").setBackground("#1e4b3a").setFontColor("#ffffff");
  sheet.setFrozenRows(1);
  const populatedRows = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getDisplayValues().flat() : [];
  populatedRows.forEach((company, index) => {
    if (!String(company).trim()) sheet.getRange(index + 2, 2, 1, 9).clearContent().clearDataValidations();
  });
  const companyCount = populatedRows.filter(company => String(company).trim()).length;
  if (!companyCount) return;
  const picValidation = SpreadsheetApp.newDataValidation().requireValueInList(PIC_NAMES, true).setAllowInvalid(false).build();
  sheet.getRange(2, 8, companyCount, 1).setDataValidation(picValidation);
  const checkValidation = SpreadsheetApp.newDataValidation().requireCheckbox("Yes", "No").build();
  sheet.getRange(2, 3, companyCount, 1).setDataValidation(checkValidation);
  sheet.getRange(2, 5, companyCount, 1).setDataValidation(checkValidation);
  sheet.getRange(2, 6, companyCount, 1).setDataValidation(checkValidation);
  if (companyCount > 0) {
    const names = sheet.getRange(2, 1, companyCount, 1).getDisplayValues().flat();
    const metadata = names.map(name => { const sponsor = findSponsor(name); return sponsor ? [sponsor[1], sponsor[2]] : ["", ""]; });
    sheet.getRange(2, 7, metadata.length, 2).setValues(metadata);
  }
}

function ensureLogSheet(spreadsheet) {
  const sheet = spreadsheet.getSheetByName("Interaction Logs") || spreadsheet.insertSheet("Interaction Logs");
  sheet.getRange(1, 1, 1, 5).setValues([LOG_HEADERS]).setFontWeight("bold").setBackground("#1e4b3a").setFontColor("#ffffff");
  if (sheet.getLastRow() > 1) {
    const idRange = sheet.getRange(2, 5, sheet.getLastRow() - 1, 1);
    const ids = idRange.getDisplayValues().map(row => [row[0] || Utilities.getUuid()]);
    idRange.setValues(ids);
  }
  sheet.setFrozenRows(1);
  return sheet;
}
function getDaySheet(spreadsheet, day) {
  for (const name of [`Day ${day}`, `Day${day}`, `DAY ${day}`, `day ${day}`]) { const sheet = spreadsheet.getSheetByName(name); if (sheet) return sheet; }
  return spreadsheet.insertSheet(`Day ${day}`);
}
function findCompanyRow(sheet, company) {
  const names = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getDisplayValues().flat() : [];
  const index = names.findIndex(name => companiesMatch(name, company));
  return index >= 0 ? index + 2 : sheet.getLastRow() + 1;
}
function findSponsor(company) {
  const target = normalizeCompany(company);
  return SPONSORS.find(item => {
    const candidate = normalizeCompany(item[0]);
    return candidate === target || candidate.startsWith(target) || target.startsWith(candidate);
  });
}
function companiesMatch(a, b) {
  const first = normalizeCompany(a);
  const second = normalizeCompany(b);
  return first === second || first.startsWith(second) || second.startsWith(first);
}
function normalizeCompany(value) {
  let normalized = String(value || "").toLowerCase().replace(/\b(sdn|bhd|berhad|malaysia)\b/g, "").replace(/[^a-z0-9]/g, "").replace("precasr", "precast");
  if (normalized === "amd" || normalized.startsWith("advancedmicrodevices")) normalized = "amd";
  return normalized;
}
function isYes(value) { return ["yes","true","✓","checked"].includes(String(value).toLowerCase()); }
function withLock(callback) { const lock = LockService.getScriptLock(); lock.waitLock(10000); try { callback(); SpreadsheetApp.flush(); } finally { lock.releaseLock(); } }
function jsonResponse(payload) { return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON); }

function repairAndSetup() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  [2, 3, 4].forEach(day => {
    const sheet = getDaySheet(spreadsheet, day);
    sheet.getRange(2, 1, Math.max(sheet.getMaxRows() - 1, 1), 10).clearDataValidations();
  });
  setupSheetMetadata();
}
