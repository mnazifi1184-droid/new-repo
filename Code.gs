/**
 * سیستم لاگین چند کاربره با نقش (Admin / Editor / User)
 * ذخیره‌سازی: Google Sheets
 * مدیریت جلسه: CacheService (توکن، اعتبار ۶ ساعت)
 */

const SHEET_NAME = 'Users';
const RECORDS_SHEET_NAME = 'Records';
const SESSION_DURATION_SECONDS = 21600;
const VALID_ROLES = ['Admin', 'Editor', 'User'];

const SPREADSHEET_ID = '1cKxTt9kL9nJ4mQ8wSx7Yp3Vf6aBcDeFgHiJkLmNoPq';
const UPLOAD_SHEET_ID = '1cKxTt9kL9nJ4mQ8wSx7Yp3Vf6aBcDeFgHiJkLmNoPq';

function doGet(e) {
  const page = e && e.parameter && e.parameter.page ? e.parameter.page : 'Login';
  const allowedPages = ['Login', 'Signup', 'Dashboard', 'Upload', 'View', 'Merge'];
  const safePage = allowedPages.includes(page) ? page : 'Login';

  const template = HtmlService.createTemplateFromFile(safePage);
  template.baseUrl = ScriptApp.getService().getUrl();
  return template.evaluate()
    .setTitle('Inventory Management')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getSpreadsheet_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getUploadSpreadsheet_() {
  return SpreadsheetApp.openById(UPLOAD_SHEET_ID);
}

function getUsersSheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['id', 'fullname', 'username', 'password', 'role', 'isActive', 'createdAt']);
  }
  return sheet;
}

function signUp(fullname, username, password, role) {
  const sheet = getUsersSheet_();
  const values = sheet.getDataRange().getValues();
  const normalizedUsername = String(username || '').trim().toLowerCase();

  if (!normalizedUsername || !password || !fullname) {
    return { success: false, message: 'All fields are required.' };
  }

  const exists = values.slice(1).some(row => String(row[2]).trim().toLowerCase() === normalizedUsername);
  if (exists) return { success: false, message: 'Username already exists.' };

  const safeRole = VALID_ROLES.includes(role) ? role : 'User';
  const id = Utilities.getUuid();
  sheet.appendRow([id, fullname, normalizedUsername, password, safeRole, true, new Date()]);

  return { success: true, message: 'Registration successful.' };
}

function signIn(username, password) {
  const sheet = getUsersSheet_();
  const values = sheet.getDataRange().getValues();
  const normalizedUsername = String(username || '').trim().toLowerCase();
  const row = values.slice(1).find(r => String(r[2]).trim().toLowerCase() === normalizedUsername);

  if (!row) return { success: false, message: 'User not found.' };
  if (String(row[3]) !== String(password)) return { success: false, message: 'Invalid username or password.' };
  if (row[5] === false || String(row[5]).toLowerCase() === 'false') return { success: false, message: 'User is inactive.' };

  const token = Utilities.getUuid();
  const session = { id: row[0], fullname: row[1], username: row[2], role: row[4] };
  CacheService.getScriptCache().put('session_' + token, JSON.stringify(session), SESSION_DURATION_SECONDS);

  return { success: true, token, user: session };
}

function getSessionUser(token) {
  if (!token) return null;
  const raw = CacheService.getScriptCache().get('session_' + token);
  return raw ? JSON.parse(raw) : null;
}

function signOut(token) {
  if (token) CacheService.getScriptCache().remove('session_' + token);
  return { success: true };
}

function requireSession_(token) {
  const user = getSessionUser(token);
  if (!user) throw new Error('Authentication required.');
  return user;
}

function requireRole_(token, roles) {
  const user = requireSession_(token);
  if (!roles.includes(user.role)) throw new Error('You do not have permission to perform this action.');
  return user;
}

function getDashboardData(token) {
  const user = requireSession_(token);
  const sheet = getSpreadsheet_().getSheetByName(RECORDS_SHEET_NAME);
  const records = sheet ? sheet.getDataRange().getDisplayValues() : [];
  return {
    user,
    totalRecords: Math.max(0, records.length - 1),
    records: records.slice(1, 11)
  };
}

function getUsers(token) {
  requireRole_(token, ['Admin']);
  const values = getUsersSheet_().getDataRange().getDisplayValues();
  return values.slice(1).map(row => ({
    id: row[0], fullname: row[1], username: row[2], role: row[4], isActive: row[5] !== 'false'
  }));
}

function updateUserRole(token, userId, role) {
  requireRole_(token, ['Admin']);
  if (!VALID_ROLES.includes(role)) throw new Error('Invalid role.');
  const sheet = getUsersSheet_();
  const values = sheet.getDataRange().getValues();
  const index = values.findIndex(row => String(row[0]) === String(userId));
  if (index < 1) throw new Error('User not found.');
  sheet.getRange(index + 1, 5).setValue(role);
  return { success: true };
}

function updateUserStatus(token, userId, isActive) {
  requireRole_(token, ['Admin']);
  const sheet = getUsersSheet_();
  const values = sheet.getDataRange().getValues();
  const index = values.findIndex(row => String(row[0]) === String(userId));
  if (index < 1) throw new Error('User not found.');
  sheet.getRange(index + 1, 6).setValue(Boolean(isActive));
  return { success: true };
}

function listSheets(token) {
  requireSession_(token);
  return getUploadSpreadsheet_().getSheets().map(s => ({ name: s.getName(), id: s.getSheetId() }));
}

function deleteSheet(token, sheetName) {
  requireRole_(token, ['Admin', 'Editor']);
  const ss = getUploadSpreadsheet_();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error('Sheet not found.');
  if (ss.getSheets().length === 1) throw new Error('Cannot delete the last sheet.');
  ss.deleteSheet(sheet);
  return { success: true };
}

function getSheetData(token, sheetName) {
  requireSession_(token);
  const sheet = getUploadSpreadsheet_().getSheetByName(sheetName);
  if (!sheet) throw new Error('Sheet not found.');
  return { name: sheetName, values: sheet.getDataRange().getDisplayValues() };
}

function detectHeaderSmart(base64, fileName) {
  return { success: true, fileName, message: 'Header detection is ready for the modular upload service.', headers: [] };
}

function uploadExcel(base64, fileName, sheetName) {
  requireRole_('', ['Admin', 'Editor']);
  return { success: false, message: 'Upload service migration is pending.' };
}

function mergeSheets(token, config) {
  requireRole_(token, ['Admin', 'Editor']);
  return { success: false, message: 'Merge service migration is pending.' };
}
