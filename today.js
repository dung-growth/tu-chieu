/* Tứ Chiếu — "Hôm nay của bạn": tính bằng công thức, không gọi AI.
   Bát tự: can chi của ngày so với nhật chủ (thập thần), xung hợp với trụ ngày và trụ năm sinh.
   Chiêm tinh: Mặt Trăng của ngày đi qua nhà nào, chạm sao gốc nào.
   Thần số: số ngày cá nhân. Lịch Việt: ngày và giờ hoàng đạo theo 12 thần (Thanh Long, Minh Đường…). */
const TODAY = (() => {
  const CAN = { '甲': 'Giáp', '乙': 'Ất', '丙': 'Bính', '丁': 'Đinh', '戊': 'Mậu', '己': 'Kỷ', '庚': 'Canh', '辛': 'Tân', '壬': 'Nhâm', '癸': 'Quý' };
  const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  const CHI_ZH = { '子': 'Tý', '丑': 'Sửu', '寅': 'Dần', '卯': 'Mão', '辰': 'Thìn', '巳': 'Tỵ', '午': 'Ngọ', '未': 'Mùi', '申': 'Thân', '酉': 'Dậu', '戌': 'Tuất', '亥': 'Hợi' };
  const THU = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

  // thập thần của ngày: chủ đề, nên, tránh
  const GOD = {
    'Tỷ Kiên': ['Ngày của bạn bè và người ngang hàng', ['Làm việc nhóm, gặp lại bạn cũ', 'Tự làm phần việc của mình cho tới nơi'], ['Tranh phần, so bì với đồng nghiệp', 'Cho vay mượn']],
    'Kiếp Tài': ['Ngày dễ hao tiền và dễ bị giành phần', ['Giữ chặt ví, làm việc một mình', 'Rà lại những khoản đang cho mượn'], ['Hùn hạp, cá cược, mua theo phong trào', 'Khoe kế hoạch khi chưa chắc']],
    'Thực Thần': ['Ngày thoải mái, hợp sáng tạo và tận hưởng', ['Viết, làm sản phẩm, nấu ăn, chơi', 'Nghỉ ngơi đúng nghĩa'], ['Ép mình vào khuôn quá chặt', 'Ăn uống quá đà']],
    'Thương Quan': ['Ngày nhiều ý tưởng nhưng dễ lỡ lời', ['Nghĩ ý mới, trình bày đề xuất', 'Ghi lại mọi ý trong đầu'], ['Cãi sếp, chê thẳng người khác', 'Gửi tin nhắn lúc đang bực']],
    'Chính Tài': ['Ngày hợp chuyện tiền chắc chắn', ['Thu nợ, chốt khoản thu, trả hóa đơn', 'Mua những thứ đã định mua từ trước'], ['Tiêu theo cảm hứng', 'Bỏ tiền vào chỗ chưa tìm hiểu']],
    'Thiên Tài': ['Ngày có cơ hội đến bất ngờ', ['Gặp người mới, thử một cách làm mới', 'Nhận lời mời ngoài kế hoạch nếu thấy hợp'], ['Liều tất tay', 'Hứa hẹn quá sức']],
    'Chính Quan': ['Ngày của trách nhiệm và giấy tờ', ['Ký giấy, làm thủ tục, gặp cấp trên', 'Giữ đúng giờ, đúng hẹn'], ['Làm ẩu, đi trễ', 'Lách luật dù là chuyện nhỏ']],
    'Thất Sát': ['Ngày áp lực, việc gấp dồn tới', ['Xử lý dứt điểm một việc khó', 'Quyết nhanh những chuyện đã cân nhắc đủ'], ['Đối đầu trực diện', 'Vội vàng khi lái xe, khi ký kết']],
    'Chính Ấn': ['Ngày được nâng đỡ, hợp học và nghỉ', ['Học, đọc, hỏi ý người đi trước', 'Chăm cho sức khỏe và giấc ngủ'], ['Ôm thêm việc mới', 'Bỏ bữa, thức khuya']],
    'Thiên Ấn': ['Ngày hướng vào trong, nhiều suy nghĩ', ['Việc cần tập trung một mình, nghiên cứu', 'Viết ra điều đang lăn tăn'], ['Quyết chuyện lớn khi còn phân vân', 'Ở một mình quá lâu rồi tự buồn']]
  };
  // Mặt Trăng đi qua nhà nào trong bản đồ sao gốc
  const HOUSE = ['', 'bản thân: ngoại hình, sức khỏe, cách bạn xuất hiện', 'tiền bạc và những thứ bạn sở hữu', 'tin nhắn, giấy tờ, đi lại gần, anh chị em',
    'nhà cửa và gia đình', 'vui chơi, tình cảm, chuyện sáng tạo', 'việc hằng ngày và sức khỏe', 'người yêu, vợ chồng, đối tác',
    'tiền chung, chuyện sâu kín, cảm xúc mạnh', 'học hỏi, đi xa, những điều mới lạ', 'công việc và hình ảnh trước người khác',
    'bạn bè, nhóm, những dự định xa', 'nghỉ ngơi, ở một mình, khép lại việc cũ'];
  // Mặt Trăng của ngày chạm sao gốc
  const ASP = [[0, 7, 'trùng'], [60, 4, 'thuận'], [90, 5, 'khó'], [120, 5, 'thuận'], [180, 6, 'khó']];
  const MOON_TO = {
    Sun: { 'trùng': 'Cảm xúc và ý muốn cùng một hướng, dễ làm điều mình thích', 'thuận': 'Tâm trạng dễ chịu, làm gì cũng xuôi', 'khó': 'Trong lòng muốn một đằng mà việc bắt làm một nẻo, dễ mệt hơn thường' },
    Moon: { 'trùng': 'Cảm xúc dâng cao, nhạy hơn thường ngày', 'thuận': 'Tâm trạng yên, dễ thấy thoải mái ở nhà', 'khó': 'Tâm trạng thất thường, dễ tủi thân vì chuyện nhỏ' },
    Venus: { 'trùng': 'Hợp gặp người thương, làm đẹp, mua món nhỏ cho mình', 'thuận': 'Dễ được người khác quý, hợp hẹn hò', 'khó': 'Dễ tiêu tiền theo cảm xúc, dễ hờn dỗi' },
    Mars: { 'trùng': 'Nhiều năng lượng nhưng dễ nóng, nói chậm lại một nhịp', 'thuận': 'Có sức, hợp vận động và làm việc tay chân', 'khó': 'Dễ cáu, cẩn thận lời nói và khi lái xe' }
  };
  const PDAY = ['', 'Số 1: hợp bắt đầu việc mới', 'Số 2: hợp hợp tác, kiên nhẫn chờ', 'Số 3: hợp nói chuyện, gặp gỡ, vui vẻ', 'Số 4: hợp làm việc chăm chỉ, sắp xếp lại',
    'Số 5: hợp thay đổi, đi lại', 'Số 6: hợp chăm lo gia đình, người thân', 'Số 7: hợp suy ngẫm, ở một mình', 'Số 8: hợp chuyện tiền và quyết định', 'Số 9: hợp khép lại, buông bớt'];
  // 12 thần hoàng đạo, hắc đạo
  const THAN = ['Thanh Long', 'Minh Đường', 'Thiên Hình', 'Chu Tước', 'Kim Quỹ', 'Bảo Quang', 'Bạch Hổ', 'Ngọc Đường', 'Thiên Lao', 'Huyền Vũ', 'Tư Mệnh', 'Câu Trần'];
  const HOANG = new Set(['Thanh Long', 'Minh Đường', 'Kim Quỹ', 'Bảo Quang', 'Ngọc Đường', 'Tư Mệnh']);
  const GIO = ['23–1h', '1–3h', '3–5h', '5–7h', '7–9h', '9–11h', '11–13h', '13–15h', '15–17h', '17–19h', '19–21h', '21–23h'];

  const dsum = n => String(n).split('').reduce((a, c) => a + +c, 0);
  const red = n => { while (n > 9) n = dsum(n); return n; };
  const angle = (a, b) => { const d = Math.abs(((a - b) % 360 + 360) % 360); return d > 180 ? 360 - d : d; };
  const houseOf = (lon, cusps) => { for (let k = 0; k < 12; k++) { const a = cusps[k].lon, z = cusps[(k + 1) % 12].lon, w = ((z - a) + 360) % 360, x = ((lon - a) + 360) % 360; if (x < w) return k + 1; } return 0; };

  function build(R, ymd) {
    const [y, m, d] = ymd.split('-').map(Number), b = R.bazi, i = R.input;
    const L = Solar.fromYmd(y, m, d).getLunar(), dg = CAN[L.getDayGan()], dz = CHI_ZH[L.getDayZhi()];
    const god = TC.tenGodOf(b.dayMaster, dg), G = GOD[god];
    const nen = [...G[1]], tranh = [...G[2]], notes = [];
    // xung, hợp với trụ ngày và trụ năm sinh
    const rel = TC.relations([{ label: 'hôm nay', can: dg, chi: dz }, { label: 'ngày sinh', can: b.pillars[2].can, chi: b.pillars[2].chi }, { label: 'năm sinh', can: b.pillars[0].can, chi: b.pillars[0].chi }])
      .filter(r => r.text.includes('hôm nay'));
    const has = (k, who) => rel.some(r => r.kind === k && r.text.includes(who));
    if (has('Lục xung', 'năm sinh')) { tranh.unshift('Việc lớn nên dời sang ngày khác (ngày xung tuổi)'); notes.push(`ngày ${dz} xung tuổi ${b.pillars[0].chi}`); }
    if (has('Lục xung', 'ngày sinh')) { tranh.push('Va chạm với người gần mình, nhất là người nhà'); notes.push(`xung trụ ngày sinh ${b.pillars[2].chi}`); }
    if (has('Lục hợp', 'năm sinh') || has('Lục hợp', 'ngày sinh')) { nen.push('Gặp gỡ, nhờ vả, kết nối'); notes.push('ngày hợp với tuổi'); }
    if (has('Lục hại', 'ngày sinh') || has('Lục hại', 'năm sinh')) { tranh.push('Tin lời hứa suông'); notes.push('ngày hại với tuổi'); }
    // hoàng đạo theo tháng âm và chi ngày
    const VN = typeof TVVN !== 'undefined' ? TVVN.s2l(d, m, y, 7) : null, lm = VN ? VN.month : Math.abs(L.getMonth());
    const start = [0, 2, 4, 6, 8, 10][(lm - 1) % 6], dIdx = CHI.indexOf(dz);
    const dayThan = THAN[(dIdx - start + 12) % 12], hoang = HOANG.has(dayThan);
    const hStart = [8, 10, 0, 2, 4, 6][dIdx % 6];
    const gio = CHI.map((c, k) => ({ chi: c, gio: GIO[k], than: THAN[(k - hStart + 12) % 12] })).filter(g => HOANG.has(g.than));
    const gioNgay = gio.filter(g => { const k = CHI.indexOf(g.chi); return k >= 3 && k <= 10; }); // 5h–21h
    // Mặt Trăng của ngày (giữa trưa giờ nơi sinh)
    let moon = null;
    if (typeof Astronomy !== 'undefined') {
      const t = new Date(Date.UTC(y, m - 1, d, 12) - (+i.tz || 7) * 3600e3), lon = Astronomy.EclipticGeoMoon(t).lon;
      const sign = TC.SIGNS[Math.floor(lon / 30)], house = i.timeMode !== 'unknown' && R.astro.cusps ? houseOf(lon, R.astro.cusps) : 0;
      const pts = Object.fromEntries(R.astro.points.map(p => [p.key, p]));
      const hits = [];
      ['Sun', 'Moon', 'Venus', 'Mars'].forEach(k => { const p = pts[k]; if (!p) return; const a = angle(lon, p.lon);
        const A = ASP.find(([deg, orb]) => Math.abs(a - deg) <= orb); if (A) hits.push({ k, kind: A[2], text: MOON_TO[k][A[2]], orb: Math.abs(a - A[0]) }); });
      hits.sort((a, z) => a.orb - z.orb);
      moon = { sign, house, houseTxt: house ? HOUSE[house] : '', hit: hits[0] || null };
      if (moon.hit && /dễ cáu|tiêu tiền theo cảm xúc/.test(moon.hit.text)) tranh.push(moon.hit.k === 'Mars' ? 'Nói nặng lời khi đang mệt' : 'Mua sắm lúc buồn');
    }
    // số ngày cá nhân
    const [, bm, bd] = i.date.split('-').map(Number);
    const pdN = red(red(red(dsum(bd) + dsum(bm) + dsum(y)) + m) + d);
    return { ymd, thu: THU[new Date(Date.UTC(y, m - 1, d)).getUTCDay()], d, m, y, gz: `${dg} ${dz}`, lunar: VN ? `${VN.day}/${VN.month}${VN.leap ? ' nhuận' : ''} âm` : '',
      god, theme: G[0], nen: [...new Set(nen)].slice(0, 3), tranh: [...new Set(tranh)].slice(0, 3), notes, dayThan, hoang, gio: gioNgay.slice(0, 3), gioAll: gio,
      moon, pday: { n: pdN, text: PDAY[pdN] } };
  }
  return { build };
})();
if (typeof module !== 'undefined') module.exports = TODAY;
