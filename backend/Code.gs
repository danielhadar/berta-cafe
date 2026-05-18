/**
 * Berta Coffee — punch card backend (Google Apps Script).
 *
 * Two sheets in the spreadsheet:
 *
 *   "codes" sheet (current punch state per code):
 *     A: code | B: coffee | C: pizza | D: sandwich | E: updated_at
 *
 *   "events" sheet (auto-created on first event, append-only):
 *     A: ts | B: type | C: value
 *     type ∈ {punch, freebie, social}
 *     value: tab key for punch/freebie ("coffee"/"pizza"/"sandwich"),
 *            icon key for social ("facebook"/"instagram"/"maps"/"phone").
 *
 * API:
 *   GET  ?action=get&code=XXXXXX        -> { ok, state }
 *   POST {action:"set",   code, state}  -> { ok }; server diffs old→new and
 *                                         logs punch/freebie events.
 *   POST {action:"click", value}        -> { ok }; logs a social event.
 *
 * Frontend uses Content-Type: text/plain to skip CORS preflight; we read the
 * body from e.postData.contents.
 *
 * Keep TAB_KEYS in sync with TABS in src/app.js. TAB_TOTALS must match the
 * `total` on each tab — it's how the server detects freebie events.
 *
 * Schema self-heal: on every invocation, the script renames the first sheet
 * to "codes" if needed, ensures the "events" sheet exists, and rewrites
 * either header if it doesn't exactly match what the script expects.
 */

var TAB_KEYS      = ['coffee', 'pizza', 'sandwich'];
var TAB_TOTALS    = { coffee: 10, pizza: 10, sandwich: 10 };
var SOCIAL_VALUES = ['facebook', 'instagram', 'maps', 'phone'];

var CODES_HEADER  = ['code'].concat(TAB_KEYS).concat(['updated_at']);
var EVENTS_HEADER = ['ts', 'type', 'value'];
var CODE_REGEX    = /^[2-9A-HJ-NP-Z]{6}$/;

// ---------- sheet accessors ----------

function getCodesSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('codes');
  if (!sheet) {
    // First-time migration: rename the original first sheet to "codes".
    sheet = ss.getSheets()[0];
    if (sheet.getName() !== 'codes') sheet.setName('codes');
  }
  ensureHeader_(sheet, CODES_HEADER);
  return sheet;
}

function getEventsSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('events');
  if (!sheet) sheet = ss.insertSheet('events');
  ensureHeader_(sheet, EVENTS_HEADER);
  return sheet;
}

// Rewrite row 1 if it doesn't exactly match what the script expects. Lets
// schema changes self-heal on the next write — the operator only needs to
// clear stale data rows, not also fix the header by hand.
function ensureHeader_(sheet, expected) {
  var current = sheet.getRange(1, 1, 1, expected.length).getValues()[0];
  for (var i = 0; i < expected.length; i++) {
    if (current[i] !== expected[i]) {
      sheet.getRange(1, 1, 1, expected.length).setValues([expected]);
      sheet.setFrozenRows(1);
      return;
    }
  }
}

// ---------- helpers ----------

