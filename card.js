/* Tứ Chiếu — thẻ đầu Tổng quan: ba môn Bát tự, Tử vi, Chiêm tinh mỗi môn cho một "chất" (Nước, Lửa, Đất, Kim, Mộc, Khí),
   so xem môn nào đồng ý, môn nào nói khác. Thần số học không có ngũ hành nên đứng ngoài phần so.
   Câu chữ viết tay, tả hành vi nhìn thấy được, không dùng văn hoa. */
const CARD = (() => {
  const HANH = { 'Thủy': 'Nước', 'Hỏa': 'Lửa', 'Thổ': 'Đất', 'Kim': 'Kim', 'Mộc': 'Mộc' };
  // câu tả hành vi khi một chất là chính
  const DO = {
    'Nước': 'Hay nghĩ kỹ, nhớ lâu, cần chỗ riêng để hồi sức.',
    'Lửa': 'Nóng nhanh nguội nhanh, nói thẳng, thích làm ngay.',
    'Đất': 'Làm chắc từng bước, giữ lời, không thích bị hối.',
    'Kim': 'Rạch ròi đúng sai, nói ít mà chốt nhanh, ghét làm ẩu.',
    'Mộc': 'Thích bắt đầu cái mới, hay giúp người, khó ngồi yên một chỗ.',
    'Khí': 'Nghĩ nhanh, nói nhiều, cần có người để trao đổi ý.'
  };
  // cụm ngắn khi một môn nói khác
  const SHORT = { 'Nước': 'trầm và kín', 'Lửa': 'nóng và bộc trực', 'Đất': 'chậm và chắc', 'Kim': 'cứng và rạch ròi', 'Mộc': 'hăng và dễ đổi ý', 'Khí': 'nhanh và hay nói' };
  // màu tia sáng (sáng trên nền trời) và màu vạch chú thích (đậm trên nền giấy)
  const RAY = { 'Nước': '#bfe9ee', 'Lửa': '#f6b49a', 'Đất': '#ecd29a', 'Kim': '#e4e0d8', 'Mộc': '#bfe6c8', 'Khí': '#cfdaf3' };
  const INK = { 'Nước': '#2E8C9A', 'Lửa': '#D9603A', 'Đất': '#B7862F', 'Kim': '#8A847E', 'Mộc': '#3E8E5A', 'Khí': '#5B7DB8' };

  // pha Mặt Trăng theo ngày âm: tên và hình (phần sáng)
  function moon(day, R = 18) {
    const p = (day - 1) / 29.53, c = Math.cos(2 * Math.PI * p), rx = (R * Math.abs(c)).toFixed(2), right = p < 0.5;
    const outer = right ? 1 : 0, inner = right ? (c > 0 ? 0 : 1) : (c > 0 ? 1 : 0);
    const name = day <= 1 ? 'Trăng non' : day <= 6 ? 'Trăng lưỡi liềm đầu tháng' : day <= 9 ? 'Trăng thượng huyền' : day <= 14 ? 'Trăng gần rằm'
      : day <= 16 ? 'Trăng tròn' : day <= 21 ? 'Trăng sau rằm' : day <= 24 ? 'Trăng hạ huyền' : 'Trăng khuyết cuối tháng';
    return { name, path: `M0 ${-R}A${R} ${R} 0 0 ${outer} 0 ${R}A${rx} ${R} 0 0 ${inner} 0 ${-R}Z`, dark: day <= 1 };
  }
  // màu trời theo giờ sinh
  function sky(h) {
    if (h >= 5 && h < 7) return { name: 'trời rạng sáng', g: ['#1b2450', '#5b5a8a', '#c98a7a'] };
    if (h >= 7 && h < 11) return { name: 'buổi sáng', g: ['#24477a', '#4f7fae', '#9cbad1'] };
    if (h >= 11 && h < 15) return { name: 'giữa trưa', g: ['#2a5584', '#5a8fbf', '#c2b48a'] };
    if (h >= 15 && h < 18) return { name: 'buổi chiều', g: ['#2c3f74', '#7a6a98', '#d58f63'] };
    if (h >= 18 && h < 20) return { name: 'chạng vạng', g: ['#1a1f45', '#5a3f70', '#c26a55'] };
    if (h >= 3 && h < 5) return { name: 'trời sắp rạng', g: ['#0d1229', '#18204a', '#5a4b72'] };
    return { name: 'giữa đêm', g: ['#0a0e22', '#121a3d', '#2a2f5c'] };
  }

  function build(R) {
    const b = R.bazi, sun = R.astro.points[0], i = R.input;
    const yearNapAm = (b.pillars[0] && b.pillars[0].napAm) || '';
    const votes = [
      { k: 'bz', sys: 'Bát tự', detail: `${b.dayMaster} ${b.dayMasterHanh}`, el: HANH[b.dayMasterHanh] },
      { k: 'as', sys: 'Chiêm tinh', detail: `${sun.sign}, cung ${TC.SIGN_EL[sun.signIdx]}`, el: TC.SIGN_EL[sun.signIdx] },
      { k: 'tv', sys: 'Tử vi', detail: `bản mệnh ${yearNapAm}`, el: HANH[yearNapAm.split(' ').pop()] }
    ].filter(v => v.el);
    const tally = {}; votes.forEach(v => tally[v.el] = (tally[v.el] || 0) + 1);
    const top = Object.entries(tally).sort((a, z) => z[1] - a[1]);
    const main = top[0][1] >= 2 ? top[0][0] : null;
    votes.forEach(v => v.agree = main ? v.el === main : false);
    const others = votes.filter(v => main && v.el !== main);
    let title, body;
    if (main && !others.length) { title = `${main} cả ba phía`; body = `${DO[main]} Bát tự, Tử vi và Chiêm tinh cùng nói vậy.`; }
    else if (main) { const o = others[0]; title = `${main} là chính, có chút ${o.el}`;
      body = `${DO[main]} Riêng ${o.sys} (${o.detail}) thấy bạn ${SHORT[o.el]} hơn vậy.`; }
    else { title = `Pha trộn ${votes.map(v => v.el).join(', ')}`;
      body = votes.map(v => `${v.sys} thấy bạn ${SHORT[v.el]}`).join(', ') + '. Ba phía mỗi bên một ý, nên đọc kỹ từng môn.'; }
    const n = R.numerology, [y, mo, d] = i.date.split('-').map(Number), [hh] = (i.time || '12:00').split(':').map(Number);
    const L = typeof TVVN !== 'undefined' ? TVVN.s2l(d, mo, y, 7) : null, M = L ? moon(L.day) : null, S = sky(i.timeMode === 'unknown' ? 12 : hh);
    return { title, body, main, votes, num: n.lifePath, moon: M, lunarDay: L && L.day, sky: S, timeKnown: i.timeMode !== 'unknown', RAY, INK };
  }
  // màu và hướng hợp: lấy hành Bát tự cần (Thân vượng cần tiết, khắc; Thân nhược cần sinh, trợ); trung hòa thì lấy hành đang thiếu nhất
  const LUCK = {
    'Mộc': { c: [['xanh lá', '#4E9A62']], dir: 'Đông' },
    'Hỏa': { c: [['đỏ', '#C8473A'], ['cam', '#E0803F']], dir: 'Nam' },
    'Thổ': { c: [['vàng đất', '#C9A24E'], ['nâu', '#8A6A48']], dir: 'Đông Bắc, Tây Nam' },
    'Kim': { c: [['trắng', '#F2EFE8'], ['bạc', '#B9BCC2']], dir: 'Tây' },
    'Thủy': { c: [['xanh biển', '#2F6FA8'], ['đen', '#1E1F26']], dir: 'Bắc' }
  };
  function luck(R) {
    const st = R.bazi.strength;
    let els = st.help.slice(0, 2), why;
    if (els.length) why = `Bát tự ${st.level.toLowerCase()}, cần thêm ${els.map(e => HANH[e]).join(' và ')}`;
    else { const low = Object.entries(st.score).sort((a, z) => a[1] - z[1])[0][0]; els = [low]; why = `Bát tự trung hòa, bù hành đang thiếu nhất là ${HANH[low]}`; }
    const colors = els.length > 1 ? els.map(e => LUCK[e].c[0]) : LUCK[els[0]].c;
    return { els: els.map(e => HANH[e]), colors, dirs: [...new Set(els.map(e => LUCK[e].dir))].join(', '), why };
  }
  return { build, moon, sky, luck, DO, SHORT, HANH };
})();
if (typeof module !== 'undefined') module.exports = CARD;
