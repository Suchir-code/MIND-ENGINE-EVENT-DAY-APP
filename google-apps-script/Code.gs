const SPREADSHEET_ID = "1qJZQIpmhnWsTNRzKKJkHq0sTDlAxtumq-bfviREMCdE";
const HEADERS = [
  "Company Name",
  "Student Number",
  "Resume Collected",
  "Feedback",
  "Chat Time 1",
  "PIC",
  "Chat Time 2",
  "PIC"
];
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
}

function doGet(e) {
  try {
    return jsonResponse({ ok: true, records: listRecords() });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    if (payload.action !== "upsert" || !payload.record) {
      throw new Error("Invalid request");
    }
    upsertRecord(payload.record);
    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  }
}

function listRecords() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const records = [];

  for (let day = 1; day <= 4; day++) {
    const sheet = getDaySheet(spreadsheet, day);
    ensureHeaders(sheet);
    if (sheet.getLastRow() < 2) continue;

    const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).getDisplayValues();
    values.forEach(row => {
      if (!row[0]) return;
      records.push({
        day,
        company: row[0],
        student_number: row[1],
        resume_collected: ["yes", "true", "✓", "checked"].includes(String(row[2]).toLowerCase()),
        feedback: row[3],
        chat_time_1: row[4],
        pic_1: row[5],
        chat_time_2: row[6],
        pic_2: row[7]
      });
    });
  }

  return records;
}

function upsertRecord(record) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getDaySheet(spreadsheet, Number(record.day));
    ensureHeaders(sheet);
    const companyNames = sheet.getLastRow() > 1
      ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getDisplayValues().flat()
      : [];
    const index = companyNames.findIndex(name => name.trim() === String(record.company).trim());
    const rowNumber = index >= 0 ? index + 2 : sheet.getLastRow() + 1;

    sheet.getRange(rowNumber, 1, 1, 8).setValues([[
      record.company,
      record.student_number || "",
      record.resume_collected ? "Yes" : "No",
      record.feedback || "",
      record.chat_time_1 || "",
      record.pic_1 || "",
      record.chat_time_2 || "",
      record.pic_2 || ""
    ]]);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
}

function getDaySheet(spreadsheet, day) {
  const candidates = [`Day ${day}`, `Day${day}`, `DAY ${day}`, `day ${day}`];
  for (const name of candidates) {
    const sheet = spreadsheet.getSheetByName(name);
    if (sheet) return sheet;
  }
  return spreadsheet.insertSheet(`Day ${day}`);
}

function ensureHeaders(sheet) {
  const current = sheet.getRange(1, 1, 1, 8).getDisplayValues()[0];
  if (current.join("|") !== HEADERS.join("|")) {
    sheet.getRange(1, 1, 1, 8).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#1e4b3a").setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }
  const validation = SpreadsheetApp.newDataValidation()
    .requireValueInList(PIC_NAMES, true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 6, Math.max(sheet.getMaxRows() - 1, 1), 1).setDataValidation(validation);
  sheet.getRange(2, 8, Math.max(sheet.getMaxRows() - 1, 1), 1).setDataValidation(validation);
  sheet.getRange("I1:J1").setValues([["Sponsor Tier", "Assigned Lead PIC"]])
    .setFontWeight("bold").setBackground("#1e4b3a").setFontColor("#ffffff");
  if (sheet.getLastRow() > 1) {
    const names = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getDisplayValues().flat();
    const metadata = names.map(name => {
      const match = SPONSORS.find(item => normalizeCompany(item[0]) === normalizeCompany(name));
      return match ? [match[1], match[2]] : ["", ""];
    });
    sheet.getRange(2, 9, metadata.length, 2).setValues(metadata);
  }
}

function normalizeCompany(value) {
  return String(value || "").toLowerCase()
    .replace(/\b(sdnhd|sdn bhd|berhad|bhd)\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
