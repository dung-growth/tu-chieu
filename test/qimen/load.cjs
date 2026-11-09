/* Nạp file script trình duyệt (lunar.js, qimen.js) trong Node mà không phụ thuộc "type" của package.json */
const fs = require('fs'), path = require('path'), vm = require('vm');
module.exports = function load(file, globals = {}) {
  const src = fs.readFileSync(path.resolve(file), 'utf8'), m = { exports: {} };
  const ctx = vm.createContext(Object.assign({ module: m, exports: m.exports, console, Date, Math, JSON }, globals));
  vm.runInContext(src, ctx, { filename: file });
  return m.exports;
};
