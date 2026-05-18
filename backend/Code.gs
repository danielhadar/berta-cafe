/**
 * Berta Coffee — punch card backend (Google Apps Script).
 *
 * Storage model (flat columns, one row per customer):
 *   A: code        (string, 6 chars, alphabet [2-9A-HJ-NP-Z])
 *   B: coffee      (integer, punch count)
 *   C: pizza       (integer)
 *   D: sandwich    (integer)
 *   E: updated_at  (ISO string)
 *   Row 1 is the header (auto-written by the script on a blank sheet).
 *
 * Tab order is set by TAB_KEYS below — keep in sync with TABS in src/app.js.
 * Adding a tab: append a new key to TAB_KEYS *and* add a matching column to
 * the sheet header. Easiest: clear the sheet's first row and let the script
 * re-write the header on the next write.
 *
 * Wire protocol with the client stays {tab: {punches: N}, ...} — the wrapper
 * around the integer leaves room for future per-tab fields without breaking
 * older clients/servers.
 *
 * API (deployed as a Web App, "Execute as: me", "Anyone" access):
 *   GET  ?action=get&code=XXXXXX     -> { ok: true, state: {...} } or { ok: false }
 *   POST {action:"set", code, state} -> { ok: true }
 *
 * Frontend uses Content-Type: text/plain to skip CORS preflight; we read the
 * body from e.postData.contents.
 */

var TAB_KEYS = ['coffee', 'pizza', 'sandwich'];
var HEADER = ['code'].concat(TAB_KEYS).concat(['updated_at']);
var CODE_REGEX = /^[2-9A-HJ-NP-Z]{6}$/;

function getSheet_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADER.length).setValues([HEADER]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function findRow_(sheet, code) {
  var last = sheet.getLastRow();
  if (last < 2) return -1;
  var codes = sheet.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < codes.length; i++) {
    if (codes[i][0] === code) return i + 2;
  }
  return -1;
}

function toInt_(v) {
  var n = (typeof v === 'number') ? v : Number(v);
  if (!isFinite(n) || !Number.isInteger(n) || n < 0) return 0;
  return n;
}

function rowToState_(values) {
  var state = {};
  for (var i = 0; i < TAB_KEYS.length; i++) {
    var col = HEADER.indexOf(TAB_KEYS[i]);
    state[TAB_KEYS[i]] = { punches: toInt_(values[col]) };
  }
  return state;
}

function stateToRow_(code, state, now) {
  var row = new Array(HEADER.length);
  for (var i = 0; i < row.length; i++) row[i] = '';
  row[HEADER.indexOf('code')] = code;
  row[HEADER.indexOf('updated_at')] = now;
  for (var i = 0; i < TAB_KEYS.length; i++) {
    var key = TAB_KEYS[i];
    var punches = (state[key] && typeof state[key].punches === 'number') ? state[key].punches : 0;
    row[HEADER.indexOf(key)] = toInt_(punches);
  }
  return row;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    var action = (e && e.parameter) ? e.parameter.action : null;
    var code = (e && e.parameter) ? e.parameter.code : null;
    if (action !== 'get' || !code || !CODE_REGEX.test(code)) {
      return json_({ ok: false, error: 'bad_request' });
    }
    var sheet = getSheet_();
    var row = findRow_(sheet, code);
    if (row === -1) return json_({ ok: false });
    var values = sheet.getRange(row, 1, 1, HEADER.length).getValues()[0];
    return json_({ ok: true, state: rowToState_(values) });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.action !== 'set' || !body.code || !CODE_REGEX.test(body.code) || !body.state) {
      return json_({ ok: false, error: 'bad_request' });
    }
    var sheet = getSheet_();
    var row = findRow_(sheet, body.code);
    var now = new Date().toISOString();
    var rowData = stateToRow_(body.code, body.state, now);
    if (row === -1) {
      sheet.appendRow(rowData);
    } else {
      sheet.getRange(row, 1, 1, HEADER.length).setValues([rowData]);
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}
