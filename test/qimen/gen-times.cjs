/* Sinh danh sách thời điểm kiểm thử (giờ UTC+8, để so với kinqimen vốn tính theo giờ Bắc Kinh).
   Dùng: node gen-times.cjs <đường dẫn lunar.js dạng CommonJS> > times.json */
const L = require('./load.cjs')(process.argv[2]);
let seed = 20261109; const rnd = n => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
const out = [], tag = [];
const add = (t, why) => { out.push(t); tag.push(why); };
// A. 320 thời điểm ngẫu nhiên 1950–2049
for (let i = 0; i < 320; i++) {
  const y = 1950 + rnd(100), m = 1 + rnd(12), d = 1 + rnd(28), h = rnd(24), mi = rnd(60);
  add([y, m, d, h, mi], 'ngẫu nhiên');
}
// B. Sát giờ giao tiết khí: 7 phút trước và sau, 48 tiết khí trong 2024–2025 và 12 tiết rải các năm khác
const terms = [];
for (const y of [2024, 2025]) { const tb = L.Lunar.fromYmd(y, 6, 1).getJieQiTable(); for (const k in tb) { const s = tb[k]; if (s.getYear() === y) terms.push(s); } }
for (const y of [1953, 1968, 1977, 1986, 1999, 2008, 2016, 2033, 2041, 2048]) { const tb = L.Lunar.fromYmd(y, 6, 1).getJieQiTable(); const ks = Object.keys(tb); const s = tb[ks[rnd(ks.length)]]; terms.push(s); }
const seen = new Set();
terms.forEach(s => { const key = s.toYmdHms(); if (seen.has(key)) return; seen.add(key);
  for (const off of [-7, 7]) { const u = new Date(Date.UTC(s.getYear(), s.getMonth() - 1, s.getDay(), s.getHour(), s.getMinute()) + off * 60e3);
    add([u.getUTCFullYear(), u.getUTCMonth() + 1, u.getUTCDate(), u.getUTCHours(), u.getUTCMinutes()], off < 0 ? 'trước giao tiết' : 'sau giao tiết'); } });
// C. Giờ Tý: 23:xx (đổi ngày) và 00:xx của cùng ngày, gồm cả ngày cuối tháng
for (let i = 0; i < 30; i++) {
  const y = 1960 + rnd(80), m = 1 + rnd(12), dmax = new Date(Date.UTC(y, m, 0)).getUTCDate(), d = i < 8 ? dmax : 1 + rnd(dmax);
  add([y, m, d, 23, 1 + rnd(58)], d === dmax ? 'giờ Tý muộn, cuối tháng' : 'giờ Tý muộn (23h)');
  add([y, m, d, 0, 1 + rnd(58)], 'giờ Tý sớm (0h)');
}
process.stdout.write(JSON.stringify({ times: out, tags: tag }));
