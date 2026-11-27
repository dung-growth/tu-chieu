/* Tứ Chiếu — thẻ kể chuyện: tầng 1 là trời lúc sinh (tính thật theo giờ và nơi sinh), tầng 2 là con người (chốn theo chất, dáng theo cung Mệnh). */
const STORY = (() => {
  const A = typeof Astronomy !== 'undefined' ? Astronomy : null;
  const THU = ['Chủ nhật', 'thứ Hai', 'thứ Ba', 'thứ Tư', 'thứ Năm', 'thứ Sáu', 'thứ Bảy'];
  const TIET = ['Xuân phân', 'Thanh minh', 'Cốc vũ', 'Lập hạ', 'Tiểu mãn', 'Mang chủng', 'Hạ chí', 'Tiểu thử', 'Đại thử', 'Lập thu', 'Xử thử', 'Bạch lộ',
    'Thu phân', 'Hàn lộ', 'Sương giáng', 'Lập đông', 'Tiểu tuyết', 'Đại tuyết', 'Đông chí', 'Tiểu hàn', 'Đại hàn', 'Lập xuân', 'Vũ thủy', 'Kinh trập'];
  const HUONG = az => ['bắc', 'đông bắc', 'đông', 'đông nam', 'nam', 'tây nam', 'tây', 'tây bắc'][Math.round(az / 45) % 8];
  const PLANET = { Venus: 'Sao Kim', Jupiter: 'Sao Mộc', Mars: 'Sao Hỏa', Saturn: 'Sao Thổ' };

  // ---- tầng 2: chốn theo chất, dáng theo nhóm sao ở cung Mệnh ----
  const CHON = {
    'Nước': { loc: 'ở bến sông', trait: 'Bạn nghĩ kỹ rồi mới nói, nhớ lâu những chuyện người khác đã quên, và cần một góc riêng để lấy lại sức.', nhu: 'Như nước ở bến sông: chảy chậm, nhưng chưa bao giờ dừng.' },
    'Lửa': { loc: 'trên đồi', trait: 'Bạn nghĩ là làm liền, nói thẳng điều mình thấy, giận nhanh mà quên cũng nhanh.', nhu: 'Như gió trên đồi: thổi thẳng, không vòng vo.' },
    'Kim': { loc: 'trên mái phố', trait: 'Bạn làm gì cũng có thứ tự, ghét sự cẩu thả, và là người mọi người tìm đến khi cần chốt việc.', nhu: 'Như dây điện trên mái phố: nhìn thì rối, mà sợi nào cũng đúng chỗ.' },
    'Đất': { loc: 'bên bờ ruộng', trait: 'Bạn làm chắc từng bước, đã hứa là giữ, và không thích bị hối.', nhu: 'Như lúa ngoài đồng: lớn chậm, mà tới mùa là có ăn.' },
    'Mộc': { loc: 'dưới gốc cây', trait: 'Bạn thích bắt đầu cái mới, hay giúp người, và khó ngồi yên một chỗ.', nhu: 'Như cây lớn đầu làng: cứ vươn lên, rồi tỏa bóng cho người khác ngồi.' }
  };
  const DANG = {
    ngoi: { verb: 'ngồi', stars: ['Thiên Cơ', 'Thái Âm', 'Thiên Đồng', 'Thiên Lương'], line: 'Riêng chuyện lớn, bạn lại cần thời gian một mình để ngẫm cho kỹ.' },
    di: { verb: 'đi', stars: ['Thất Sát', 'Phá Quân', 'Tham Lang', 'Liêm Trinh'], line: 'Riêng khi đã muốn đổi, bạn đổi tới cùng, không ngoái lại.' },
    dung: { verb: 'đứng', stars: ['Tử Vi', 'Thiên Phủ', 'Vũ Khúc', 'Thiên Tướng'], line: 'Riêng lúc người khác rối, bạn là người đứng ra giữ nhịp.' },
    den: { verb: 'cầm đèn', stars: ['Cự Môn', 'Thái Dương'], line: 'Riêng điều gì bạn thấy là đúng, bạn sẽ nói ra cho bằng được.' }
  };
  // tên thẻ: hiểu được ngay, không ẩn dụ (ẩn dụ chỉ nằm ở câu "như…")
  const TEN = {
    'Nước': { ngoi: 'Người lắng nghe', di: 'Người âm thầm|bứt phá', dung: 'Người đáng tin', den: 'Người dám nói', x: 'Người sâu lắng' },
    'Lửa': { ngoi: 'Người nhanh mà|biết dừng', di: 'Người làm liền', dung: 'Người đứng mũi|chịu sào', den: 'Người truyền lửa', x: 'Người bộc trực' },
    'Kim': { ngoi: 'Người cẩn trọng', di: 'Người quyết nhanh', dung: 'Người giữ nguyên tắc', den: 'Người nói thẳng', x: 'Người rạch ròi' },
    'Đất': { ngoi: 'Người kiên nhẫn', di: 'Người bền bỉ', dung: 'Người làm chỗ dựa', den: 'Người dẫn đường', x: 'Người vững vàng' },
    'Mộc': { ngoi: 'Người chăm sóc', di: 'Người tiên phong', dung: 'Người che chở', den: 'Người nhiều|ý tưởng', x: 'Người cởi mở' }
  };
  function dangOf(tv) {
    if (!tv) return null;
    const P = n => tv.palaces.find(p => p.name === n);
    let major = (P('Mệnh').major || []).map(s => s.name);
    if (!major.length) major = (P('Thiên Di') ? P('Thiên Di').major : []).map(s => s.name); // vô chính diệu: mượn sao cung đối diện
    for (const k in DANG) if (DANG[k].stars.includes(major[0])) return k;
    return null;
  }

  // ---- tầng 1: trời lúc sinh ----
  function sky(i) {
    if (!A) return null;
    const [y, mo, d] = i.date.split('-').map(Number), known = i.timeMode !== 'unknown';
    const [hh, mi] = (known ? i.time : '12:00').split(':').map(Number);
    const t = new Date(Date.UTC(y, mo - 1, d, hh, mi) - i.tz * 3600e3), ob = new A.Observer(+i.lat, +i.lon, 0);
    const hz = b => { const e = A.Equator(b, t, ob, true, true), h = A.Horizon(t, ob, e.ra, e.dec, 'normal'); return { alt: h.altitude, az: h.azimuth, ra: e.ra, dec: e.dec }; };
    const sun = hz('Sun'), moon = hz('Moon'), ph = A.MoonPhase(t), lit = A.Illumination('Moon', t).phase_fraction;
    const sep = (a, b) => A.AngleBetween(A.Equator(a, t, ob, true, true).vec, A.Equator(b, t, ob, true, true).vec);
    const rise = (b, dir, from) => { const r = A.SearchRiseSet(b, ob, dir, from, 1); return r ? (r.date - t) / 3600e3 : null; };
    const planets = Object.keys(PLANET).map(k => ({ k, name: PLANET[k], ...hz(k), mag: A.Illumination(k, t).mag, near: sep(k, 'Moon') }));
    return { t, known, sun, moon, ph, lit, planets, tiet: TIET[Math.floor(A.SunPosition(t).elon / 15) % 24],
      toRise: rise('Sun', +1, t), sinceSet: -rise('Sun', -1, new Date(t - 86400e3)) };
  }
  function moonName(ph) {
    if (ph < 12 || ph > 348) return 'trăng non';
    if (ph < 80) return 'trăng lưỡi liềm đầu tháng'; if (ph < 100) return 'trăng nửa vầng đầu tháng';
    if (ph < 168) return 'trăng gần rằm'; if (ph < 192) return 'trăng rằm tròn'; if (ph < 260) return 'trăng sau rằm';
    if (ph < 280) return 'trăng nửa vầng cuối tháng'; return 'trăng cuối tháng mảnh như lưỡi liềm';
  }
  const SO = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu'];
  const hrs = h => h < 1 ? 'chưa tới một tiếng' : (SO[Math.round(h)] || Math.round(h)) + ' tiếng';

  // ---- sự kiện đặc biệt: chỉ những gì tính được chắc chắn ----
  const SHOWER = [[1, 3, 'Mục Phu'], [4, 22, 'Thiên Cầm'], [5, 6, 'Bảo Bình'], [8, 12, 'Anh Tiên'], [10, 21, 'Lạp Hộ'], [11, 17, 'Sư Tử'], [12, 14, 'Song Tử']];
  const COMET = [['1986-02-01', '1986-04-30', 'Halley'], ['1996-03-15', '1996-04-20', 'Hyakutake'], ['1997-02-15', '1997-05-15', 'Hale-Bopp'], ['2020-07-05', '2020-07-31', 'NEOWISE']];
  const LE_AM = { '1-1': 'mùng Một Tết', '2-1': 'mùng Hai Tết', '3-1': 'mùng Ba Tết', '15-1': 'Rằm tháng Giêng', '10-3': 'Giỗ Tổ Hùng Vương', '15-4': 'lễ Phật đản',
    '5-5': 'Tết Đoan ngọ', '15-7': 'Rằm tháng Bảy', '15-8': 'Tết Trung thu', '23-12': 'ngày ông Công ông Táo' };
  const LE_DUONG = { '1-1': 'ngày đầu năm mới', '14-2': 'ngày Valentine', '8-3': 'ngày Quốc tế Phụ nữ', '1-6': 'ngày Quốc tế Thiếu nhi', '20-10': 'ngày Phụ nữ Việt Nam',
    '20-11': 'ngày Nhà giáo Việt Nam', '24-12': 'đêm Giáng sinh', '25-12': 'ngày Giáng sinh', '31-12': 'ngày cuối cùng của năm' };
  const NGAY = ms => new Date(ms).toISOString().slice(0, 10);
  function events(i, S) {
    const out = [], [y, mo, d] = i.date.split('-').map(Number), loc = ms => NGAY(ms + i.tz * 3600e3), day0 = Date.UTC(y, mo - 1, d) - i.tz * 3600e3;
    const diffDays = ms => Math.round((Date.parse(loc(ms)) - Date.UTC(y, mo - 1, d)) / 86400e3);
    const rel = n => n === 0 ? 'Đúng ngày hôm đó' : n < 0 ? `${-n === 1 ? 'Một' : SO[-n][0].toUpperCase() + SO[-n].slice(1)} hôm trước` : `${n === 1 ? 'Một' : SO[n][0].toUpperCase() + SO[n].slice(1)} hôm sau`;
    try { // nguyệt thực một phần hoặc toàn phần trong vòng ±5 ngày
      let e = A.SearchLunarEclipse(new Date(day0 - 6 * 86400e3));
      const n = diffDays(e.peak.date);
      if (Math.abs(n) <= 5 && e.kind !== 'penumbral') out.push([1, `${rel(n)} có một lần nguyệt thực ${e.kind === 'total' ? 'toàn phần' : 'một phần'}.`]);
    } catch (x) {}
    try { // nhật thực nhìn thấy được tại nơi sinh, trong vòng ±3 ngày
      const ob = new A.Observer(+i.lat, +i.lon, 0), e = A.SearchLocalSolarEclipse(new Date(day0 - 4 * 86400e3), ob), n = diffDays(e.peak.time.date);
      if (Math.abs(n) <= 3) out.push([1, `${rel(n)}, ở nơi bạn sinh có nhật thực ${e.kind === 'total' ? 'toàn phần' : e.kind === 'annular' ? 'hình khuyên' : 'một phần'}.`]);
    } catch (x) {}
    const c = COMET.find(([a, b]) => i.date >= a && i.date <= b);
    if (c) out.push([2, `Trên trời lúc đó đang có sao chổi ${c[2]}, nhìn được bằng mắt thường.`]);
    if (typeof TVVN !== 'undefined') { const L = TVVN.s2l(d, mo, y, 7);
      if (L && !L.leap) { const k = L.day + '-' + L.month, nx = TVVN.s2l(...(() => { const z = new Date(Date.UTC(y, mo - 1, d + 1)); return [z.getUTCDate(), z.getUTCMonth() + 1, z.getUTCFullYear()]; })(), 7);
        if (LE_AM[k]) out.push([3, `Hôm đó là ${LE_AM[k]}.`]); else if (L.month === 12 && nx && nx.day === 1 && nx.month === 1) out.push([3, 'Hôm đó là ngày Ba mươi Tết, giao thừa.']); } }
    try { const se = A.Seasons(y); const hit = [['mar_equinox', 'Xuân phân'], ['jun_solstice', 'Hạ chí'], ['sep_equinox', 'Thu phân'], ['dec_solstice', 'Đông chí']].find(([k]) => loc(se[k].date) === i.date);
      if (hit) out.push([4, `Hôm đó đúng ngày ${hit[1]}${hit[1] === 'Hạ chí' ? ', ngày dài nhất năm' : hit[1] === 'Đông chí' ? ', đêm dài nhất năm' : ''}${+i.lat < 0 && hit[1].endsWith('chí') ? ' ở bắc bán cầu' : ''}.`]); } catch (x) {}
    if (S && S.ph > 168 && S.ph < 192) { const km = A.GeoMoon(S.t).Length() * A.KM_PER_AU; if (km < 360000) out.push([5, 'Đó là một đêm siêu trăng, trăng tròn và gần Trái Đất hơn thường lệ.']); }
    const sh = SHOWER.find(([m, dd]) => m === mo && Math.abs(dd - d) <= 1);
    if (sh) out.push([6, `Đúng đợt mưa sao băng ${sh[2]}.`]);
    if (S) { const P = S.planets.filter(p => A.Elongation(p.k, S.t).elongation > 15);
      for (let a = 0; a < P.length; a++) for (let b = a + 1; b < P.length; b++) {
        const sep = A.AngleBetween(A.Equator(P[a].k, S.t, new A.Observer(+i.lat, +i.lon, 0), true, true).vec, A.Equator(P[b].k, S.t, new A.Observer(+i.lat, +i.lon, 0), true, true).vec);
        if (sep < 2) { out.push([7, `${P[a].name} và ${P[b].name} đứng sát nhau trên trời.`]); a = b = 9; } } }
    const ld = LE_DUONG[d + '-' + mo]; if (ld) out.push([8, `Hôm đó là ${ld}.`]);
    if (d === 29 && mo === 2) out.push([8, 'Bạn sinh vào ngày 29 tháng 2, bốn năm mới có một lần.']);
    if (d === mo && (y % 100 === d || y % 100 === d * 11)) out.push([9, `Ngày, tháng, năm sinh cùng là số ${d}.`]);
    return out.sort((a, b) => a[0] - b[0]).slice(0, 2).map(x => x[1]);
  }

  function tell(i) {
    const S = sky(i); if (!S) return '';
    const hh = +(i.time || '12:00').split(':')[0];
    const [y, mo, d] = i.date.split('-').map(Number), wd = THU[new Date(Date.UTC(y, mo - 1, d)).getUTCDay()];
    const out = [];
    const sa = S.sun.alt;
    let when;
    if (!S.known) when = `${wd[0].toUpperCase() + wd.slice(1)}, ${d} tháng ${mo} năm ${y}, ở ${i.place}.`;
    else {
      const part = sa < -6 ? (S.toRise != null && S.toRise < 4 ? 'Rạng sáng' : S.sinceSet < 4 ? 'Tối' : 'Đêm') : sa < 0 ? (S.toRise != null && S.toRise < 2 ? 'Rạng sáng' : 'Chập tối') : (hh < 11 ? 'Sáng' : hh < 14 ? 'Trưa' : 'Chiều');
      when = `${part} ${wd}, ${d} tháng ${mo} năm ${y}, ở ${i.place}.`;
    }
    out.push(when);
    if (S.known) {
      if (sa < -6) out.push(S.toRise != null && S.toRise < 4 ? `Còn ${hrs(S.toRise)} nữa trời mới sáng.` : S.sinceSet < 3 ? `Trời tối được ${hrs(S.sinceSet)}.` : 'Đang giữa đêm.');
      else if (sa < 0) out.push(S.toRise != null && S.toRise < 2 ? 'Trời vừa hửng, mặt trời chưa lên.' : 'Mặt trời vừa lặn, trời còn ửng.');
      else out.push(sa > 70 ? 'Mặt trời đứng gần đỉnh đầu.' : sa > 40 && Math.abs(S.sun.az - 180) < 30 ? 'Mặt trời đứng cao ở phía nam.' : sa > 40 && (S.sun.az < 30 || S.sun.az > 330) ? 'Mặt trời đứng cao ở phía bắc.' : S.sun.az < 180 ? `Mặt trời đang lên ở phía ${HUONG(S.sun.az)}.` : sa < 15 ? `Mặt trời sắp lặn ở phía ${HUONG(S.sun.az)}.` : `Mặt trời đã ngả về phía ${HUONG(S.sun.az)}.`);
      // trăng
      const mn = moonName(S.ph), dark = sa < -6;
      if (mn === 'trăng non') out.push(dark ? 'Đêm đó trăng non, trời không có trăng.' : 'Hôm đó là ngày trăng non.');
      else if (S.moon.alt > 0) {
        const where = S.moon.alt > 70 ? 'gần đỉnh đầu' : S.moon.alt < 20 ? (S.moon.az < 180 ? `vừa lên ở phía ${HUONG(S.moon.az)}` : `sắp lặn ở phía ${HUONG(S.moon.az)}`) : `đứng ở phía ${HUONG(S.moon.az)}`;
        out.push(dark ? `${mn[0].toUpperCase() + mn.slice(1)} ${where}.` : `${mn[0].toUpperCase() + mn.slice(1)} mờ giữa trời ban ngày, ${where}.`);
      } else if (dark) out.push(`Đêm đó ${mn}, nhưng lúc bạn sinh trăng ${S.moon.az < 180 ? 'chưa lên' : 'đã lặn'}.`);
      // hành tinh sáng, chỉ khi trời tối
      if (sa < -6) {
        const vis = S.planets.filter(p => p.alt > 5).sort((a, b) => a.mag - b.mag);
        const near = vis.find(p => p.near < 10 && S.moon.alt > 0);
        if (near) out.push(`Sát bên trăng là ${near.name}.`);
        const v = vis.find(p => p !== near);
        if (v) out.push(v.k === 'Venus' ? (v.az < 180 ? 'Sao Mai sáng rực ở phía đông.' : 'Sao Hôm sáng rực ở phía tây.') : v.alt > 60 ? `${v.name} sáng lặng gần đỉnh đầu.` : `${v.name} sáng ở phía ${HUONG(v.az)}.`);
      }
    } else out.push(`Đó là những ngày ${moonName(S.ph).replace(' mảnh như lưỡi liềm', '')}.`);
    const E = events(i, S.known ? S : { ...S, planets: [] }); E.forEach(e => out.push(e));
    out.push((+i.tz === 7 && !E.some(e => e.includes(S.tiet)) ? `Đang tiết ${S.tiet}. ` : '') + (S.known ? 'Bạn ra đời trong khoảng trời ấy.' : 'Bạn ra đời vào một lúc nào đó của ngày hôm ấy.'));
    return out.join(' ');
  }

  function build(R, K) {
    const i = R.input, el = (K && K.main) || (K && K.votes[0] && K.votes[0].el) || 'Nước';
    const C = CHON[el] || CHON['Nước'], dk = dangOf(R.tuvi), D = dk && DANG[dk];
    const raw = (TEN[el] || TEN['Nước'])[dk || 'x'], title = raw.replace('|', ' '), lines = raw.split('|');
    return { title, lines, sil: `assets/bong/${{ 'Nước': 'nuoc', 'Lửa': 'lua', 'Kim': 'kim', 'Đất': 'dat', 'Mộc': 'moc' }[el] || 'nuoc'}-${dk || 'dung'}.webp`, story: tell(i), trait: C.trait + (D ? ' ' + D.line : ''), nhu: C.nhu, chon: el, dang: dk };
  }
  return { build, tell, sky, CHON, DANG };
})();
if (typeof module !== 'undefined') module.exports = STORY;
