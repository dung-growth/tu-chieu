/* Tứ Chiếu — Kỳ Môn Độn Giáp (thời gia kỳ môn), bản Beta.
   Một phương pháp duy nhất: định cục Sách bổ (拆補), chuyển bàn (轉盤), Thiên Cầm ký Khôn (2),
   giờ Việt Nam UTC+7. Engine tính hoàn toàn bằng quy tắc, không dùng AI.
   Cần global Solar (lunar-javascript). Đối chiếu với kinqimen 0.0.6.6 (MIT, Ken Tang) ở test/qimen.

   QUY TẮC SÁCH BỔ ĐƯỢC CÀI ĐẶT
   1. Thời điểm: giờ đồng hồ tại múi giờ tz (mặc định 7). Tiết khí so theo thời điểm tuyệt đối.
   2. Trụ ngày đổi lúc 23:00 (giờ Tý sớm thuộc ngày hôm sau); trụ giờ theo Ngũ Thử Độn từ can ngày đó.
   3. Tiết khí đang hiệu lực = tiết hoặc khí gần nhất đã qua (đủ 24). Đông chí → Mang chủng: Dương độn;
      Hạ chí → Đại tuyết: Âm độn.
   4. Phù đầu = ngày Giáp hoặc Kỷ gần nhất (kể cả hôm nay) theo trụ ngày. Chi phù đầu Tý Ngọ Mão Dậu:
      thượng nguyên; Dần Thân Tỵ Hợi: trung nguyên; Thìn Tuất Sửu Mùi: hạ nguyên. Không xét siêu thần, tiếp khí.
   5. Cục số = bảng tiết khí × tam nguyên (JU dưới đây).
   6. Địa bàn: Mậu ở cung số cục, rồi Kỷ Canh Tân Nhâm Quý Đinh Bính Ất; Dương đi cung tăng, Âm đi cung giảm
      (vòng 1→9, có cung 5).
   7. Tuần thủ của giờ → lục nghi (Giáp Tý Mậu, Giáp Tuất Kỷ, Giáp Thân Canh, Giáp Ngọ Tân, Giáp Thìn Nhâm,
      Giáp Dần Quý). Cung của nghi đó trên địa bàn = cung tuần thủ. Trực phù = sao gốc của cung ấy (cung 5 → Thiên Cầm,
      đi theo Thiên Nhuế ở Khôn); Trực sử = cửa gốc của cung ấy (cung 5 → Tử môn).
   8. Trực phù đến cung có can giờ trên địa bàn (giờ Giáp: dùng nghi của tuần). Cung 5 → ký Khôn 2.
   9. Chuyển bàn: tám sao giữ thứ tự vòng (Khảm→Cấn→Chấn→Tốn→Ly→Khôn→Đoài→Càn), xoay cả vòng cho Trực phù tới
      cung đích. Thiên Cầm đi cùng Thiên Nhuế. Can thiên bàn đi theo sao (can địa bàn của cung gốc của sao);
      sao Nhuế mang thêm can cung 5.
   10. Trực sử: từ cung tuần thủ đi k bước (k = số thứ tự can giờ trong tuần, Giáp = 0), Dương +1, Âm −1 qua cả
       cung 5; rơi vào 5 → ký Khôn 2. Tám cửa xoay cả vòng (cùng chiều như sao) cho Trực sử tới đó.
   11. Bát thần bắt đầu từ cung Trực phù: Trực Phù, Đằng Xà, Thái Âm, Lục Hợp, Bạch Hổ, Huyền Vũ, Cửu Địa, Cửu Thiên;
       Dương đi thuận vòng, Âm đi nghịch vòng.
   12. Không vong theo tuần của ngày và của giờ; Dịch mã theo chi giờ. */
