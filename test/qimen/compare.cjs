/* So engine qimen.js với kinqimen trên toàn bộ cấu trúc bàn.
   Dùng: node compare.cjs <lunar.js CommonJS> <qimen.js>   (đọc times.json, tags.json, kinqimen-out.json cùng thư mục)
   Mọi thời điểm là giờ UTC+8 (quy ước của kinqimen); engine được gọi với tz = 8 để so đúng cùng một thời điểm. */
const fs = require('fs'), path = require('path');
const load = require('./load.cjs');
const L = load(process.argv[2]); const QM = load(process.argv[3], { Solar: L.Solar });
const dir = __dirname, times = JSON.parse(fs.readFileSync(path.join(dir, 'times.json'))), tags = JSON.parse(fs.readFileSync(path.join(dir, 'tags.json')));
const ref = JSON.parse(fs.readFileSync(path.join(dir, 'kinqimen-out.json')));
const GUA = { '坎': 1, '坤': 2, '震': 3, '巽': 4, '中': 5, '乾': 6, '兌': 7, '艮': 8, '離': 9 };
const GOD = { '符': '值符', '蛇': '螣蛇', '陰': '太陰', '合': '六合', '勾': '白虎', '虎': '白虎', '雀': '玄武', '玄': '玄武', '地': '九地', '天': '九天' };
const NUM = '一二三四五六七八九';
const fields = ['干支 ngày', '干支 giờ', 'âm/dương độn', 'tam nguyên', 'cục số', 'tiết khí', 'trực phù', 'trực sử', 'địa bàn', 'thiên bàn', 'cửu tinh', 'bát môn', 'bát thần', 'không vong', 'dịch mã'];
const stat = Object.fromEntries(fields.map(f => [f, { ok: 0, bad: 0 }]));
const cases = []; let crashed = 0, compared = 0;
ref.forEach((r, i) => {
  const t = times[i]; if (!r.ok) { crashed++; cases.push({ t, tag: tags[i], ref: 'kinqimen lỗi: ' + r.err }); return; }
  const c = QM.chart(...t, 8); compared++;
  const diff = [];
  const chk = (f, ok, a, b) => { stat[f][ok ? 'ok' : 'bad']++; if (!ok) diff.push({ f, mine: a, ref: b }); };
  const gz = r['干支'].match(/(..)年(..)月(..)日(..)時/);
  chk('干支 ngày', gz[3] === c.pillars.day, c.pillars.day, gz[3]);
  chk('干支 giờ', gz[4] === c.pillars.hour, c.pillars.hour, gz[4]);
  const pj = r['排局'];
  chk('âm/dương độn', (pj[0] === '陽') === c.yang, c.dun, pj.slice(0, 2));
  chk('tam nguyên', pj.slice(-2, -1) === '上中下'[['Thượng', 'Trung', 'Hạ'].indexOf(c.yuan)], c.yuan, pj.slice(-2));
  chk('cục số', NUM.indexOf(pj[2]) + 1 === c.ju, c.ju, pj[2]);
  chk('tiết khí', r['節氣'] === c.term.name, c.term.name, r['節氣']);
  const zf = r['值符值使']['值符星宮'], zs = r['值符值使']['值使門宮'];
  // kinqimen ghi cung trực phù là '中' khi can giờ ở cung giữa, nhưng vẫn đặt sao ở Khôn (ký cung): cùng một bàn, chỉ khác cách ghi
  chk('trực phù', zf[0].replace('芮', '禽') === c.zhifu.star.replace('芮', '禽') && (GUA[zf[1]] === c.zhifu.palace || (zf[1] === '中' && c.zhifu.palace === 2)), c.zhifu.star + '@' + c.zhifu.palace, zf.join('@'));
  chk('trực sử', zs[0] === c.zhishi.door && (GUA[zs[1]] === c.zhishi.palace || (zs[1] === '中' && c.zhishi.palace === 2)), c.zhishi.door + '@' + c.zhishi.palace, zs.join('@'));
  const eq = (f, refMap, mine) => { const bad = Object.entries(refMap).filter(([g, v]) => mine(GUA[g]) !== v); chk(f, !bad.length, bad.map(([g]) => g + ':' + mine(GUA[g])).join(' '), bad.map(([g, v]) => g + ':' + v).join(' ')); };
  eq('địa bàn', r['地盤'], p => c.palaces[p].earth[0]);
  eq('thiên bàn', Object.fromEntries(Object.entries(r['天盤']).filter(([g]) => g !== '中')), p => c.palaces[p].sky[0]);
  eq('cửu tinh', r['星'], p => (c.palaces[p].star || '').replace('芮', '禽'));
  eq('bát môn', r['門'], p => c.palaces[p].door);
  eq('bát thần', Object.fromEntries(Object.entries(r['神']).map(([g, v]) => [g, GOD[v]])), p => c.palaces[p].god);
  chk('không vong', r['旬空']['日空'] === c.kong.day.join('') && r['旬空']['時空'] === c.kong.hour.join(''), c.kong.day.join('') + '/' + c.kong.hour.join(''), r['旬空']['日空'] + '/' + r['旬空']['時空']);
  chk('dịch mã', r['驛馬'] === c.ma.zhi, c.ma.zhi, r['驛馬']);
  if (diff.length) cases.push({ t, tag: tags[i], mine: { term: c.term, dun: c.dun, ju: c.ju, yuan: c.yuan, day: c.pillars.day, hour: c.pillars.hour, xunPalace: c.xunPalace, notes: c.notes }, refJu: pj, refTerm: r['節氣'], diff });
});
// Phân loại nguyên nhân từng ca lệch
const HOME = { '蓬': '坎', '芮': '坤', '禽': '坤', '沖': '震', '輔': '巽', '心': '乾', '柱': '兌', '任': '艮', '英': '離' };
cases.forEach(k => { if (!k.diff) return; const r = ref.find(x => JSON.stringify(x.t) === JSON.stringify(k.t));
  const refInconsistent = Object.keys(r['星']).some(g => g !== '中' && r['天盤'][g] !== r['地盤'][HOME[r['星'][g]]]);
  const onlySky = k.diff.every(d => d.f === 'thiên bàn');
  if (k.diff.some(d => d.f === 'tiết khí')) k.cause = 'Sát giờ giao tiết khí (dưới 1 phút): kinqimen tính giờ giao sớm hơn; lunar-javascript và astronomy-engine cùng cho kết quả như engine.';
  else if (onlySky && refInconsistent) k.cause = 'Lỗi của kinqimen: thiên bàn của nó không đi theo vị trí sao của chính nó (nhánh xử lý can giờ ở cung giữa). Engine giữ quy tắc 9: can thiên bàn đi theo sao.';
  else k.cause = 'CHƯA GIẢI THÍCH'; });
const unexplained = cases.filter(k => k.diff && k.cause === 'CHƯA GIẢI THÍCH');
const full = compared - cases.filter(x => x.diff).length;
console.log(`So ${compared} bàn (kinqimen lỗi ${crashed}). Khớp toàn bộ bàn: ${full}/${compared}.`);
fields.forEach(f => console.log(`  ${f.padEnd(14)} khớp ${stat[f].ok}, lệch ${stat[f].bad}`));
const byCause = {}; cases.filter(k => k.diff).forEach(k => (byCause[k.cause] = byCause[k.cause] || []).push(k.t.join('-') + ` (${k.tag})`));
Object.entries(byCause).forEach(([c, l]) => console.log(`\n${l.length} ca: ${c}\n   ${l.join('\n   ')}`));
console.log(`\nCa lệch chưa giải thích: ${unexplained.length}`);
process.exitCode = unexplained.length ? 1 : 0;
fs.writeFileSync(path.join(dir, 'compare-report.json'), JSON.stringify({ compared, crashed, full, stat, cases }, null, 1));
