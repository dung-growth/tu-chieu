/* Tứ Chiếu — Kinh Dịch, gieo quẻ theo Mai Hoa Dịch Số (lập quẻ theo năm, tháng, ngày, giờ âm lịch).
   Cần global Solar (lunar-javascript). */
const ICHING = (() => {
  // Bát quái theo số Tiên thiên. lines: hào từ dưới lên, 1 = dương, 0 = âm
  const TRI = {
    1: { name: 'Càn',  image: 'Thiên', symbol: '☰', hanh: 'Kim',  lines: [1,1,1], meaning: 'Trời, sức mạnh, chủ động' },
    2: { name: 'Đoài', image: 'Trạch', symbol: '☱', hanh: 'Kim',  lines: [1,1,0], meaning: 'Đầm, niềm vui, lời nói' },
    3: { name: 'Ly',   image: 'Hỏa',   symbol: '☲', hanh: 'Hỏa',  lines: [1,0,1], meaning: 'Lửa, sáng rõ, nương tựa' },
    4: { name: 'Chấn', image: 'Lôi',   symbol: '☳', hanh: 'Mộc',  lines: [1,0,0], meaning: 'Sấm, khởi động, chấn động' },
    5: { name: 'Tốn',  image: 'Phong', symbol: '☴', hanh: 'Mộc',  lines: [0,1,1], meaning: 'Gió, thâm nhập, mềm mỏng' },
    6: { name: 'Khảm', image: 'Thủy',  symbol: '☵', hanh: 'Thủy', lines: [0,1,0], meaning: 'Nước, hiểm trở, chiều sâu' },
    7: { name: 'Cấn',  image: 'Sơn',   symbol: '☶', hanh: 'Thổ',  lines: [0,0,1], meaning: 'Núi, dừng lại, vững chãi' },
    8: { name: 'Khôn', image: 'Địa',   symbol: '☷', hanh: 'Thổ',  lines: [0,0,0], meaning: 'Đất, nhu thuận, nâng đỡ' }
  };
  const triByLines = l => +Object.keys(TRI).find(k => TRI[k].lines.join('') === l.join(''));

  // Số quẻ theo thứ tự Văn Vương: KW[quẻ trên][quẻ dưới], theo số Tiên thiên 1..8
  const ORDER = [1, 4, 6, 7, 8, 5, 3, 2]; // Càn, Chấn, Khảm, Cấn, Khôn, Tốn, Ly, Đoài
  const TABLE = [
    [1, 25, 6, 33, 12, 44, 13, 10],
    [34, 51, 40, 62, 16, 32, 55, 54],
    [5, 3, 29, 39, 8, 48, 63, 60],
    [26, 27, 4, 52, 23, 18, 22, 41],
    [11, 24, 7, 15, 2, 46, 36, 19],
    [9, 42, 59, 53, 20, 57, 37, 61],
    [14, 21, 64, 56, 35, 50, 30, 38],
    [43, 17, 47, 31, 45, 28, 49, 58]
  ];
  const kw = (up, lo) => TABLE[ORDER.indexOf(up)][ORDER.indexOf(lo)];

  const NAMES = ['', 'Càn', 'Khôn', 'Truân', 'Mông', 'Nhu', 'Tụng', 'Sư', 'Tỷ', 'Tiểu Súc', 'Lý', 'Thái', 'Bĩ', 'Đồng Nhân', 'Đại Hữu', 'Khiêm', 'Dự',
    'Tùy', 'Cổ', 'Lâm', 'Quan', 'Phệ Hạp', 'Bí', 'Bác', 'Phục', 'Vô Vọng', 'Đại Súc', 'Di', 'Đại Quá', 'Khảm', 'Ly', 'Hàm', 'Hằng',
    'Độn', 'Đại Tráng', 'Tấn', 'Minh Di', 'Gia Nhân', 'Khuê', 'Kiển', 'Giải', 'Tổn', 'Ích', 'Quải', 'Cấu', 'Tụy', 'Thăng', 'Khốn', 'Tỉnh',
    'Cách', 'Đỉnh', 'Chấn', 'Cấn', 'Tiệm', 'Quy Muội', 'Phong', 'Lữ', 'Tốn', 'Đoài', 'Hoán', 'Tiết', 'Trung Phu', 'Tiểu Quá', 'Ký Tế', 'Vị Tế'];
  const KEYS = ['', 'Sáng tạo, mạnh mẽ', 'Nhu thuận, nâng đỡ', 'Khởi đầu gian nan', 'Non nớt, cần học hỏi', 'Chờ đợi đúng thời', 'Tranh chấp', 'Tổ chức, kỷ luật', 'Gắn kết, hợp quần',
    'Tích nhỏ, kiềm chế', 'Bước đi cẩn trọng', 'Thông suốt, hanh thông', 'Bế tắc', 'Đồng lòng', 'Sở hữu lớn', 'Khiêm tốn', 'Hứng khởi, chuẩn bị',
    'Thuận theo', 'Sửa cái đã hỏng', 'Đến gần, tiến tới', 'Quan sát', 'Cắn đứt trở ngại', 'Vẻ ngoài, trang sức', 'Bào mòn, suy giảm', 'Trở lại, phục hồi',
    'Chân thật, không vọng động', 'Tích lớn, nuôi dưỡng', 'Nuôi dưỡng, giữ lời ăn tiếng nói', 'Quá tải', 'Hiểm trở chồng chất', 'Sáng rõ, nương tựa', 'Cảm ứng', 'Bền lâu',
    'Lui ẩn', 'Sức mạnh lớn', 'Tiến lên', 'Ánh sáng bị che', 'Gia đình, nề nếp', 'Bất đồng', 'Trở ngại', 'Giải tỏa',
    'Bớt đi', 'Thêm vào, lợi ích', 'Quyết đoán', 'Gặp gỡ bất ngờ', 'Tụ họp', 'Đi lên dần', 'Khốn khó', 'Nguồn nuôi bền',
    'Thay đổi lớn', 'Đổi mới, thành hình', 'Chấn động', 'Dừng lại', 'Tiến từ từ', 'Chưa đúng vị trí', 'Thịnh lớn', 'Xa nhà, lữ khách',
    'Thâm nhập, mềm mỏng', 'Vui vẻ, trao đổi', 'Tan tỏa', 'Tiết chế', 'Thành tín', 'Hơi quá, việc nhỏ', 'Đã xong', 'Chưa xong'];

  function hexOf(lines) {
    const lo = triByLines(lines.slice(0, 3)), up = triByLines(lines.slice(3, 6));
    const n = kw(up, lo);
    const full = up === lo ? `Thuần ${TRI[up].name}` : `${TRI[up].image} ${TRI[lo].image} ${NAMES[n]}`;
    return { n, name: NAMES[n], fullName: full, key: KEYS[n], upper: up, lower: lo, lines };
  }

  // Ngũ hành: A so với B
  const SINH = { 'Mộc': 'Hỏa', 'Hỏa': 'Thổ', 'Thổ': 'Kim', 'Kim': 'Thủy', 'Thủy': 'Mộc' };
  const KHAC = { 'Mộc': 'Thổ', 'Thổ': 'Thủy', 'Thủy': 'Hỏa', 'Hỏa': 'Kim', 'Kim': 'Mộc' };
  function theDung(the, dung) {
    if (the === dung) return { rel: 'Tỷ hòa', note: 'Thể và Dụng cùng hành: thuận, hai bên đồng lòng.' };
    if (SINH[dung] === the) return { rel: 'Dụng sinh Thể', note: 'Việc nuôi người hỏi: sách xếp vào loại tốt nhất.' };
    if (KHAC[the] === dung) return { rel: 'Thể khắc Dụng', note: 'Người hỏi chế ngự được việc: có thể thành nhưng tốn sức.' };
    if (SINH[the] === dung) return { rel: 'Thể sinh Dụng', note: 'Người hỏi phải bỏ sức cho việc: dễ hao tổn.' };
    return { rel: 'Dụng khắc Thể', note: 'Việc đè lên người hỏi: nhiều trở ngại, nên thận trọng.' };
  }
  function relTo(a, b) { // quan hệ của hành a đối với hành b
    if (a === b) return 'cùng hành';
    if (SINH[a] === b) return `${a} sinh ${b}`;
    if (SINH[b] === a) return `${b} sinh ${a}`;
    if (KHAC[a] === b) return `${a} khắc ${b}`;
    return `${b} khắc ${a}`;
  }

  const ZHI = '子丑寅卯辰巳午未申酉戌亥';
  const CHI_VI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  const mod = (x, m) => (x % m) || m;

  // Lập quẻ theo thời điểm (giờ địa phương của người hỏi)
  function cast(date = new Date()) {
    const l = Solar.fromYmdHms(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), 0).getLunar();
    const yi = ZHI.indexOf(l.getYearZhi()) + 1, hi = ZHI.indexOf(l.getTimeZhi()) + 1;
    const m = Math.abs(l.getMonth()), d = l.getDay();
    const base = yi + m + d, total = base + hi;
    const up = mod(base, 8), lo = mod(total, 8), dong = mod(total, 6);
    const lines = [...TRI[lo].lines, ...TRI[up].lines];
    const main = hexOf(lines);
    const changed = hexOf(lines.map((v, i) => i === dong - 1 ? 1 - v : v));
    const nuclear = hexOf([lines[1], lines[2], lines[3], lines[2], lines[3], lines[4]]);
    const dungTri = dong <= 3 ? lo : up, theTri = dong <= 3 ? up : lo;
    const td = theDung(TRI[theTri].hanh, TRI[dungTri].hanh);
    return {
      at: date.toISOString(),
      lunar: { yearChi: CHI_VI[yi - 1], month: m, leap: l.getMonth() < 0, day: d, hourChi: CHI_VI[hi - 1] },
      calc: { yi, m, d, hi, base, total, up, lo, dong },
      main, changed, nuclear, dong,
      the: { tri: theTri, ...TRI[theTri] }, dung: { tri: dungTri, ...TRI[dungTri] }, theDung: td
    };
  }

  // Tóm tắt gửi cho AI
  function brief(q, dayMasterHanh) {
    const c = q.calc, T = TRI;
    const L = [
      `Lập quẻ theo Mai Hoa Dịch Số (năm ${q.lunar.yearChi}=${c.yi}, tháng ${c.m}${q.lunar.leap ? ' nhuận' : ''}, ngày ${c.d}, giờ ${q.lunar.hourChi}=${c.hi}).`,
      `Quẻ chủ: ${q.main.fullName} (quẻ số ${q.main.n}; trên ${T[q.main.upper].name}, dưới ${T[q.main.lower].name}). Ý chính: ${q.main.key}.`,
      `Hào động: hào ${q.dong}.`,
      `Quẻ hỗ: ${q.nuclear.fullName} (số ${q.nuclear.n}), ý: ${q.nuclear.key}.`,
      `Quẻ biến: ${q.changed.fullName} (số ${q.changed.n}), ý: ${q.changed.key}.`,
      `Thể (người hỏi): quẻ ${q.the.name}, hành ${q.the.hanh}. Dụng (việc được hỏi): quẻ ${q.dung.name}, hành ${q.dung.hanh}. Quan hệ: ${q.theDung.rel}.`
    ];
    if (dayMasterHanh) L.push(`Phần ghép hiện đại: Nhật chủ bát tự hành ${dayMasterHanh}; so với Thể (${q.the.hanh}): ${relTo(q.the.hanh, dayMasterHanh)}.`);
    return L.join('\n');
  }

  return { cast, brief, TRI, hexOf };
})();
if (typeof module !== 'undefined') module.exports = ICHING;
