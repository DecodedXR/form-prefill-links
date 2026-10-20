/**
 * Form Prefill Links: a pre-filled Google Form link for every row of a sheet.
 *
 * Setup: name sheet columns exactly like the form's questions. Run 🔗 Prefill → Make
 * Prefilled Links and paste the form's edit link. A "Prefilled Link" column gets one
 * link per row, with that row's answers already filled in. Send them with a mail merge
 * by putting {{Prefilled Link}} in the email.
 */

const LINK_COL = 'Prefilled Link';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🔗 Prefill')
    .addItem('Make Prefilled Links', 'makeLinks')
    .addItem('Change Form', 'changeForm')
    .addToUi();
}

function changeForm() {
  PropertiesService.getDocumentProperties().deleteProperty('formUrl');
  makeLinks();
}

function makeLinks() {
  const ui = SpreadsheetApp.getUi();
  const form = getForm_(ui);
  if (!form) return;
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getDataRange();
  const values = range.getValues();
  const shown = range.getDisplayValues();
  const headers = shown[0].map(h => h.trim());
  let linkIdx = headers.indexOf(LINK_COL);
  if (linkIdx === -1) {
    linkIdx = headers.length;
    sheet.getRange(1, linkIdx + 1).setValue(LINK_COL);
  }

  const items = form.getItems();
  const matched = matchItems_(headers, items.map(i => i.getTitle()));
  if (!matched.length) {
    ui.alert('None of the column headers match a question title in "' + form.getTitle() + '". Rename columns to match the questions exactly.');
    return;
  }

  const out = [];
  let made = 0, failed = 0;
  for (let r = 1; r < values.length; r++) {
    if (values[r].every(v => v === '')) { out.push([shown[r][linkIdx] || '']); continue; }
    try {
      let resp = form.createResponse();
      for (const m of matched) {
        const ir = itemResponse_(items[m.item], values[r][m.col], shown[r][m.col]);
        if (ir) resp = resp.withItemResponse(ir);
      }
      out.push([resp.toPrefilledUrl()]);
      made++;
    } catch (e) {
      out.push(['ERROR: ' + e.message]);
      failed++;
    }
  }
  if (out.length) sheet.getRange(2, linkIdx + 1, out.length, 1).setValues(out);
  const unused = items.length - matched.length;
  ui.alert('Made ' + made + ' prefilled link(s)' + (failed ? ', ' + failed + ' failed (see the column)' : '') + '.\n' +
    'Matched questions: ' + matched.map(m => '"' + headers[m.col] + '"').join(', ') +
    (unused ? '\n' + unused + ' question(s) have no matching column and are left blank.' : ''));
}

/** Columns whose header equals a question title (case and spacing ignored). */
function matchItems_(headers, titles) {
  const norm = s => String(s).trim().replace(/\s+/g, ' ').toLowerCase();
  const out = [];
  headers.forEach((h, col) => {
    if (!h || h === LINK_COL) return;
    const item = titles.findIndex(t => norm(t) === norm(h));
    if (item !== -1) out.push({ col: col, item: item });
  });
  return out;
}

/** The right kind of answer for each question type; null to leave it blank. */
function itemResponse_(item, value, shown) {
  if (shown === '' || shown === null) return null;
  const T = FormApp.ItemType;
  switch (item.getType()) {
    case T.TEXT: return item.asTextItem().createResponse(shown);
    case T.PARAGRAPH_TEXT: return item.asParagraphTextItem().createResponse(shown);
    case T.MULTIPLE_CHOICE: return item.asMultipleChoiceItem().createResponse(shown);
    case T.LIST: return item.asListItem().createResponse(shown);
    case T.CHECKBOX: return item.asCheckboxItem().createResponse(splitChoices_(shown));
    case T.SCALE: return item.asScaleItem().createResponse(Number(shown));
    case T.DATE: return item.asDateItem().createResponse(value instanceof Date ? value : new Date(shown));
    default: return null; // grids, time, file upload: not prefillable this way
  }
}

/** "Red, Blue" → ["Red", "Blue"] for checkbox questions. */
function splitChoices_(s) {
  return String(s).split(',').map(x => x.trim()).filter(Boolean);
}

function getForm_(ui) {
  const props = PropertiesService.getDocumentProperties();
  let url = props.getProperty('formUrl');
  if (!url) {
    const resp = ui.prompt('Form Prefill Links', 'Paste the form\'s EDIT link (from the form editor\'s address bar):', ui.ButtonSet.OK_CANCEL);
    if (resp.getSelectedButton() !== ui.Button.OK) return null;
    url = resp.getResponseText().trim();
  }
  try {
    const form = FormApp.openByUrl(url);
    props.setProperty('formUrl', url);
    return form;
  } catch (e) {
    props.deleteProperty('formUrl');
    ui.alert('Couldn\'t open that form (' + e.message + '). Use the edit link of a form you can edit.');
    return null;
  }
}
