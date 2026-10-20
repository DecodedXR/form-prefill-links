// Self-check for header matching and checkbox splitting: node test.js
const vm = require('vm'), fs = require('fs'), assert = require('assert');
const ctx = {}; vm.runInNewContext(fs.readFileSync(__dirname + '/Code.gs', 'utf8'), ctx);
const m = ctx.matchItems_(['Name', 'Email', 'Which  sessions?', 'Prefilled Link', ''], ['What is your name?', 'which sessions?', 'Email']);
assert.deepEqual(JSON.parse(JSON.stringify(m)), [{ col: 1, item: 2 }, { col: 2, item: 1 }]);
assert.deepEqual([...ctx.splitChoices_('Red, Blue ,,Green')], ['Red', 'Blue', 'Green']);
console.log('ok');
