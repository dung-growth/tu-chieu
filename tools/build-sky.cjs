/* Tạo sky-data.js từ dữ liệu của d3-celestial (BSD-3-Clause, Olaf Frohn): sao sáng tới cấp 5,5, đường nối chòm sao phương Tây
   và phương Đông (tam viên, nhị thập bát tú), dải Ngân Hà. Làm tròn và rút gọn để file nhẹ.
   Dùng: node tools/build-sky.cjs <thư mục data của d3-celestial> */
const fs = require('fs'), path = require('path'), dir = process.argv[2];
const J = f => JSON.parse(fs.readFileSync(path.join(dir, f)));
const r1 = x => Math.round(x * 10) / 10;
const stars = J('stars.6.json').features.filter(f => f.properties.mag <= 5.5).map(f => [r1(f.geometry.coordinates[0]), r1(f.geometry.coordinates[1]), r1(f.properties.mag)]);
const lines = f => J(f).features.flatMap(x => x.geometry.coordinates.map(l => l.map(p => [r1(p[0]), r1(p[1])])));
const west = lines('constellations.lines.json'), east = lines('constellations.lines.cn.json');
// Ngân Hà: 5 mức sáng (ol1…ol5), lấy 1 điểm trên 3
const mw = J('mw.json').features.map(f => f.geometry.coordinates.flatMap(poly => poly.map(ring => ring.filter((_, i) => i % 3 === 0).map(p => [r1(p[0]), r1(p[1])])).filter(r => r.length > 3)));
const out = `/* Dữ liệu bầu trời, rút gọn từ d3-celestial (c) Olaf Frohn, BSD-3-Clause, https://github.com/ofrohn/d3-celestial. Sinh bởi tools/build-sky.cjs. */\nconst SKY = ${JSON.stringify({ stars, west, east, mw })};\nif (typeof module !== 'undefined') module.exports = SKY;\n`;
fs.writeFileSync(path.join(__dirname, '..', 'sky-data.js'), out);
console.log('sao', stars.length, 'đường Tây', west.length, 'đường Đông', east.length, 'Ngân Hà', mw.map(m => m.length).join('/'), 'kích thước', (out.length / 1024).toFixed(0) + ' KB');
