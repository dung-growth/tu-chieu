/* Tứ Chiếu — đọc sâu lá số Tử vi: màu ngũ hành của sao, độ mạnh của cách cục, thế của từng cung, nét tính cách.
   Mọi con số đều truy ngược được: hàm nào cũng trả về danh sách sao góp vào con số đó.
   Trọng số do Tứ Chiếu tự đặt theo tính chất sao trong phú đoán phổ biến; đây là cách đọc gợi ý, không phải chân lý.
   Bảng phân vị (TVP_Q) sinh bởi test/tuvi/gen-pho.cjs từ lá số ngẫu nhiên tính bằng chính engine này. */
const TVP = (() => {
  const BR = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];

  /* ---------- Ngũ hành của sao (theo bảng thông dụng trong sách Tử vi Việt Nam) ---------- */
  const EL = {};
  const put = (h, names) => names.split(',').forEach(n => EL[n.trim()] = h);
  put('Kim', 'Vũ Khúc,Thất Sát,Văn Xương,Kình Dương,Đà La,Thiên Khốc,Thai Phụ,Đài Phụ,Hoa Cái,Tấu Thư,Tử Phù,Bạch Hổ,Trực Phù');
  put('Mộc', 'Thiên Cơ,Thiên Lương,Hóa Lộc,Hóa Quyền,Đào Hoa,Ân Quang,Bát Tọa,Giải Thần,Đường Phù,Tang Môn,Tướng Quân');
  put('Thủy', 'Thiên Đồng,Thái Âm,Tham Lang,Cự Môn,Thiên Tướng,Phá Quân,Văn Khúc,Hữu Bật,Hóa Khoa,Hóa Kỵ,Long Trì,Hồng Loan,Thiên Hỷ,Thiên Riêu,Thiên Diêu,Hàm Trì,Thiên Hư,Tam Thai,Thiên Y,Thiên Sứ,Long Đức,Lưu Hà,Bác Sĩ,Thanh Long,Thiếu Âm,Thiên Vu');
  put('Hỏa', 'Thái Dương,Liêm Trinh,Hỏa Tinh,Linh Tinh,Địa Không,Địa Kiếp,Thiên Khôi,Thiên Việt,Thiên Mã,Thiên Hình,Thiên Quan,Thiên Giải,Thiên Đức,Nguyệt Đức,Thiên Không,Đại Hao,Tiểu Hao,Phá Toái,Kiếp Sát,Đẩu Quân,Văn Tinh,Thiên Nguyệt,Thái Tuế,Thiếu Dương,Quan Phù,Tuế Phá,Điếu Khách,Lực Sĩ,Phi Liêm,Hỷ Thần,Phục Binh,Quan Phủ,Âm Sát,Niên Giải');
  put('Thổ', 'Tử Vi,Thiên Phủ,Tả Phù,Lộc Tồn,Phượng Các,Phụng Các,Cô Thần,Quả Tú,Thiên Phúc,Thiên Tài,Thiên Thọ,Thiên Quý,Phong Cáo,Địa Giải,Thiên La,Địa Võng,Thiên Thương,Quốc Ấn,Thiên Trù,Phúc Đức,Bệnh Phù');

  /* ---------- Vị trí của một cung so với cung đang xét ---------- */
  const REL = { toa: 'tọa cung', xung: 'xung chiếu', hop: 'tam hợp', giap: 'giáp cung' };
  const POS = { toa: 1, xung: 0.8, hop: 0.7, giap: 0.5 };
  function relOf(b, x) {
    const d = (BR.indexOf(x) - BR.indexOf(b) + 12) % 12;
    return d === 0 ? 'toa' : d === 6 ? 'xung' : d === 4 || d === 8 ? 'hop' : d === 1 || d === 11 ? 'giap' : '';
  }
  // Độ sáng: sao sáng phát huy mặt tốt mạnh hơn; với sao xấu thì hãm lại nặng hơn
  const BRI = { 'Miếu': 1.2, 'Vượng': 1.1, 'Đắc': 1, 'Lợi': 0.95, 'Bình': 0.85, 'Bất': 0.75, 'Hạn': 0.6, 'Hãm': 0.6 };
  const briOf = s => BRI[s.bright] || 1;
  const briBad = s => s.bright ? 2 - (BRI[s.bright] || 1) : 1;
  const briTxt = b => b === 'Hạn' ? 'hãm' : (b || '').toLowerCase();

  // Mọi sao (cả tứ hóa như một sao riêng) của lá số kèm cung đứng
  function allStars(t) {
    const L = [];
    t.palaces.forEach(p => {
      [...p.major, ...p.minor].forEach(s => { L.push({ name: s.name, b: p.branch, bright: s.bright || '', major: s.type === 'major' });
        if (s.mut) L.push({ name: 'Hóa ' + s.mut, b: p.branch, bright: s.bright || '', host: s.name }); });
      p.adj.forEach(n => L.push({ name: n, b: p.branch, bright: '' }));
    });
    return L;
  }
  const isTT = (t, b) => t.tuan.includes(b) || t.triet.includes(b);

  /* ---------- Cát tinh, sát tinh dùng chung cho cách cục và thế cung ---------- */
  const CAT = { 'Tả Phù': 1, 'Hữu Bật': 1, 'Văn Xương': 0.9, 'Văn Khúc': 0.9, 'Thiên Khôi': 1, 'Thiên Việt': 1, 'Lộc Tồn': 1, 'Hóa Lộc': 1, 'Hóa Quyền': 0.9, 'Hóa Khoa': 0.9,
    'Ân Quang': 0.4, 'Thiên Quý': 0.4, 'Tam Thai': 0.3, 'Bát Tọa': 0.3, 'Long Trì': 0.3, 'Phượng Các': 0.3, 'Phụng Các': 0.3, 'Thiên Đức': 0.3, 'Nguyệt Đức': 0.3, 'Giải Thần': 0.3 };
  const SAT = { 'Kình Dương': 1, 'Đà La': 0.9, 'Hỏa Tinh': 0.9, 'Linh Tinh': 0.9, 'Địa Không': 1, 'Địa Kiếp': 1, 'Hóa Kỵ': 1,
    'Thiên Hình': 0.5, 'Thiên Không': 0.5, 'Kiếp Sát': 0.5, 'Đại Hao': 0.4, 'Tiểu Hao': 0.3, 'Thiên Hư': 0.3, 'Thiên Khốc': 0.3 };
  const lvl = c => c >= 0.85 ? ['mạnh', 4] : c >= 0.6 ? ['trung', 3] : c >= 0.35 ? ['yếu', 2] : ['rất yếu', 1];

  // Sao quanh một cung: cát, sát và từng mũi góp
  function around(t, b, skip = []) {
    const help = [], hurt = [];
    allStars(t).forEach(s => {
      const r = relOf(b, s.b); if (!r || skip.includes(s.name)) return;
      if (CAT[s.name]) { const c = CAT[s.name] * POS[r] * briOf(s); help.push({ name: s.name, r, rel: REL[r], bright: s.bright, c, lvl: lvl(c) }); }
      if (SAT[s.name]) { const c = SAT[s.name] * POS[r] * briBad(s); hurt.push({ name: s.name, r, rel: REL[r], bright: s.bright, c, lvl: lvl(c) }); }
    });
    const by = (a, z) => z.c - a.c; help.sort(by); hurt.sort(by);
    return { help, hurt, cat: help.reduce((a, x) => a + x.c, 0), sat: hurt.reduce((a, x) => a + x.c, 0) };
  }

  /* ---------- Cách cục: hai trục riêng. Tốt hay xấu là bản chất của cách; mức ứng là cách đó hiện ra mạnh tới đâu trên lá số này ---------- */
  const TONE = { tot: 'Tốt', luuy: 'Lưu ý', trung: 'Trung tính' };
  const RANK = { 3: 'Cách chính', 2: 'Cách vừa', 1: 'Cách phụ' };
  function cach(t, c) {
    const form = [];
    allStars(t).forEach(s => { if (!c.stars.includes(s.name)) return; const r = relOf(c.at, s.b); if (!r) return;
      form.push({ name: s.name, r, rel: REL[r], bright: s.bright, f: POS[r] * (c.tone === 'luuy' ? briBad(s) : briOf(s)) }); });
    // Mỗi sao chỉ lấy vị trí gần nhất (một sao có thể vừa tọa vừa là hóa của sao khác)
    const seen = {}; form.sort((a, z) => z.f - a.f); const F = form.filter(x => seen[x.name] ? false : (seen[x.name] = 1));
    const A = around(t, c.at, c.stars), tt = isTT(t, c.at) && !/Tuần|Triệt/.test(c.name); // cách nói về chính Tuần Triệt thì không trừ thêm
    const formTerm = F.length ? (F.reduce((a, x) => a + x.f, 0) / F.length - 0.8) * 60 : 0;
    const side = c.tone === 'luuy' ? 7 * Math.min(A.sat, 4) - 6 * Math.min(A.cat, 4) : 7 * Math.min(A.cat, 4) - 6 * Math.min(A.sat, 4);
    const ung = Math.round(Math.max(3, Math.min(97, 50 + formTerm + side - (tt ? 15 : 0))));
    const ungTxt = ung >= 70 ? 'ứng mạnh' : ung >= 50 ? 'ứng vừa' : ung >= 30 ? 'ứng yếu' : 'ứng rất yếu';
    const palace = (t.palaces.find(p => p.branch === c.at) || {}).name || c.at;
    return { ...c, tone: c.tone, toneTxt: TONE[c.tone], rank: RANK[c.w] || 'Cách phụ', palace, form: F, help: A.help, hurt: A.hurt, tt, ung, ungTxt,
      why: `Mức ứng ${ung}/100 cho biết cách này hiện ra mạnh tới đâu trên lá số của bạn. Nó khác với tốt hay xấu: một cách xấu mà ứng yếu thì không đáng lo nhiều.` +
        (c.tone === 'luuy' ? ' Với cách cần lưu ý, sát tinh làm nó ứng mạnh hơn, cát tinh làm nó nhẹ đi.' : ' Cát tinh quanh cung làm cách ứng mạnh hơn, sát tinh làm nó yếu đi.') +
        (tt ? ` Cung ${palace} bị Tuần hoặc Triệt chặn nên cách bớt đi một phần.` : '') };
  }

  /* ---------- Thế của một cung ---------- */
  function palace(t, b) {
    const p = t.palaces.find(x => x.branch === b), xung = t.palaces.find(x => x.branch === BR[(BR.indexOf(b) + 6) % 12]);
    const own = p.major.length ? p.major : xung.major, borrow = !p.major.length;
    const mj = own.map(s => ({ name: s.name, bright: s.bright, f: (borrow ? 0.7 : 1) * briOf(s) }));
    const A = around(t, b), tt = isTT(t, b);
    const mTerm = mj.length ? (mj.reduce((a, x) => a + x.f, 0) / mj.length - 0.9) * 50 : -8;
    const score = Math.round(Math.max(3, Math.min(97, 50 + mTerm + 7 * Math.min(A.cat, 4) - 6 * Math.min(A.sat, 4) - (tt ? 10 : 0))));
    return { name: p.name, b, stem: p.stem, borrow, major: mj, help: A.help, hurt: A.hurt, tt, score,
      label: score >= 65 ? 'Vững' : score >= 45 ? 'Vừa' : 'Yếu' };
  }

  /* ---------- Nét tính cách: mỗi nét là tổng có trọng số của sao quanh một cung gốc ---------- */
  const TRAITS = [
    { k: 'quyet', g: 'Cách làm việc', name: 'Quyết đoán', at: 'Mệnh', what: 'Dám chốt và làm ngay, không chờ đủ chắc. Khác Kiên trì ở chỗ đây là sức bật lúc bắt đầu.',
      hi: 'Bạn quyết nhanh, chịu được rủi ro khi phải chọn. Dễ thành người kéo cả nhóm đi, nhưng cũng dễ quyết vội.', mid: 'Bạn quyết khi đã có đủ thông tin, không vội mà cũng không lần lữa.', lo: 'Bạn thích cân nhắc kỹ, ngại chốt khi còn mơ hồ. Hợp vai rà soát hơn vai mở đường.',
      w: { 'Thất Sát': 1.2, 'Phá Quân': 1, 'Tử Vi': 0.8, 'Vũ Khúc': 0.9, 'Thái Dương': 0.5, 'Kình Dương': 0.8, 'Hỏa Tinh': 0.5, 'Linh Tinh': 0.4, 'Hóa Quyền': 1, 'Thiên Mã': 0.3,
        'Thiên Đồng': -0.6, 'Thái Âm': -0.4, 'Thiên Cơ': -0.3, 'Đà La': -0.3, 'Hóa Kỵ': -0.3 } },
    { k: 'kien', g: 'Cách làm việc', name: 'Kiên trì', at: 'Mệnh', what: 'Theo một việc tới cùng dù chán, dù chậm.',
      hi: 'Bạn bám việc lâu hơn người khác. Thành quả của bạn thường đến từ sự đều đặn.', mid: 'Bạn theo được việc dài nếu thấy nó đáng, nhưng cũng biết lúc nào nên dừng.', lo: 'Bạn hứng nhanh, chán nhanh. Hợp việc ngắn, nhiều đổi mới; việc dài cần người hoặc hệ thống giữ nhịp.',
      w: { 'Thiên Phủ': 1, 'Vũ Khúc': 0.8, 'Thiên Lương': 0.7, 'Liêm Trinh': 0.6, 'Đà La': 0.6, 'Lộc Tồn': 0.6, 'Thiên Tướng': 0.5, 'Tử Vi': 0.4, 'Thất Sát': 0.3,
        'Thiên Cơ': -0.5, 'Tham Lang': -0.5, 'Phá Quân': -0.4, 'Thiên Mã': -0.4, 'Địa Không': -0.4, 'Địa Kiếp': -0.4, 'Hỏa Tinh': -0.3 } },
    { k: 'kyluat', g: 'Cách làm việc', name: 'Kỷ luật', at: 'Mệnh', what: 'Giữ nguyên tắc, làm đúng quy trình, trọng lời hứa.',
      hi: 'Bạn sống có khuôn, người khác tin được. Đôi khi cứng, khó chịu với người làm ẩu.', mid: 'Bạn giữ nguyên tắc ở việc quan trọng, việc nhỏ thì linh hoạt.', lo: 'Bạn thích tự do, ghét khuôn khổ. Sáng tạo tốt nhưng cần nhắc mình giữ hẹn.',
      w: { 'Liêm Trinh': 1, 'Thiên Tướng': 0.9, 'Thiên Lương': 0.7, 'Tử Vi': 0.6, 'Thiên Phủ': 0.6, 'Hóa Khoa': 0.6, 'Văn Xương': 0.4, 'Thiên Hình': 0.6, 'Lộc Tồn': 0.3,
        'Phá Quân': -0.7, 'Tham Lang': -0.5, 'Địa Không': -0.4, 'Địa Kiếp': -0.4, 'Thiên Đồng': -0.3 } },
    { k: 'dan', g: 'Cách làm việc', name: 'Dẫn dắt', at: 'Mệnh', what: 'Muốn và được người khác để mình cầm lái.',
      hi: 'Bạn có uy tự nhiên, người khác dễ nghe theo. Hợp vai trưởng nhóm, chủ việc.', mid: 'Bạn dẫn được khi cần nhưng không nhất thiết phải đứng đầu.', lo: 'Bạn thích làm tốt phần mình hơn là quản người. Mạnh ở vai chuyên môn, cố vấn.',
      w: { 'Tử Vi': 1.2, 'Thái Dương': 0.8, 'Thất Sát': 0.7, 'Thiên Phủ': 0.5, 'Hóa Quyền': 1, 'Tả Phù': 0.6, 'Hữu Bật': 0.6, 'Thiên Khôi': 0.5, 'Thiên Việt': 0.5, 'Quốc Ấn': 0.4, 'Phong Cáo': 0.3,
        'Thiên Đồng': -0.4, 'Cô Thần': -0.3, 'Quả Tú': -0.3 } },
    { k: 'tinh', g: 'Đầu óc', name: 'Tính toán', at: 'Mệnh', what: 'Nhìn trước nhiều bước, lập kế, cân lợi hại.',
      hi: 'Bạn nghĩ xa hơn người quanh mình, hay thấy rủi ro sớm. Coi chừng nghĩ nhiều mà làm ít.', mid: 'Bạn tính đủ dùng, không quá kỹ cũng không bốc đồng.', lo: 'Bạn đi bằng cảm nhận và hành động hơn là kế hoạch. Nên có người giỏi số liệu bên cạnh.',
      w: { 'Thiên Cơ': 1.2, 'Thiên Lương': 0.7, 'Cự Môn': 0.7, 'Thái Âm': 0.6, 'Vũ Khúc': 0.5, 'Liêm Trinh': 0.4, 'Hóa Khoa': 0.6, 'Văn Xương': 0.5, 'Văn Khúc': 0.4, 'Địa Không': 0.3,
        'Phá Quân': -0.3, 'Thất Sát': -0.2 } },
    { k: 'noi', g: 'Đầu óc', name: 'Ăn nói', at: 'Mệnh', what: 'Diễn đạt, thuyết phục, nói cho người ta nghe.',
      hi: 'Bạn nói có sức nặng, dễ thuyết phục. Cái giá là lời nói cũng dễ gây chuyện.', mid: 'Bạn nói rõ ràng khi cần, không nổi bật mà cũng không vụng.', lo: 'Bạn giỏi làm hơn giỏi nói. Nên chuẩn bị trước khi phải trình bày.',
      w: { 'Cự Môn': 1.2, 'Thái Dương': 0.7, 'Tham Lang': 0.6, 'Thiên Cơ': 0.4, 'Văn Khúc': 0.8, 'Văn Xương': 0.6, 'Hóa Khoa': 0.5, 'Tấu Thư': 0.5, 'Hóa Quyền': 0.3,
        'Đà La': -0.3, 'Hóa Kỵ': -0.3 } },
    { k: 'cam', g: 'Đầu óc', name: 'Nhạy cảm', at: 'Mệnh', what: 'Đọc được không khí, cảm xúc, những gì người khác chưa nói.',
      hi: 'Bạn bắt tín hiệu rất nhạy, có trực giác tốt. Cũng vì vậy mà dễ mệt khi ở chỗ đông.', mid: 'Bạn cảm nhận được người khác nhưng không để nó chi phối.', lo: 'Bạn thẳng, thực tế, ít bị cảm xúc làm lung lay. Đôi khi bỏ sót điều người khác không nói ra.',
      w: { 'Thái Âm': 1, 'Thiên Đồng': 0.8, 'Thiên Cơ': 0.5, 'Thiên Lương': 0.3, 'Hoa Cái': 0.6, 'Thiên Riêu': 0.5, 'Thiên Diêu': 0.5, 'Địa Không': 0.5, 'Văn Khúc': 0.3, 'Long Trì': 0.2, 'Phượng Các': 0.2, 'Phụng Các': 0.2,
        'Vũ Khúc': -0.5, 'Thất Sát': -0.5, 'Kình Dương': -0.3 } },
    { k: 'kiem', g: 'Tiền bạc', name: 'Kiếm tiền', at: 'Tài Bạch', what: 'Khả năng tạo ra nguồn thu, đọc theo cung Tài Bạch và tam phương.',
      hi: 'Bạn có nhiều đường ra tiền, nhạy với cơ hội. Tiền tới tương đối dễ.', mid: 'Thu nhập của bạn đều, đi theo công sức bỏ ra.', lo: 'Tiền không tự tìm tới bạn; phải có nghề chắc hoặc người đỡ. Đừng trông vào may rủi.',
      w: { 'Vũ Khúc': 1.2, 'Thái Âm': 0.8, 'Thiên Phủ': 0.8, 'Tham Lang': 0.7, 'Lộc Tồn': 1, 'Hóa Lộc': 1.2, 'Thiên Mã': 0.5, 'Thái Dương': 0.4, 'Tả Phù': 0.3, 'Hữu Bật': 0.3,
        'Địa Kiếp': -0.8, 'Địa Không': -0.7, 'Hóa Kỵ': -0.7, 'Đại Hao': -0.4, 'Tiểu Hao': -0.3, 'Kình Dương': -0.3 } },
    { k: 'giu', g: 'Tiền bạc', name: 'Giữ tiền', at: 'Tài Bạch', what: 'Giữ được của, không để tiền đi nhanh như tới.',
      hi: 'Bạn biết giữ, biết để dành; tài sản tích dần theo năm.', mid: 'Bạn giữ được phần lớn, thỉnh thoảng có khoản hao bất ngờ.', lo: 'Tiền vào nhanh ra nhanh. Nên đổ tiền vào tài sản hoặc khoản tiết kiệm tự động để nó ở lại.',
      w: { 'Thiên Phủ': 1.2, 'Thái Âm': 0.8, 'Lộc Tồn': 1, 'Vũ Khúc': 0.6, 'Thiên Tướng': 0.3, 'Hóa Khoa': 0.3, 'Đà La': 0.2,
        'Phá Quân': -0.8, 'Địa Kiếp': -0.8, 'Địa Không': -0.8, 'Đại Hao': -0.6, 'Tiểu Hao': -0.5, 'Hóa Kỵ': -0.5, 'Tham Lang': -0.3, 'Thiên Mã': -0.3 } },
    { k: 'giup', g: 'Người với người', name: 'Được giúp', at: 'Mệnh', what: 'Có quý nhân, người nâng đỡ, đồng đội tốt.',
      hi: 'Bạn hay gặp người giúp đúng lúc. Đừng ngại nhờ: đó là điểm mạnh của bạn.', mid: 'Có người giúp khi cần, nhưng phần lớn vẫn do bạn tự làm.', lo: 'Bạn quen tự xoay. Học cách nhờ người và giữ mối quan hệ sẽ đỡ cho bạn nhiều.',
      w: { 'Tả Phù': 1, 'Hữu Bật': 1, 'Thiên Khôi': 0.9, 'Thiên Việt': 0.9, 'Thiên Lương': 0.6, 'Ân Quang': 0.5, 'Thiên Quý': 0.5, 'Thiên Đồng': 0.3, 'Hóa Khoa': 0.4,
        'Cô Thần': -0.5, 'Quả Tú': -0.5, 'Kình Dương': -0.3, 'Đà La': -0.3, 'Hóa Kỵ': -0.3 } },
    { k: 'hut', g: 'Người với người', name: 'Sức hút', at: 'Mệnh', what: 'Duyên với người khác, dễ được để ý, được thích.',
      hi: 'Bạn dễ được để ý, nhiều duyên. Cái hay là dễ mở lời, cái dở là dễ vướng chuyện tình cảm.', mid: 'Bạn có duyên vừa phải, người ta quý khi đã quen.', lo: 'Bạn kín, ít chủ động gây chú ý. Người hợp với bạn thường đến qua công việc hoặc bạn bè.',
      w: { 'Tham Lang': 1, 'Liêm Trinh': 0.4, 'Thái Âm': 0.3, 'Hồng Loan': 0.8, 'Thiên Hỷ': 0.6, 'Đào Hoa': 0.8, 'Hàm Trì': 0.6, 'Thiên Riêu': 0.6, 'Thiên Diêu': 0.6, 'Long Trì': 0.3, 'Phượng Các': 0.3, 'Phụng Các': 0.3, 'Văn Khúc': 0.3, 'Hóa Lộc': 0.3,
        'Cô Thần': -0.4, 'Quả Tú': -0.4 } },
    { k: 'diem', g: 'Người với người', name: 'Điềm tĩnh', at: 'Mệnh', what: 'Giữ được bình tĩnh khi có chuyện, ít bốc hỏa.',
      hi: 'Bạn bình tĩnh, ít để cảm xúc lấn át. Người khác thấy yên tâm khi có bạn.', mid: 'Bạn thường bình tĩnh, chỉ nóng khi bị chạm đúng chỗ.', lo: 'Bạn nóng nhanh, dễ phản ứng trước rồi nghĩ sau. Một nhịp thở trước khi trả lời sẽ cứu bạn nhiều lần.',
      w: { 'Thiên Đồng': 0.7, 'Thiên Lương': 0.7, 'Thiên Phủ': 0.7, 'Thái Âm': 0.3, 'Tả Phù': 0.3, 'Hữu Bật': 0.3, 'Thiên Tướng': 0.3, 'Lộc Tồn': 0.3,
        'Hỏa Tinh': -0.8, 'Linh Tinh': -0.7, 'Kình Dương': -0.6, 'Đà La': -0.4, 'Địa Không': -0.5, 'Địa Kiếp': -0.5, 'Thiên Hư': -0.4, 'Thiên Khốc': -0.4, 'Hóa Kỵ': -0.5, 'Phá Quân': -0.3, 'Thất Sát': -0.3 } }
  ];
  const TP = { toa: 1, xung: 0.6, hop: 0.5, giap: 0.3 };
  function rawTraits(t) {
    const S = allStars(t), than = t.palaces.find(p => p.isBody), out = {};
    TRAITS.forEach(T => {
      const base = (t.palaces.find(p => p.name === T.at) || {}).branch, parts = [];
      S.forEach(s => { const w = T.w[s.name]; if (!w) return;
        let r = relOf(base, s.b), k = r ? TP[r] : 0, where = r ? REL[r] : '';
        if (T.at === 'Mệnh' && than && !than.name.startsWith('Mệnh') && s.b === than.branch && 0.4 > k) { k = 0.4; where = 'cung Thân'; }
        if (!k) return;
        if (isTT(t, s.b) && s.b === base) k *= 0.7;
        const c = w * k * (w > 0 ? briOf(s) : briBad(s));
        parts.push({ name: s.name, where, bright: s.bright, c });
      });
      // một sao chỉ tính một lần, lấy vị trí góp nhiều nhất
      const best = {}; parts.forEach(x => { if (!best[x.name] || Math.abs(x.c) > Math.abs(best[x.name].c)) best[x.name] = x; });
      const P = Object.values(best).sort((a, z) => Math.abs(z.c) - Math.abs(a.c));
      out[T.k] = { raw: +P.reduce((a, x) => a + x.c, 0).toFixed(3), parts: P };
    });
    return out;
  }
  // Phân vị từ bảng 101 mốc (0%…100%); giá trị nằm trên đoạn bằng nhau thì lấy giữa đoạn
  function pctOf(q, x) {
    if (!q) return null;
    if (x <= q[0]) return 0; if (x >= q[100]) return 100;
    let lo = q.findIndex(v => v >= x), hi = 100; while (hi > 0 && q[hi] > x) hi--;
    if (hi >= lo) return Math.round((lo + hi) / 2);
    const a = q[hi], b = q[lo]; return Math.round(hi + (x - a) / (b - a || 1));
  }
  function traits(t) {
    const R = rawTraits(t), Q = (typeof TVP_Q !== 'undefined' && TVP_Q[t.school]) || null;
    // giữ trong 1–99: "hơn 0%" hay "hơn 100%" đọc như tuyệt đối, trong khi mẫu chỉ có vài nghìn lá số
    return TRAITS.map(T => { const r = R[T.k], p0 = Q ? pctOf(Q.q[T.k], r.raw) : null, pct = p0 === null ? null : Math.max(1, Math.min(99, p0));
      const level = pct === null ? '' : pct >= 92 ? 'Rất cao' : pct >= 75 ? 'Cao' : pct <= 8 ? 'Rất thấp' : pct <= 25 ? 'Thấp' : 'Trung bình';
      return { k: T.k, g: T.g, name: T.name, at: T.at, what: T.what, mean: pct === null ? '' : pct >= 75 ? T.hi : pct <= 25 ? T.lo : T.mid,
        raw: r.raw, pct, level, n: Q ? Q.n : 0, parts: r.parts.map(x => ({ ...x, lvl: Math.abs(x.c) >= 0.8 ? 'nhiều' : Math.abs(x.c) >= 0.4 ? 'vừa' : 'ít' })) }; });
  }

  return { EL, REL, relOf, allStars, around, cach, palace, traits, rawTraits, pctOf, TRAITS, TONE, briTxt };
})();
if (typeof module !== 'undefined') module.exports = TVP;