function findCodeRow_(sheet, code) {
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

function readCodePunches_(sheet, row) {
  var values = sheet.getRange(row, 1, 1, CODES_HEADER.length).getValues()[0];
  var out = {};
  for (var i = 0; i < TAB_KEYS.length; i++) {
    out[TAB_KEYS[i]] = toInt_(values[CODES_HEADER.indexOf(TAB_KEYS[i])]);
  }
  return out;
}

function rowToState_(values) {
  var state = {};
  for (var i = 0; i < TAB_KEYS.length; i++) {
    var col = CODES_HEADER.indexOf(TAB_KEYS[i]);
    state[TAB_KEYS[i]] = { punches: toInt_(values[col]) };
  }
  return state;
}

function stateToCodeRow_(code, state, now) {
  var row = new Array(CODES_HEADER.length);
  for (var i = 0; i < row.length; i++) row[i] = '';
  row[CODES_HEADER.indexOf('code')] = code;
  row[CODES_HEADER.indexOf('updated_at')] = now;
  for (var i = 0; i < TAB_KEYS.length; i++) {
    var key = TAB_KEYS[i];
    var punches = (state[key] && typeof state[key].punches === 'number') ? state[key].punches : 0;
    row[CODES_HEADER.indexOf(key)] = toInt_(punches);
  }
  return row;
}

function punchesFromState_(state) {
  var out = {};
  for (var i = 0; i < TAB_KEYS.length; i++) {
    var key = TAB_KEYS[i];
    out[key] = (state[key] && typeof state[key].punches === 'number') ? toInt_(state[key].punches) : 0;
  }
  return out;
}

// ---------- event logging ----------

/**
 * Compare old → new punches per tab. For each positive delta, write N punch
 * events. If a tab reaches its total this round (and wasn't there before),
 * write a freebie event. Decreases (e.g. 10→0 on celebration dismissal) emit
 * nothing.
 */
function logPunchAndFreebieEvents_(oldPunches, newPunches, now) {
  var rows = [];
  for (var i = 0; i < TAB_KEYS.length; i++) {
    var key = TAB_KEYS[i];
    var oldN = oldPunches[key] || 0;
    var newN = newPunches[key] || 0;
    if (newN <= oldN) continue;
    var delta = newN - oldN;
    for (var j = 0; j < delta; j++) {
      rows.push([now, 'punch', key]);
    }
    var total = TAB_TOTALS[key];
    if (typeof total === 'number' && newN === total && oldN < total) {
      rows.push([now, 'freebie', key]);
    }
  }
  if (rows.length === 0) return;
  var sheet = getEventsSheet_();
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, EVENTS_HEADER.length).setValues(rows);
}

function logSocialEvent_(value, now) {
  getEventsSheet_().appendRow([now, 'social', value]);
}

// ---------- response ----------

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---------- handlers ----------

function doGet(e) {
  try {
    var action = (e && e.parameter) ? e.parameter.action : null;
    var code   = (e && e.parameter) ? e.parameter.code   : null;
    if (action !== 'get' || !code || !CODE_REGEX.test(code)) {
      return json_({ ok: false, error: 'bad_request' });
    }
    var sheet = getCodesSheet_();
    var row = findCodeRow_(sheet, code);
    if (row === -1) return json_({ ok: false });
    var values = sheet.getRange(row, 1, 1, CODES_HEADER.length).getValues()[0];
    return json_({ ok: true, state: rowToState_(values) });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function handleSet_(body, now) {
  if (!body.code || !CODE_REGEX.test(body.code) || !body.state) {
    return json_({ ok: false, error: 'bad_request' });
  }
  var sheet = getCodesSheet_();
  var row = findCodeRow_(sheet, body.code);
  var oldPunches = (row === -1) ? {} : readCodePunches_(sheet, row);
  var newPunches = punchesFromState_(body.state);
  var rowData = stateToCodeRow_(body.code, body.state, now);
  if (row === -1) {
    sheet.appendRow(rowData);
  } else {
    sheet.getRange(row, 1, 1, CODES_HEADER.length).setValues([rowData]);
  }
  logPunchAndFreebieEvents_(oldPunches, newPunches, now);
  return json_({ ok: true });
}

function handleClick_(body, now) {
  if (!body.value || SOCIAL_VALUES.indexOf(body.value) === -1) {
    return json_({ ok: false, error: 'bad_request' });
  }
  logSocialEvent_(body.value, now);
  return json_({ ok: true });
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var now = new Date().toISOString();
    if (body.action === 'set')   return handleSet_(body, now);
    if (body.action === 'click') return handleClick_(body, now);
    return json_({ ok: false, error: 'bad_request' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}
