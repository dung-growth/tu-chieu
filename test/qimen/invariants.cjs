/* Kiểm các bất biến của bàn trên 2.000 thời điểm ngẫu nhiên (giờ Việt Nam) và các trường hợp biên.
   Dùng: node invariants.cjs <lunar.js> <qimen.js> */
const load = require('./load.cjs');
const L = load(process.argv[2]); const QM = load(process.argv[3], { Solar: L.Solar });
let seed = 7; const rnd = n => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
const RING = [1, 8, 3, 4, 9, 2, 7, 6], fails = []; let n = 0, tzSame = 0, tzTerm = 0;
const fail = (t, why) => { if (fails.length < 30) fails.push(t.join('-') + ': ' + why); };
for (let i = 0; i < 2000; i++) {
  const t = [1950 + rnd(100), 1 + rnd(12), 1 + rnd(28), rnd(24), rnd(60)], c = QM.chart(...t, 7); n++;
  const P = c.palaces, outer = RING.map(p => P[p]);
  if (new Set(outer.map(x => x.star)).size !== 8) fail(t, 'sao không đủ 8 sao khác nhau');
  if (new Set(outer.map(x => x.door)).size !== 8) fail(t, 'cửa không đủ 8');
  if (new Set(outer.map(x => x.god)).size !== 8) fail(t, 'thần không đủ 8');
  if (new Set(Object.values(P).map(x => x.earth[0])).size !== 9) fail(t, 'địa bàn không đủ 9 can');
  // Can thiên bàn phải đi theo sao (can địa bàn của cung gốc của sao)
  outer.forEach(x => { const home = +Object.keys(QM.STAR_HOME).find(k => QM.STAR_HOME[k] === x.star); if (x.sky[0] !== P[home].earth[0]) fail(t, `thiên bàn cung ${x.palace} không theo sao`); });
  const zfStar = c.zhifu.star === '禽' ? '芮' : c.zhifu.star;
  if (P[c.zhifu.palace].star !== zfStar) fail(t, 'trực phù không nằm ở cung của nó');
  if (P[c.zhifu.palace].god !== '值符') fail(t, 'thần Trực Phù không cùng cung sao trực phù');
  if (P[c.zhishi.palace].door !== c.zhishi.door) fail(t, 'trực sử không nằm ở cung của nó');
  if (c.zhifu.palace === 5 || c.zhishi.palace === 5) fail(t, 'trực phù/sử còn ở cung giữa (phải ký Khôn)');
  // Thứ tự vòng của sao và cửa giữ nguyên (chuyển bàn)
  const k0 = RING.findIndex(p => P[p].star === '蓬'); if (RING.some((p, j) => P[RING[(k0 + j) % 8]].star !== QM.STAR_HOME[p])) fail(t, 'vòng sao bị đảo thứ tự');
  const d0 = RING.findIndex(p => P[p].door === '休'); if (RING.some((p, j) => P[RING[(d0 + j) % 8]].door !== QM.DOOR_HOME[p])) fail(t, 'vòng cửa bị đảo thứ tự');
  // Bát thần: Dương đi thuận vòng, Âm đi nghịch
  const g0 = RING.indexOf(c.zhifu.palace); if (QM.GODS.some((g, j) => P[RING[((g0 + (c.yang ? j : -j)) % 8 + 8) % 8]].god !== g)) fail(t, 'thứ tự bát thần sai chiều');
  // Địa bàn: Mậu ở cung số cục
  if (P[c.ju].earth[0] !== '戊') fail(t, 'Mậu không ở cung số cục');
  // Múi giờ: cùng giờ đồng hồ ở UTC+7 và UTC+8 phải cho cùng bàn, trừ khi giữa hai thời điểm có giờ giao tiết khí
  const c8 = QM.chart(...t, 8);
  if (c8.term.name !== c.term.name) tzTerm++;
  else { tzSame++; if (c8.ju !== c.ju || c8.dun !== c.dun || RING.some(p => c8.palaces[p].star !== P[p].star || c8.palaces[p].door !== P[p].door)) fail(t, 'đổi múi giờ làm đổi bàn dù cùng tiết khí'); }
}
// Biên: 22:59 / 23:00 / 00:59 / 01:00
const a = QM.chart(2024, 3, 10, 22, 59), b = QM.chart(2024, 3, 10, 23, 0), z = QM.chart(2024, 3, 11, 0, 59), z2 = QM.chart(2024, 3, 11, 1, 0);
if (a.pillars.day === b.pillars.day) fails.push('23:00 không đổi trụ ngày');
if (b.pillars.day !== z.pillars.day || b.pillars.hour !== z.pillars.hour) fails.push('23:00 và 00:59 phải cùng ngày, cùng giờ Tý');
if (z.pillars.hour === z2.pillars.hour) fails.push('01:00 phải sang giờ Sửu');
console.log(`Bất biến: ${n} bàn, lỗi ${fails.length}. Múi giờ: ${tzSame} ca cùng tiết khí cho cùng bàn, ${tzTerm} ca có giờ giao tiết khí xen giữa (bỏ qua).`);
fails.forEach(f => console.log('  ✗ ' + f));
process.exitCode = fails.length ? 1 : 0;
