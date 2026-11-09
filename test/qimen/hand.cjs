/* So engine với 10 bàn tính tay (giờ Việt Nam). Dùng: node hand.cjs <lunar.js CommonJS> <qimen.js> */
const fs = require('fs'), path = require('path');
const load = require('./load.cjs');
const L = load(process.argv[2]); const QM = load(process.argv[3], { Solar: L.Solar });
const { cases } = JSON.parse(fs.readFileSync(path.join(__dirname, 'hand-cases.json')));
let pass = 0;
for (const k of cases) {
  const c = QM.chart(...k.t, 7), bad = [];
  const eq = (name, a, b) => { if (String(a) !== String(b)) bad.push(`${name}: engine ${a} ≠ tay ${b}`); };
  eq('tiết khí', c.term.name, k.term); eq('độn', c.dun, k.dun); eq('nguyên', c.yuan, k.yuan); eq('cục', c.ju, k.ju);
  eq('trụ ngày', c.pillars.day, k.day); eq('trụ giờ', c.pillars.hour, k.hour);
  eq('trực phù', [c.zhifu.star, c.zhifu.palace], k.zhifu); eq('trực sử', [c.zhishi.door, c.zhishi.palace], k.zhishi);
  for (const p in k.earth) eq('địa bàn ' + p, c.palaces[p].earth[0], k.earth[p]);
  for (const p in k.sky) eq('thiên bàn ' + p, c.palaces[p].sky.join(''), k.sky[p]);
  for (const p in k.stars) eq('sao ' + p, c.palaces[p].star, k.stars[p]);
  for (const p in k.doors) eq('cửa ' + p, c.palaces[p].door, k.doors[p]);
  for (const p in k.gods) eq('thần ' + p, c.palaces[p].god, k.gods[p]);
  eq('không vong', [c.kong.day.join(''), c.kong.hour.join('')], k.kong); eq('dịch mã', c.ma.zhi, k.ma);
  if (bad.length) console.log(`✗ ${k.id} (${k.why})\n   ` + bad.join('\n   ')); else { pass++; console.log(`✓ ${k.id} ${k.why}`); }
}
console.log(`Bàn tính tay: ${pass}/${cases.length} khớp toàn bộ.`);
process.exitCode = pass === cases.length ? 0 : 1;