const QM = (() => {
  const GAN = '甲乙丙丁戊己庚辛壬癸', ZHI = '子丑寅卯辰巳午未申酉戌亥';
  const GAN_VI = ['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'];
  const ZHI_VI = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];
  const vi = s => [...s].map(c => GAN.includes(c) ? GAN_VI[GAN.indexOf(c)] : ZHI.includes(c) ? ZHI_VI[ZHI.indexOf(c)] : c).join(' ');

  const PALACE = { 1: ['坎','Khảm','Bắc'], 2: ['坤','Khôn','Tây Nam'], 3: ['震','Chấn','Đông'], 4: ['巽','Tốn','Đông Nam'], 5: ['中','Trung cung','Giữa'],
    6: ['乾','Càn','Tây Bắc'], 7: ['兌','Đoài','Tây'], 8: ['艮','Cấn','Đông Bắc'], 9: ['離','Ly','Nam'] };
  const RING = [1, 8, 3, 4, 9, 2, 7, 6];                    // chiều thuận trên bàn (Nam ở trên)
  const STAR_HOME = { 1: '蓬', 2: '芮', 3: '沖', 4: '輔', 5: '禽', 6: '心', 7: '柱', 8: '任', 9: '英' };
  const DOOR_HOME = { 1: '休', 2: '死', 3: '傷', 4: '杜', 6: '開', 7: '驚', 8: '生', 9: '景' };
  const STAR_VI = { '蓬': 'Thiên Bồng', '芮': 'Thiên Nhuế', '沖': 'Thiên Xung', '輔': 'Thiên Phụ', '禽': 'Thiên Cầm', '心': 'Thiên Tâm', '柱': 'Thiên Trụ', '任': 'Thiên Nhậm', '英': 'Thiên Anh' };
  const DOOR_VI = { '休': 'Hưu môn', '生': 'Sinh môn', '傷': 'Thương môn', '杜': 'Đỗ môn', '景': 'Cảnh môn', '死': 'Tử môn', '驚': 'Kinh môn', '開': 'Khai môn' };
  const GODS = ['值符','螣蛇','太陰','六合','白虎','玄武','九地','九天'];
  const GOD_VI = { '值符': 'Trực Phù', '螣蛇': 'Đằng Xà', '太陰': 'Thái Âm', '六合': 'Lục Hợp', '白虎': 'Bạch Hổ', '玄武': 'Huyền Vũ', '九地': 'Cửu Địa', '九天': 'Cửu Thiên' };
  const YI = { '甲子': '戊', '甲戌': '己', '甲申': '庚', '甲午': '辛', '甲辰': '壬', '甲寅': '癸' };
  const SEQ = '戊己庚辛壬癸丁丙乙';
  const TERMS = ['冬至','小寒','大寒','立春','雨水','驚蟄','春分','清明','穀雨','立夏','小滿','芒種','夏至','小暑','大暑','立秋','處暑','白露','秋分','寒露','霜降','立冬','小雪','大雪'];
  const TERM_VI = ['Đông chí','Tiểu hàn','Đại hàn','Lập xuân','Vũ thủy','Kinh trập','Xuân phân','Thanh minh','Cốc vũ','Lập hạ','Tiểu mãn','Mang chủng','Hạ chí','Tiểu thử','Đại thử','Lập thu','Xử thử','Bạch lộ','Thu phân','Hàn lộ','Sương giáng','Lập đông','Tiểu tuyết','Đại tuyết'];
  // Tên tiết khí của lunar-javascript (giản thể / riêng) → phồn thể dùng ở đây
  const SIMP = { '惊蛰': '驚蟄', '谷雨': '穀雨', '小满': '小滿', '芒种': '芒種', '处暑': '處暑', 'DONG_ZHI': '冬至', 'XIAO_HAN': '小寒', 'DA_HAN': '大寒', 'LI_CHUN': '立春', 'YU_SHUI': '雨水', 'JING_ZHE': '驚蟄', 'DA_XUE': '大雪' };
  const JU = { '冬至': [1,7,4], '小寒': [2,8,5], '大寒': [3,9,6], '立春': [8,5,2], '雨水': [9,6,3], '驚蟄': [1,7,4], '春分': [3,9,6], '清明': [4,1,7], '穀雨': [5,2,8], '立夏': [4,1,7], '小滿': [5,2,8], '芒種': [6,3,9],
    '夏至': [9,3,6], '小暑': [8,2,5], '大暑': [7,1,4], '立秋': [2,5,8], '處暑': [1,4,7], '白露': [9,3,6], '秋分': [7,1,4], '寒露': [6,9,3], '霜降': [5,8,2], '立冬': [6,9,3], '小雪': [5,8,2], '大雪': [4,7,1] };
  const ZHI_PALACE = { '子': 1, '丑': 8, '寅': 8, '卯': 3, '辰': 4, '巳': 4, '午': 9, '未': 2, '申': 2, '酉': 7, '戌': 6, '亥': 6 };
  const MA = { '申': '寅', '子': '寅', '辰': '寅', '寅': '申', '午': '申', '戌': '申', '巳': '亥', '酉': '亥', '丑': '亥', '亥': '巳', '卯': '巳', '未': '巳' };
  const pad = n => String(n).padStart(2, '0');
  const step = (p, k) => ((p - 1 + k) % 9 + 9) % 9 + 1;     // đi k cung trên vòng 1…9
  const xunOf = gz => { const g = GAN.indexOf(gz[0]), z = ZHI.indexOf(gz[1]); return '甲' + ZHI[((z - g) % 12 + 12) % 12]; };
  const kongOf = gz => { const x = xunOf(gz), z = ZHI.indexOf(x[1]); return [ZHI[(z + 10) % 12], ZHI[(z + 11) % 12]]; };
  const termName = n => SIMP[n] || n;

  /* Lập bàn. y m d h mi: giờ đồng hồ tại múi giờ tz (mặc định UTC+7, giờ Việt Nam). */
  function chart(y, m, d, h, mi, tz = 7) {
    // Trụ ngày, giờ theo giờ đồng hồ địa phương (đổi ngày lúc 23:00)
    const loc = Solar.fromYmdHms(y, m, d, h, mi, 0).getLunar();
    const dayGZ = loc.getDayInGanZhiExact(), hourGZ = loc.getTimeInGanZhi();
    // Tiết khí: lunar-javascript tính theo giờ Bắc Kinh (UTC+8) → đổi thời điểm sang giờ đó để so
    const inst = Date.UTC(y, m - 1, d, h, mi) - tz * 3600e3, bj = new Date(inst + 8 * 3600e3);
    const bjL = Solar.fromYmdHms(bj.getUTCFullYear(), bj.getUTCMonth() + 1, bj.getUTCDate(), bj.getUTCHours(), bj.getUTCMinutes(), 0).getLunar();
    const jq = bjL.getPrevJieQi(false), term = termName(jq.getName()), ti = TERMS.indexOf(term);
    if (ti < 0) throw new Error('Không nhận ra tiết khí ' + jq.getName());
    const js = jq.getSolar(), termInst = Date.UTC(js.getYear(), js.getMonth() - 1, js.getDay(), js.getHour(), js.getMinute(), js.getSecond()) - 8 * 3600e3;
    const tl = new Date(termInst + tz * 3600e3), termAt = `${pad(tl.getUTCHours())}:${pad(tl.getUTCMinutes())} ${pad(tl.getUTCDate())}/${pad(tl.getUTCMonth() + 1)}/${tl.getUTCFullYear()}`;
    const yang = ti < 12;
    // Phù đầu và tam nguyên theo trụ ngày
    const di = (GAN.indexOf(dayGZ[0]) % 5), fuTou = (() => { const g = GAN.indexOf(dayGZ[0]) - di, z = ((ZHI.indexOf(dayGZ[1]) - di) % 12 + 12) % 12; return GAN[g] + ZHI[z]; })();
    const yuan = '子午卯酉'.includes(fuTou[1]) ? 0 : '寅申巳亥'.includes(fuTou[1]) ? 1 : 2;
    const ju = JU[term][yuan];
    // Địa bàn
    const earth = {}; for (let i = 0; i < 9; i++) earth[step(ju, yang ? i : -i)] = SEQ[i];
    const palaceOfStem = s => +Object.keys(earth).find(k => earth[k] === s);
    // Tuần thủ, trực phù, trực sử
    const xun = xunOf(hourGZ), yi = YI[xun], xunPalace = palaceOfStem(yi);
    const zhifuStar = STAR_HOME[xunPalace];                      // 禽 nếu tuần thủ ở cung 5
    const zhishiDoor = xunPalace === 5 ? '死' : DOOR_HOME[xunPalace];
    const hStem = hourGZ[0] === '甲' ? yi : hourGZ[0];
    let zfTo = palaceOfStem(hStem); const zfToRaw = zfTo; if (zfTo === 5) zfTo = 2;
    const k = GAN.indexOf(hourGZ[0]);                            // số thứ tự can giờ trong tuần (Giáp = 0)
    let zsTo = step(xunPalace, yang ? k : -k); const zsToRaw = zsTo; if (zsTo === 5) zsTo = 2;
    // Chuyển bàn: sao và can thiên bàn
    const ringStar = p => STAR_HOME[p];                          // sao gốc trên vòng 8 cung
    const fromStar = zhifuStar === '禽' ? 2 : xunPalace;          // cung gốc của trực phù trên vòng
    const shift = RING.indexOf(zfTo) - RING.indexOf(fromStar);
    const P = {};
    for (let i = 1; i <= 9; i++) P[i] = { palace: i, gua: PALACE[i][0], name: PALACE[i][1], dir: PALACE[i][2], earth: [earth[i]], sky: [], star: null, starHome: STAR_HOME[i], door: null, god: null, kong: [], ma: false };
    P[2].earth.push(earth[5]);                                   // Thiên Cầm ký Khôn: can cung 5 gửi ở Khôn
    RING.forEach((home, i) => {
      const to = RING[((i + shift) % 8 + 8) % 8];
      P[to].star = ringStar(home);
      P[to].sky = home === 2 ? [earth[2], earth[5]] : [earth[home]];
      if (home === 2) P[to].qin = true;                          // Thiên Cầm đi cùng Thiên Nhuế
    });
    // Tám cửa
    const doorFrom = zhishiDoor === '死' && xunPalace === 5 ? 2 : xunPalace;
    const dshift = RING.indexOf(zsTo) - RING.indexOf(doorFrom);
    RING.forEach((home, i) => { P[RING[((i + dshift) % 8 + 8) % 8]].door = DOOR_HOME[home]; });
    // Bát thần
    const g0 = RING.indexOf(zfTo);
    GODS.forEach((g, i) => { P[RING[((g0 + (yang ? i : -i)) % 8 + 8) % 8]].god = g; });
    // Không vong, dịch mã
    const kong = { day: kongOf(dayGZ), hour: kongOf(hourGZ) };
    const addK = (z, w) => { const k = P[ZHI_PALACE[z]].kong; if (!k.includes(w)) k.push(w); };
    kong.day.forEach(z => addK(z, 'ngày')); kong.hour.forEach(z => addK(z, 'giờ'));
    const ma = MA[hourGZ[1]]; P[ZHI_PALACE[ma]].ma = true;
    // Phục ngâm / phản ngâm (sao và cửa)
    const opp = p => 10 - p;
    const starFu = RING.every(p => P[p].star === STAR_HOME[p]), starFan = RING.every(p => P[p].star === STAR_HOME[opp(p)]);
    const doorFu = RING.every(p => P[p].door === DOOR_HOME[p]), doorFan = RING.every(p => P[p].door === DOOR_HOME[opp(p)]);
    const notes = [];
    if (xunPalace === 5) notes.push('Tuần thủ ở cung giữa: Trực phù là Thiên Cầm (đi theo Thiên Nhuế ở Khôn), Trực sử là Tử môn.');
    if (zfToRaw === 5) notes.push('Can giờ ở cung giữa: Trực phù ký sang Khôn 2.');
    if (zsToRaw === 5) notes.push('Trực sử đếm tới cung giữa: ký sang Khôn 2.');
    if (hourGZ[0] === '甲') notes.push(`Giờ Giáp: can giờ ẩn dưới ${yi}.`);
    return {
      method: 'Sách bổ · chuyển bàn · Thiên Cầm ký Khôn', tz,
      at: `${pad(h)}:${pad(mi)} ${pad(d)}/${pad(m)}/${y}`,
      pillars: { year: loc.getYearInGanZhiExact(), month: loc.getMonthInGanZhiExact(), day: dayGZ, hour: hourGZ },
      term: { name: term, vi: TERM_VI[ti], at: termAt },
      dun: yang ? 'Dương' : 'Âm', yang, yuan: ['Thượng','Trung','Hạ'][yuan], ju, fuTou,
      xun, yi, xunPalace,
      zhifu: { star: zhifuStar, palace: zfTo }, zhishi: { door: zhishiDoor, palace: zsTo },
      palaces: P, kong, ma: { zhi: ma, palace: ZHI_PALACE[ma] },
      fuyin: { star: starFu, door: doorFu }, fanyin: { star: starFan, door: doorFan }, notes
    };
  }

  /* Lập bàn từ một thời điểm Date bất kỳ, quy về giờ Việt Nam */
  function chartAt(date, tz = 7) { const t = new Date(date.getTime() + tz * 3600e3);
    return chart(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate(), t.getUTCHours(), t.getUTCMinutes(), tz); }

  // Cung chứa một can trên thiên bàn (can Giáp: dùng nghi của tuần tương ứng)
  function skyPalaceOf(c, stem, gz) {
    const s = stem === '甲' && gz ? YI[xunOf(gz)] : stem;
    const p = Object.values(c.palaces).filter(x => x.palace !== 5 && x.sky.includes(s)).map(x => x.palace);
    return p.length ? p[0] : null;
  }


  /* ---------- Nghĩa ngắn (Tứ Chiếu tự viết, theo cách hiểu phổ biến) ---------- */
  const NGHIA = {
    star: { '蓬': ['hung', 'Sao trí mưu và liều lĩnh: gan, nhiều mưu, dễ dính chuyện mờ ám, trộm cắp, nước.'], '芮': ['hung', 'Sao bệnh và học trò: hay ốm vặt, vướng chuyện nhỏ nhặt; tốt cho học hỏi, dạy dỗ.'],
      '沖': ['cát nhỏ', 'Sao hành động nhanh: quyết đoán, nóng vội, hợp việc cần ra tay ngay.'], '輔': ['cát', 'Sao văn chương, giáo dục: hiền, có học, được người giúp.'],
      '禽': ['cát', 'Sao trung chính: ổn định, công bằng, đi kèm Thiên Nhuế ở Khôn.'], '心': ['cát', 'Sao thầy thuốc, quản lý: tính toán giỏi, chữa bệnh, điều hành.'],
      '柱': ['hung', 'Sao miệng lưỡi, phá vỡ: hay nói thẳng, dễ tranh cãi, tổn hại.'], '任': ['cát', 'Sao bền bỉ, đất đai: chậm mà chắc, hợp tích lũy, nhà đất.'],
      '英': ['bình', 'Sao danh tiếng, lửa: nổi bật, sáng ý, dễ nóng và hư danh.'] },
    door: { '休': ['cát', 'Cửa nghỉ: yên ổn, quý nhân, nghỉ ngơi, gặp gỡ.'], '生': ['cát', 'Cửa sinh: tài lộc, sinh sôi, làm ăn, nhà đất.'], '傷': ['hung', 'Cửa thương: tổn thương, va chạm; hợp đòi nợ, săn bắt, thi đấu.'],
      '杜': ['hung', 'Cửa đóng: bế tắc, ẩn náu; hợp giữ bí mật, ẩn mình.'], '景': ['bình', 'Cửa sáng: văn thư, thi cử, quảng bá; dễ thị phi, hư danh.'], '死': ['hung', 'Cửa chết: đình trệ, tang sự, kết thúc; hợp việc đất đai, chôn cất.'],
      '驚': ['hung', 'Cửa kinh: hoảng sợ, kiện tụng, tin xấu, miệng lưỡi.'], '開': ['cát', 'Cửa mở: sự nghiệp, khai trương, cấp trên, việc công.'] },
    god: { '值符': ['cát', 'Thần đứng đầu: quý nhân, người có quyền, che chở.'], '螣蛇': ['hung', 'Rắn: hư ảo, lo sợ, chuyện kỳ quặc, lật lọng.'], '太陰': ['cát', 'Âm thầm: kín đáo, mưu tính sau lưng, quý nhân nữ.'],
      '六合': ['cát', 'Hòa hợp: hôn nhân, hợp tác, môi giới, giao dịch.'], '白虎': ['hung', 'Hổ: mạnh bạo, tai nạn, tranh đấu, máu huyết.'], '玄武': ['hung', 'Rùa đen: lừa lọc, mất mát, tiểu nhân, ám muội.'],
      '九地': ['cát', 'Đất: vững chãi, ẩn tàng, giữ gìn, tích lũy lâu dài.'], '九天': ['cát', 'Trời: bay cao, khuếch trương, hành động công khai.'] },
    stem: { '戊': 'Mậu: vốn liếng, tiền của, Giáp ẩn (người đứng đầu).', '己': 'Kỷ: mưu tính riêng, ruộng đất, chuyện kín.', '庚': 'Canh: trở ngại, đối thủ, chồng (khi hỏi hôn nhân).',
      '辛': 'Tân: sai lầm, tội lỗi, chuyện cần sửa.', '壬': 'Nhâm: lưu động, đi lại, bị cuốn theo.', '癸': 'Quý: che lấp, ám muội, dây dưa.',
      '乙': 'Ất (Nhật kỳ): mềm mỏng, thuốc men, vợ (khi hỏi hôn nhân).', '丙': 'Bính (Nguyệt kỳ): quyền uy, sáng rõ, bộc phát.', '丁': 'Đinh (Tinh kỳ): văn thư, tin tức, hy vọng.' },
    palace: { 1: 'Khảm, hành Thủy, phương Bắc: nước, hiểm, trí tuệ.', 2: 'Khôn, hành Thổ, Tây Nam: mẹ, đất, nhẫn nại.', 3: 'Chấn, hành Mộc, phương Đông: khởi động, chấn động.',
      4: 'Tốn, hành Mộc, Đông Nam: gió, thâm nhập, buôn bán.', 5: 'Trung cung, hành Thổ: trục giữa, can gửi sang Khôn.', 6: 'Càn, hành Kim, Tây Bắc: cha, quyền lực, cấp trên.',
      7: 'Đoài, hành Kim, phương Tây: lời nói, vui vẻ, khẩu thiệt.', 8: 'Cấn, hành Thổ, Đông Bắc: núi, dừng, tích lũy.', 9: 'Ly, hành Hỏa, phương Nam: sáng, danh tiếng, văn thư.' }
  };

  /* ---------- Vai trò (dụng thần) theo cách dùng phổ biến ---------- */
  const TOPICS = {
    tai: { name: 'Tiền bạc, làm ăn', door: '生', stems: ['戊'] }, viec: { name: 'Công việc, sự nghiệp', door: '開', stems: [] },
    tinh: { name: 'Tình cảm, hôn nhân', god: '六合', stems: ['乙', '庚'] }, suckhoe: { name: 'Sức khỏe', star: '芮', stems: ['乙'], star2: '心' },
    dixa: { name: 'Đi xa, xuất hành', door: '開', ma: true, stems: [] }, kien: { name: 'Giấy tờ, kiện tụng', door: '驚', door2: '景', stems: [] },
    hoc: { name: 'Học hành, thi cử', door: '景', stems: ['丁'], star: '輔' }, khac: { name: 'Việc khác', stems: [] } };
  const findDoor = (c, d) => +Object.keys(c.palaces).find(p => c.palaces[p].door === d) || null;
  const findStar = (c, s) => +Object.keys(c.palaces).find(p => c.palaces[p].star === s) || null;
  const findGod = (c, g) => +Object.keys(c.palaces).find(p => c.palaces[p].god === g) || null;
  // Mỗi vai trò có khóa (k) để chọn câu đời thường phù hợp
  function roles(c, mode, topic) {
    const R = [], P = c.pillars, put = (k, label, palace, via) => { if (palace) R.push({ k, label, palace, via, ...verdict(c, palace) }); };
    put('ban', 'Bản thân (can ngày ' + vi(P.day[0]) + ')', skyPalaceOf(c, P.day[0], P.day), 'can ngày trên thiên bàn');
    if (mode === 'menh') {
      put('chame', 'Cha mẹ, cấp trên (can năm ' + vi(P.year[0]) + ')', skyPalaceOf(c, P.year[0], P.year), 'can năm');
      put('anhem', 'Anh em, bạn bè (can tháng ' + vi(P.month[0]) + ')', skyPalaceOf(c, P.month[0], P.month), 'can tháng');
      put('con', 'Con cái, hậu vận (can giờ ' + vi(P.hour[0]) + ')', skyPalaceOf(c, P.hour[0], P.hour), 'can giờ');
      put('viec', 'Sự nghiệp (Khai môn)', findDoor(c, '開'), 'cửa'); put('tien', 'Tài lộc (Sinh môn)', findDoor(c, '生'), 'cửa'); put('von', 'Vốn liếng (Mậu)', skyPalaceOf(c, '戊'), 'can');
      put('tinh', 'Tình cảm (Lục Hợp)', findGod(c, '六合'), 'thần'); put('khoe', 'Sức khỏe (Thiên Nhuế)', findStar(c, '芮'), 'sao');
    } else {
      put('su', 'Sự việc (can giờ ' + vi(P.hour[0]) + ')', skyPalaceOf(c, P.hour[0], P.hour), 'can giờ');
      const T = TOPICS[topic] || TOPICS.khac, k = 'dt-' + (topic || 'khac');
      if (T.door) put(k, `Dụng thần: ${DOOR_VI[T.door]}`, findDoor(c, T.door), 'cửa'); if (T.door2) put(k, `Dụng thần: ${DOOR_VI[T.door2]}`, findDoor(c, T.door2), 'cửa');
      if (T.god) put(k, `Dụng thần: ${GOD_VI[T.god]}`, findGod(c, T.god), 'thần');
      if (T.star) put(k, `Dụng thần: ${STAR_VI[T.star]}`, findStar(c, T.star), 'sao'); if (T.star2) put(k, `Dụng thần: ${STAR_VI[T.star2]}`, findStar(c, T.star2), 'sao');
      T.stems.forEach(s => put(k, `Dụng thần: can ${vi(s)}`, skyPalaceOf(c, s), 'can'));
      if (T.ma) put(k, 'Dụng thần: Dịch mã', c.ma.palace, 'mã');
    }
    return R;
  }

  /* ---------- Chấm nhanh một cung, theo lối đọc phổ biến: cửa quyết định chính, sao và thần thêm bớt ---------- */
  const W = { 'cát': 1, 'cát nhỏ': 0.5, 'bình': 0, 'hung': -1 };
  function verdict(c, p) {
    const x = c.palaces[p]; if (!x || p === 5) return { verdict: 'Lẫn lộn', score: 0 };
    const score = 2 * W[NGHIA.door[x.door][0]] + W[NGHIA.star[x.star][0]] + W[NGHIA.god[x.god][0]];
    return { verdict: score >= 2 ? 'Thuận' : score <= -2 ? 'Kẹt' : 'Lẫn lộn', score, kong: x.kong.length > 0, ma: x.ma };
  }
  // Câu đời thường cho từng vai trò × nhãn (Tứ Chiếu tự viết)
  const PLAIN = {
    ban: ['Bạn đang ở thế thuận: tự tin, dễ được người giúp.', 'Bạn có điểm mạnh nhưng cũng có chỗ tự làm khó mình.', 'Bạn đang ở thế bất lợi: dễ mệt, dễ bị động, nên giữ sức.'],
    chame: ['Được cha mẹ, cấp trên nâng đỡ.', 'Với cha mẹ, cấp trên lúc êm lúc va.', 'Hay vênh với cha mẹ, cấp trên; đừng trông nhiều vào họ.'],
    anhem: ['Bạn bè, anh em là chỗ dựa.', 'Bạn bè có giúp nhưng cũng có lúc kéo chân.', 'Dễ hao hoặc mất lòng vì bạn bè, anh em.'],
    con: ['Hậu vận và con cái là chỗ yên lòng.', 'Hậu vận có thăng có trầm.', 'Con cái, hậu vận cần lo liệu sớm.'],
    viec: ['Có cửa cho công việc, thăng tiến.', 'Công việc có cơ hội nhưng nhiều thử thách.', 'Đường công việc hay kẹt, phải bền.'],
    tien: ['Có cửa kiếm tiền.', 'Tiền vào ra thất thường, được chỗ này mất chỗ kia.', 'Tiền khó vào, dễ hao.'],
    von: ['Vốn liếng giữ được, có thể làm lớn.', 'Vốn có nhưng phải tính kỹ khi bỏ ra.', 'Vốn dễ kẹt hoặc hao, đừng liều.'],
    tinh: ['Tình cảm, hợp tác dễ thành.', 'Tình cảm có duyên nhưng nhiều trục trặc nhỏ.', 'Tình cảm, hợp tác hay vướng, dễ hiểu lầm.'],
    khoe: ['Sức khỏe nhìn chung ổn.', 'Sức khỏe có lúc lên xuống, đừng chủ quan.', 'Cần để ý sức khỏe, nghỉ ngơi đủ.'],
    su: ['Bản thân sự việc đang thuận.', 'Sự việc có cả mặt lợi lẫn mặt vướng.', 'Bản thân sự việc đang gặp trở ngại.'],
    dt: ['Điều bạn cần (dụng thần) đang ở thế tốt.', 'Điều bạn cần có, nhưng không trọn vẹn.', 'Điều bạn cần đang bị cản.'] };
  function plain(r) {
    const i = r.verdict === 'Thuận' ? 0 : r.verdict === 'Kẹt' ? 2 : 1, base = (PLAIN[r.k] || PLAIN[r.k && r.k.startsWith('dt-') ? 'dt' : 'su'])[i];
    if (r.k === 'khoe') return base + (r.kong ? ' Sao bệnh rơi vào không vong: nếu có ốm thường nhẹ, mau qua.' : '');
    const kong = r.k === 'tinh' ? ' Nhưng đang rơi vào không vong: có duyên mà dễ lỡ, chưa nên chắc.' : ' Nhưng đang rơi vào không vong: chưa tới lúc, dễ hụt nếu vội.';
    return base + (r.kong ? kong : '') + (r.ma ? ' Có dịch mã: việc đang động, sắp có thay đổi.' : '');
  }

  /* ---------- Tóm tắt gửi AI: chỉ dữ liệu đã tính ---------- */
  function brief(c, mode, topic) {
    const P = c.pillars, L = [];
    L.push(`[KỲ MÔN ĐỘN GIÁP · BÀN ĐÃ TÍNH SẴN] Phương pháp: ${c.method}; giờ Việt Nam UTC+7. Thời điểm lập bàn: ${c.at}.`);
    L.push(`Tứ trụ: năm ${vi(P.year)}, tháng ${vi(P.month)}, ngày ${vi(P.day)}, giờ ${vi(P.hour)}. Tiết ${c.term.vi} (giao lúc ${c.term.at}). ${c.dun} độn ${c.ju} cục, ${c.yuan} nguyên (phù đầu ${vi(c.fuTou)}).`);
    L.push(`Tuần thủ ${vi(c.xun)} (nghi ${vi(c.yi)}). Trực phù: ${STAR_VI[c.zhifu.star]} tại cung ${c.zhifu.palace}. Trực sử: ${DOOR_VI[c.zhishi.door]} tại cung ${c.zhishi.palace}.`);
    for (const p of [1, 8, 3, 4, 9, 2, 7, 6, 5]) {
      const x = c.palaces[p];
      if (p === 5) { L.push(`- Cung 5 Trung cung: địa bàn ${vi(x.earth[0])} (gửi sang Khôn 2).`); continue; }
      const st = NGHIA.star[x.star][0], dr = NGHIA.door[x.door][0], gd = NGHIA.god[x.god][0];
      L.push(`- Cung ${p} ${x.name} (${x.dir}): thiên bàn ${x.sky.map(vi).join('+')}, địa bàn ${x.earth.map(vi).join('+')}; sao ${STAR_VI[x.star]}${x.qin ? ' (kèm Thiên Cầm)' : ''} [${st}]; cửa ${DOOR_VI[x.door]} [${dr}]; thần ${GOD_VI[x.god]} [${gd}]${x.kong.length ? '; KHÔNG VONG (' + x.kong.join(', ') + ')' : ''}${x.ma ? '; DỊCH MÃ' : ''}.`);
    }
    const r = roles(c, mode, topic);
    L.push((mode === 'menh' ? 'Vai trò trên mệnh bàn' : `Loại việc: ${(TOPICS[topic] || TOPICS.khac).name}. Dụng thần`) + ' (máy đã xác định cung và chấm nhanh, cửa là chính): ' + r.map(x => `${x.label} → cung ${x.palace}, máy chấm ${x.verdict.toUpperCase()}${x.kong ? ', không vong' : ''}${x.ma ? ', dịch mã' : ''}`).join('; ') + '.');
    const fy = []; if (c.fuyin.star) fy.push('sao phục ngâm'); if (c.fuyin.door) fy.push('cửa phục ngâm'); if (c.fanyin.star) fy.push('sao phản ngâm'); if (c.fanyin.door) fy.push('cửa phản ngâm');
    if (fy.length) L.push('Đặc biệt: ' + fy.join(', ') + '.');
    if (c.notes.length) L.push('Ghi chú an bàn: ' + c.notes.join(' '));
    return L.join('\n');
  }

  return { chart, chartAt, skyPalaceOf, roles, verdict, plain, brief, NGHIA, TOPICS, vi, xunOf, kongOf, PALACE, RING, STAR_VI, DOOR_VI, GOD_VI, GAN_VI, TERM_VI, STAR_HOME, DOOR_HOME, GODS, YI };
})();
if (typeof module !== 'undefined') module.exports = QM;
