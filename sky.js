/* Tứ Chiếu — vẽ bầu trời thật lúc sinh, tại nơi sinh (dùng SKY từ sky-data.js, Astronomy từ astronomy-engine).
   Chiếu nổi (stereographic) với thiên đỉnh ở giữa, đường chân trời là vòng ngoài, phương Bắc ở trên, phương Đông bên trái (như khi ngửa mặt nhìn trời).
   Mọi thứ vẽ bằng một màu mực theo biến CSS của trang, nên ở chế độ sáng hay tối đều liền tông với giao diện. */
const SKYV = (() => {
  const D = Math.PI / 180;
  // xích kinh, xích vĩ (độ) -> độ cao, phương vị (độ) cho người quan sát ở vĩ độ lat, giờ sao địa phương lst (độ)
  function altaz(ra, dec, lat, lst) {
    const H = (lst - ra) * D, d = dec * D, p = lat * D;
    const alt = Math.asin(Math.sin(p) * Math.sin(d) + Math.cos(p) * Math.cos(d) * Math.cos(H));
    const az = Math.atan2(-Math.cos(d) * Math.sin(H), Math.sin(d) * Math.cos(p) - Math.cos(d) * Math.sin(p) * Math.cos(H));
    return [alt / D, az / D];
  }
  // hoàng đạo -> xích đạo (vĩ độ hoàng đạo coi như 0 với Mặt Trời; Mặt Trăng lệch tối đa 5°, đủ cho hình minh họa)
  function ecl2eq(lon, eps = 23.44) {
    const l = lon * D, e = eps * D;
    return [((Math.atan2(Math.sin(l) * Math.cos(e), Math.cos(l)) / D) + 360) % 360, Math.asin(Math.sin(e) * Math.sin(l)) / D];
  }
  function svg(o) {
    const { date, lat, lon, size = 320, mode = 'west', sun, moon, label, maxMag = 4.8 } = o;
    const R = size / 2 - 2, C = size / 2;
    const lst = ((Astronomy.SiderealTime(date) * 15 + lon) % 360 + 360) % 360;
    const proj = (ra, dec) => { const [alt, az] = altaz(ra, dec, lat, lst), a = Math.max(alt, -40);
      const r = R * Math.tan((90 - a) * D / 2); return [C - r * Math.sin(az * D), C - r * Math.cos(az * D), alt]; };
    const f = n => n.toFixed(1);
    const path = pts => pts.map((p, i) => { const [x, y] = proj(p[0], p[1]); return (i ? 'L' : 'M') + f(x) + ' ' + f(y); }).join('');
    const id = 'sk' + Math.random().toString(36).slice(2, 7);
    let g = `<svg viewBox="0 0 ${size} ${size}" class="sky" role="img" aria-label="${label || 'Bầu trời lúc sinh'}"><defs><clipPath id="${id}"><circle cx="${C}" cy="${C}" r="${R}"/></clipPath>
      <filter id="${id}b" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${(size / 90).toFixed(1)}"/></filter>
      <radialGradient id="${id}g"><stop offset="0" class="sky-glow0"/><stop offset="1" class="sky-glow1"/></radialGradient></defs>`;
    g += `<circle cx="${C}" cy="${C}" r="${R}" class="sky-bg"/><g clip-path="url(#${id})">`;
    // Ngân Hà: 5 lớp, lớp sau sáng hơn
    g += `<g filter="url(#${id}b)">`; SKY.mw.forEach((polys, lv) => { g += `<path class="sky-mw" style="opacity:${(0.06 + lv * 0.05).toFixed(3)}" d="${polys.map(r => path(r) + 'Z').join('')}"/>`; }); g += '</g>';
    // vòng độ cao 30°, 60° và đường kinh tuyến chính
    [30, 60].forEach(a => { const r = R * Math.tan((90 - a) * D / 2); g += `<circle cx="${C}" cy="${C}" r="${f(r)}" class="sky-grid"/>`; });
    // đường nối chòm sao
    g += `<path class="sky-ln" d="${(mode === 'east' ? SKY.east : SKY.west).map(path).join('')}"/>`;
    // sao: to nhỏ theo cấp sáng
    let st = '';
    let glow = '';
    SKY.stars.forEach(([ra, dec, m]) => { if (m > maxMag) return; const [x, y, alt] = proj(ra, dec); if (alt < -1) return; const k = size / 400, rr = Math.max(0.45, 2.4 - m * 0.4) * k;
      st += `<circle cx="${f(x)}" cy="${f(y)}" r="${rr.toFixed(2)}"/>`; if (m < 1.6) glow += `<circle cx="${f(x)}" cy="${f(y)}" r="${(rr * 4.5).toFixed(1)}" fill="url(#${id}g)"/>`; });
    g += glow + `<g class="sky-st">${st}</g>`;
    // Mặt Trời, Mặt Trăng nếu ở trên chân trời
    const mark = (lon, cls, r) => { if (lon == null) return ''; const [ra, dec] = ecl2eq(lon), [x, y, alt] = proj(ra, dec); return alt < 0 ? '' : `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" class="${cls}"/>`; };
    g += mark(sun, 'sky-sun', 7) + mark(moon, 'sky-moon', 5.5);
    g += `</g><circle cx="${C}" cy="${C}" r="${R}" class="sky-rim"/>`;
    for (let a = 0; a < 360; a += 5) { const L = a % 45 === 0 ? 7 : a % 15 === 0 ? 4 : 2, x1 = C + R * Math.sin(a * D), y1 = C - R * Math.cos(a * D), x2 = C + (R - L) * Math.sin(a * D), y2 = C - (R - L) * Math.cos(a * D);
      g += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" class="sky-tick"/>`; }
    // bốn hướng
    const t = (x, y, s) => `<text x="${x}" y="${y}" class="sky-dir">${s}</text>`;
    if (o.dirs !== false) g += t(C, 20, 'B') + t(C, size - 13, 'N') + t(17, C + 4, 'Đ') + t(size - 17, C + 4, 'T');
    return g + '</svg>';
  }
  return { svg, altaz, ecl2eq };
})();
if (typeof module !== 'undefined') module.exports = SKYV;
