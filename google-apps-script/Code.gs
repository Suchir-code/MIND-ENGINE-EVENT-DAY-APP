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
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
