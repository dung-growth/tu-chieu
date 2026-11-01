/* Tứ Chiếu — dò cách Tử vi (phú đoán) trên lá số đã an sao.
   Đầu vào: kết quả TC.tuvi(...) và năm sinh dương lịch. Đầu ra: các cách nổi bật, đường đi đại hạn, 3 năm tới.
   Nghĩa của từng cách viết theo cách hiểu phổ biến, giọng gợi mở; các trường phái có thể đọc khác nhau. */
const TVC = (() => {
  const BR = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];
  const MUT = ['Lộc','Quyền','Khoa','Kỵ'];
  const SANG = ['Miếu','Vượng','Đắc','Lợi'], TOI = ['Hạn','Hãm'];
  const TU_MO = ['Thìn','Tuất','Sửu','Mùi'];

  // Bản chất 14 chính tinh (dùng chung cho mọi cung)
  const STAR = {
    'Tử Vi': 'đế tinh: tự trọng, muốn làm chủ, có uy; cần người phò tá mới phát huy',
    'Thiên Cơ': 'sao mưu trí: nhanh, linh hoạt, nhiều kế hoạch, hay đổi ý; hợp tham mưu, kỹ thuật',
    'Thái Dương': 'sao cho đi và danh tiếng: hướng ngoại, quang minh; sáng thì nổi, tối thì vất vả, thành muộn',
    'Vũ Khúc': 'tài tinh: quyết đoán, thực tế, giỏi tiền bạc, tính cứng',
    'Thiên Đồng': 'phúc tinh: hòa nhã, thích an nhàn và hưởng thụ tinh thần, thường làm nên sau khó khăn',
    'Liêm Trinh': 'sao nguyên tắc: lý trí, tham vọng, giỏi tổ chức, mạnh về luật lệ, quy trình',
    'Thiên Phủ': 'sao kho: ổn định, giữ của, quản lý giỏi, hơi bảo thủ',
    'Thái Âm': 'sao tích lũy: tinh tế, nhạy cảm; sáng thì giàu bền, tối thì tiền bạc thất thường',
    'Tham Lang': 'sao đa tài đa dục: giao tế giỏi, ham học ham hưởng; miếu vượng thì phát lớn',
    'Cự Môn': 'sao lời nói: giỏi phân tích, tranh luận, ăn nói; dễ vướng thị phi vì một câu nói',
    'Thiên Tướng': 'ấn tinh: công bằng, làm trung gian, giúp người, trọng thể diện',
    'Thiên Lương': 'ấm tinh: che chở, cố vấn, nói lời phải, trọng đạo lý; thường thọ',
    'Thất Sát': 'tướng tinh: dũng, quyết, thích tự xông pha, đời nhiều biến động',
    'Phá Quân': 'sao phá cũ lập mới: không chịu khuôn khổ, dám làm, hao trước được sau'
  };
  const THAN_CU = {
    'Mệnh': 'Thân Mệnh đồng cung: trước sau như một, tự lập; đời ít đổi hướng, tốt xấu đều do chính mình tạo ra.',
    'Phúc Đức': 'Thân cư Phúc Đức: nửa đời sau gắn chặt với gốc gác, phúc phần dòng họ và đời sống tinh thần. Chuyện gia đạo, "trả nợ" cho nhà, mối quan tâm tâm linh thường tới sớm hơn người khác. Thường thọ, càng về sau càng biết sống cho mình.',
    'Quan Lộc': 'Thân cư Quan Lộc: lấy công việc làm thước đo bản thân; nửa đời sau thành hay bại phụ thuộc nhiều vào nghề.',
    'Tài Bạch': 'Thân cư Tài Bạch: trọng tiền bạc, giỏi tính toán; nửa đời sau xoay quanh chuyện kiếm và giữ tiền.',
    'Thiên Di': 'Thân cư Thiên Di: hay đi, hay đổi môi trường, dễ lập nghiệp xa quê; thành công nhờ quan hệ bên ngoài.',
    'Phu Thê': 'Thân cư Phu Thê: nửa đời sau chịu ảnh hưởng lớn từ người phối ngẫu và các mối quan hệ một-một; chọn bạn đời, chọn đối tác là quyết định lớn nhất.'
  };
  const MUT_MENH = {
    'Lộc': 'Hóa Lộc ở Mệnh: dễ có lộc, được lòng người, tiền và cơ hội tự tìm tới.',
    'Quyền': 'Hóa Quyền ở Mệnh: có tiếng nói, thích nắm việc, làm gì cũng muốn tự quyết.',
    'Khoa': 'Hóa Khoa ở Mệnh: được biết tới nhờ hiểu biết, chuyên môn; có tiếng tốt, dễ gặp người giúp.',
    'Kỵ': 'Hóa Kỵ ở Mệnh: hay tự làm khó mình, cố chấp, nhiều chuyện phải tự trải mới hiểu; bù lại rất bền.'
  };

  function tamPhuong(b) { const i = BR.indexOf(b); return { self: b, hop: [BR[(i + 4) % 12], BR[(i + 8) % 12]], xung: BR[(i + 6) % 12], giap: [BR[(i + 11) % 12], BR[(i + 1) % 12]] }; }

  function analyze(t, birthYear, nowYear) {
    const byB = {}, byName = {}, starAt = {};
    t.palaces.forEach(p => { byB[p.branch] = p; byName[p.name] = p;
      [...p.major, ...p.minor].forEach(s => starAt[s.name] = { b: p.branch, s }); p.adj.forEach(n => starAt[n] = starAt[n] || { b: p.branch, s: { name: n } }); });
    const has = (b, name) => !!byB[b] && [...byB[b].major, ...byB[b].minor].some(s => s.name === name) || (byB[b] && byB[b].adj.includes(name));
    const majors = b => byB[b] ? byB[b].major.map(s => s.name) : [];
    const bright = name => (starAt[name] && starAt[name].s.bright) || '';
    const pname = b => byB[b] ? byB[b].name : b;
    const M = t.menh, T = t.than, tpM = tamPhuong(M), tpCells = [M, ...tpM.hop, tpM.xung];
    const inTP = name => tpCells.some(b => has(b, name));
    const cach = []; const add = (name, where, text, w = 2) => cach.push({ name, where, text, w });

    // Mệnh và Thân
    const mStars = byB[M].major;
    if (!mStars.length) add('Mệnh vô chính diệu', `Mệnh tại ${M}`, `Mệnh không có chính tinh: dễ thích nghi, chịu ảnh hưởng nhiều từ cung xung chiếu (${pname(tpM.xung)}: ${majors(tpM.xung).join(', ') || 'cũng trống'}); đời nhiều thay đổi.${has(M, 'Tuần Không') || has(M, 'Triệt Lộ') || has(M, 'Địa Không') || has(M, 'Địa Kiếp') ? ' Có Tuần/Triệt hoặc Không Kiếp đóng Mệnh, sách xưa lại coi là cách tốt.' : ''}`, 3);
    mStars.forEach(s => { const lvl = SANG.includes(s.bright) ? 'sáng' : TOI.includes(s.bright) ? 'tối (hãm)' : 'bình';
      add(`Mệnh ${s.name}${s.bright ? ' ' + (s.bright === 'Hạn' ? 'Hãm' : s.bright) : ''}`, `Mệnh tại ${M}`, `${s.name} là ${STAR[s.name] || ''}. Ở đây sao ${lvl}${lvl.startsWith('tối') ? ': cái hay vẫn còn nhưng phải trả giá nhiều hơn' : ''}.`, 3);
      if (s.mut) add(`Mệnh có ${s.name} hóa ${s.mut}`, `Mệnh tại ${M}`, MUT_MENH[s.mut], 3); });
    const thanP = byB[T];
    if (THAN_CU[thanP.name]) add(thanP.name === 'Mệnh' ? 'Thân Mệnh đồng cung' : `Thân cư ${thanP.name}`, `Thân tại ${T}`, THAN_CU[thanP.name] + (thanP.major.length ? ` Chính tinh ở cung Thân: ${thanP.major.map(s => s.name).join(', ')}.` : ''), 3);

    // Tuần, Triệt (gộp khi cùng đóng một chỗ)
    const sameTT = t.tuan.join() === t.triet.join();
    (sameTT ? [['Tuần Triệt', t.tuan]] : [['Tuần', t.tuan], ['Triệt', t.triet]]).forEach(([n, pair]) => {
      const hitM = pair.includes(M), hitT = pair.includes(T);
      if (hitM || hitT) add(`${n} đóng ${hitM && hitT ? 'Mệnh và Thân' : hitM ? 'Mệnh' : 'Thân'}`, `${n} tại ${pair.join('–')}`,
        `${n} "chặn" những gì nằm dưới nó, chặn cả tốt lẫn xấu. Cái có sẵn ở ${hitM ? 'Mệnh' : 'cung Thân'} bị chặn một đoạn nên thời trẻ phải tự xoay, ít được che chở; người xưa nói "nghiệp tới sớm". ${n === 'Triệt' ? 'Triệt thường nặng ở nửa đầu đời, nhẹ dần sau khoảng 30 tuổi.' : n === 'Tuần' ? 'Tuần thường dai dẳng hơn nhưng nhẹ tay hơn Triệt.' : 'Tuần và Triệt cùng đóng một chỗ nên tác dụng chặn càng rõ; Triệt nặng ở nửa đầu đời, Tuần kéo dài hơn nhưng nhẹ tay hơn.'}`, 3); });

    // Các cách lớn theo tam phương tứ chính của Mệnh
    const cnt = names => names.filter(inTP).length;
    if (cnt(['Thất Sát', 'Phá Quân', 'Tham Lang']) === 3) add('Sát Phá Tham', 'tam phương Mệnh', 'Đời nhiều biến động, khai phá, phá cũ dựng mới; thăng trầm lớn. Hợp tự làm chủ, kinh doanh, những nghề phải xông pha.', 3);
    if (cnt(['Thất Sát', 'Phá Quân', 'Tham Lang']) < 3 && cnt(['Tử Vi', 'Thiên Phủ', 'Vũ Khúc', 'Thiên Tướng']) >= 3) add('Tử Phủ Vũ Tướng', 'tam phương Mệnh', 'Cách của sự ổn định và quyền chức: hợp tổ chức lớn, quản lý, tài chính; đời ít sóng gió hơn người.', 3);
    if (cnt(['Thiên Cơ', 'Thái Âm', 'Thiên Đồng', 'Thiên Lương']) >= 3) add('Cơ Nguyệt Đồng Lương', 'tam phương Mệnh', 'Người làm bằng đầu óc, hợp tổ chức, hệ thống, chuyên môn. Câu phú "Cơ Nguyệt Đồng Lương tác lại nhân": dễ làm người làm công, giữ vị trí chuyên môn, hành chính, kế hoạch.', 2);
    const coLuong = (has(M, 'Thiên Cơ') && has(M, 'Thiên Lương')) || (has(M, 'Thiên Lương') && has(tpM.xung, 'Thiên Cơ')) || (has(M, 'Thiên Cơ') && has(tpM.xung, 'Thiên Lương'));
    if (coLuong) add('Cơ Lương', 'Mệnh và cung xung chiếu', 'Sách nói "Cơ Lương gia hội, thiện đàm binh": giỏi bày mưu tính kế, vạch đường cho người khác. Mạnh nhất ở vai tham mưu, chiến lược, cố vấn.', 3);
    if ((has(M, 'Cự Môn') && inTP('Thái Dương')) || (has(M, 'Thái Dương') && inTP('Cự Môn'))) add('Cự Nhật', 'tam phương Mệnh', 'Lời nói có sức nặng: hợp nghề dùng lời như luật, dạy học, truyền thông, bán hàng tư vấn. Thái Dương sáng thì nói ra được người nghe, tối thì phải nói nhiều mới được tin.', 2);
    const tuPhu = BR.find(b => has(b, 'Tử Vi') && has(b, 'Thiên Phủ'));
    if (tuPhu) add('Tử Phủ đồng cung', `cung ${pname(tuPhu)}`, tuPhu === M ? 'Tử Phủ cùng đóng Mệnh: phú quý, có uy, sống đàng hoàng; cần Tả Hữu, Khôi Việt mới phát hết.' : `Đế tinh và kho cùng nằm ở cung ${pname(tuPhu)}: phần đời ứng với cung này được che chở, vững vàng.`, tuPhu === M ? 3 : 1);

    // Nhật Nguyệt
    const nB = starAt['Thái Dương'] && starAt['Thái Dương'].b, tB = starAt['Thái Âm'] && starAt['Thái Âm'].b;
    if (nB && tB && (tpCells.includes(nB) || tpCells.includes(tB))) {
      const ns = bright('Thái Dương'), ts = bright('Thái Âm');
      if (TOI.includes(ns) && TOI.includes(ts)) add('Nhật Nguyệt phản bối', `Thái Dương ở ${pname(nB)}, Thái Âm ở ${pname(tB)}`, 'Mặt Trời và Mặt Trăng cùng tối: "khó trước, thành sau". Đi làm công dễ bỏ sức nhiều mà tiếng không tương xứng, tiền vào ra thất thường. Hóa giải quen thuộc là làm ngược số đông: làm với nước ngoài, làm ca khác, làm hậu trường, làm sản phẩm của riêng mình.', 3);
      else if (SANG.includes(ns) && SANG.includes(ts)) add('Nhật Nguyệt tịnh minh', `Thái Dương ở ${pname(nB)}, Thái Âm ở ${pname(tB)}`, 'Mặt Trời và Mặt Trăng cùng sáng: đời sáng sủa, dễ được nâng đỡ, danh và lợi đều thuận.', 3);
    }

    // Sát tinh và cát tinh quanh Mệnh
    if (has(M, 'Kình Dương')) add('Kình Dương ở Mệnh', `Mệnh tại ${M}`, TU_MO.includes(M) ? 'Kình Dương đắc địa: quả quyết, dám nói dám cắt; hiền với người nhưng không nhân nhượng với việc làm ẩu.' : 'Kình Dương không đắc địa: nóng, thẳng, dễ va chạm; nên học cách hạ giọng trước khi quyết.', 2);
    if (has(M, 'Đà La')) add('Đà La ở Mệnh', `Mệnh tại ${M}`, TU_MO.includes(M) ? 'Đà La đắc địa: lì, bền, theo việc tới cùng.' : 'Đà La: hay chậm, dây dưa, nghĩ đi nghĩ lại; được cái bền.', 2);
    if (has(M, 'Hỏa Tinh') || has(M, 'Linh Tinh')) add('Hỏa Linh ở Mệnh', `Mệnh tại ${M}`, 'Tính nhanh, nóng, bộc phát; làm việc theo cơn cảm hứng.', 1);
    [[M, 'Mệnh'], [T, 'Thân']].forEach(([b, lbl]) => { if (b === M && lbl === 'Thân') return;
      if (has(b, 'Địa Không') || has(b, 'Địa Kiếp')) add(`Không Kiếp ở ${lbl}`, `${lbl} tại ${b}`, 'Nghĩ khác người, lúc lên lúc xuống, tiền đến nhanh đi nhanh. Hợp nghề sáng tạo, công nghệ, nghiên cứu, tâm linh; không hợp đầu cơ.', 2); });
    if (has(M, 'Lộc Tồn')) add('Lộc Tồn ở Mệnh, Kình Đà giáp', `Mệnh tại ${M}`, 'Có lộc ăn, cẩn trọng, biết giữ của; bị Kình Đà kẹp hai bên nên hay lo nghĩ, ít người chia sẻ.', 2);
    const pair = (a, b, label, text) => {
      if ((has(tpM.giap[0], a) && has(tpM.giap[1], b)) || (has(tpM.giap[0], b) && has(tpM.giap[1], a))) add(`${label} giáp Mệnh`, 'hai cung kề Mệnh', text + ' Hai bên Mệnh có người đỡ.', 2);
      else if (inTP(a) && inTP(b)) add(`${label} chiếu Mệnh`, 'tam phương Mệnh', text, 2);
      else if (inTP(a) || inTP(b)) add(`${inTP(a) ? a : b} chiếu Mệnh`, 'tam phương Mệnh', text, 1);
    };
    pair('Tả Phù', 'Hữu Bật', 'Tả Hữu', 'Được giúp đỡ, có người phò, làm việc nhóm tốt.');
    pair('Văn Xương', 'Văn Khúc', 'Xương Khúc', 'Văn chương, học hành, chữ nghĩa; giỏi diễn đạt.');
    pair('Thiên Khôi', 'Thiên Việt', 'Khôi Việt', 'Quý nhân, dễ được người trên nâng đỡ, thuận thi cử, thăng tiến.');
    const tpT = tamPhuong(T);
    if (T !== M && ['Văn Xương', 'Văn Khúc'].every(n => [T, ...tpT.hop].some(b => has(b, n)))) add('Xương Khúc hội Thân', `cung Thân tại ${T}`, 'Bộ sao văn chương hội về cung Thân: nửa đời sau sống bằng chữ nghĩa, học thuật; đọc, viết, học là cách hồi phục.', 2);
    const tm = starAt['Thiên Mã'] && starAt['Thiên Mã'].b;
    if (tm && (has(tm, 'Lộc Tồn') || [...byB[tm].major, ...byB[tm].minor].some(s => s.mut === 'Lộc'))) add('Lộc Mã giao trì', `cung ${pname(tm)}`, 'Thiên Mã gặp Lộc: đi xa mà phát, tiền đến từ di chuyển, buôn bán, làm việc nhiều nơi.', 2);
    if (has(M, 'Long Trì') && has(M, 'Phụng Các')) add('Long Phượng ở Mệnh', `Mệnh tại ${M}`, 'Tài hoa, nhạy với cái đẹp, chuộng sự chỉn chu và đồ có gu.', 1);
    if (has(M, 'Hoa Cái')) add('Hoa Cái ở Mệnh', `Mệnh tại ${M}`, 'Có phong thái riêng; thích không gian riêng, dễ hợp nghệ thuật, tôn giáo, học thuật.', 1);
    const dao = ['Hồng Loan', 'Thiên Hỷ', 'Hàm Trì', 'Thiên Diêu'].filter(n => has(M, n));
    if (dao.length) add('Sao đào hoa ở Mệnh', `Mệnh có ${dao.join(', ')}`, 'Có duyên, dễ được để ý, nhiều khi không tự biết.', 1);

    // Tứ hóa gốc rơi vào các cung khác
    t.palaces.forEach(p => [...p.major, ...p.minor].forEach(s => {
      if (!s.mut || p.branch === M) return;
      const key = p.name;
      if (s.mut === 'Lộc' && ['Tài Bạch', 'Điền Trạch', 'Quan Lộc'].includes(key)) add(`${s.name} hóa Lộc ở ${key}`, `cung ${key}`, key === 'Điền Trạch' ? 'Kho tiền thật nằm ở nhà đất, tài sản cố định: tiền để trong ví thì bay, đổ vào tài sản thì ở lại.' : key === 'Tài Bạch' ? 'Tiền có nguồn, dễ kiếm.' : 'Nghề nghiệp có lộc, việc mang lại tiền.', 2);
      if (s.mut === 'Kỵ' && ['Phu Thê', 'Tài Bạch', 'Quan Lộc', 'Thiên Di', 'Phúc Đức'].includes(key)) add(`${s.name} hóa Kỵ ở ${key}`, `cung ${key}`, `Điểm vướng của đời nằm ở cung ${key}: chuyện ở đây hay phải làm đi làm lại, cần nhiều kiên nhẫn.${['Văn Khúc', 'Văn Xương', 'Cự Môn'].includes(s.name) ? ' Sao này hóa Kỵ thì vướng ở lời nói, giấy tờ.' : ''}`, 2);
    }));

    // Đường đi đại hạn
    const decades = t.palaces.filter(p => p.decadal).map(p => ({ p, a: p.decadal[0], b: p.decadal[1] })).sort((x, y) => x.a - y.a).map(({ p, a, b }) => {
      const y1 = birthYear + a - 1, y2 = birthYear + b - 1;
      let mut = []; try { mut = t.horo(y1 + 1).decadalMut || []; } catch (e) {}
      const land = mut.map((name, k) => { const at = starAt[name]; const gocSame = at && at.s.mut === MUT[k];
        return { hoa: MUT[k], star: name, palace: at ? pname(at.b) : '?', song: !!gocSame, inSelf: at && at.b === p.branch }; });
      const tp = tamPhuong(p.branch), cells = [p.branch, ...tp.hop, tp.xung], inD = n => cells.some(b => has(b, n));
      const pattern = ['Thất Sát', 'Phá Quân', 'Tham Lang'].every(inD) ? 'Sát Phá Tham' : ['Tử Vi', 'Thiên Phủ', 'Vũ Khúc', 'Thiên Tướng'].filter(inD).length >= 3 ? 'Tử Phủ Vũ Tướng'
        : ['Thiên Cơ', 'Thái Âm', 'Thiên Đồng', 'Thiên Lương'].filter(inD).length >= 3 ? 'Cơ Nguyệt Đồng Lương' : '';
      return { range: [a, b], years: [y1, y2], palace: p.name, gz: p.stem + ' ' + p.branch, major: p.major.map(s => s.name + (s.bright ? ` (${s.bright === 'Hạn' ? 'hãm' : s.bright.toLowerCase()})` : '')),
        mut: land, pattern, tuanTriet: [t.tuan.includes(p.branch) ? 'Tuần' : '', t.triet.includes(p.branch) ? 'Triệt' : ''].filter(Boolean),
        current: nowYear >= y1 && nowYear <= y2 };
    });

    // 3 năm tới
    const TAM_TAI = [['Thân','Tý','Thìn','Dần Mão Thìn'], ['Dần','Ngọ','Tuất','Thân Dậu Tuất'], ['Hợi','Mão','Mùi','Tỵ Ngọ Mùi'], ['Tỵ','Dậu','Sửu','Hợi Tý Sửu']];
    const birthChi = t.lunarYearGZ.split(' ')[1], tt = TAM_TAI.find(g => g.includes(birthChi))[3].split(' ');
    const years = [0, 1, 2].map(k => { const y = nowYear + k; let h; try { h = t.horo(y); } catch (e) { return null; }
      const dec = decades.find(d => y >= d.years[0] && y <= d.years[1]);
      const land = h.yearlyMut.map((name, i) => { const at = starAt[name]; const goc = at && at.s.mut ? at.s.mut : '';
        const decHit = dec && dec.mut.find(m => m.palace === (at ? pname(at.b) : '?') && m.hoa === 'Kỵ');
        return { hoa: MUT[i], star: name, palace: at ? pname(at.b) : '?', chong: MUT[i] === 'Kỵ' && (goc === 'Kỵ' || (at && byB[at.b] && [...byB[at.b].major, ...byB[at.b].minor].some(s => s.mut === 'Kỵ')) || !!decHit) }; });
      return { year: y, gz: h.gz, age: h.age, luuNien: pname(h.yearly), tieuHan: pname(h.tieuHan), veMenh: h.yearly === M, mut: land, tamTai: tt.includes(h.gz.split(' ')[1]) };
    }).filter(Boolean);

    cach.sort((a, b) => b.w - a.w);
    return { cach, decades, years };
  }

  // Tóm tắt gửi cho AI
  function brief(A) {
    const L = ['[TỬ VI: CÁC CÁCH ĐÃ DÒ TRÊN LÁ SỐ] (chỉ dùng những cách này, gọi đúng tên)'];
    A.cach.forEach(c => L.push(`- ${c.name} (${c.where}): ${c.text}`));
    L.push('[TỬ VI: ĐƯỜNG ĐI ĐẠI HẠN] (tuổi âm)');
    const ci = A.decades.findIndex(d => d.current);
    A.decades.slice(Math.max(0, ci - 1), ci < 0 ? 4 : ci + 4).forEach(d => L.push(`- ${d.range[0]}–${d.range[1]} tuổi (${d.years[0]}–${d.years[1]})${d.current ? ' ← HIỆN TẠI' : ''}: cung ${d.palace} (${d.gz}), chính tinh ${d.major.join(', ') || 'vô chính diệu'}${d.pattern ? `, tam phương thành cách ${d.pattern}` : ''}${d.tuanTriet.length ? `, có ${d.tuanTriet.join(' và ')}` : ''}. Tứ hóa đại hạn: ${d.mut.map(m => `${m.star} hóa ${m.hoa} vào ${m.palace}${m.song ? ' (SONG ' + m.hoa.toUpperCase() + ', trùng tứ hóa gốc)' : ''}${m.inSelf ? ' (ngay cung đại hạn)' : ''}`).join('; ')}.`));
    L.push('[TỬ VI: 3 NĂM TỚI]');
    A.years.forEach(y => L.push(`- ${y.year} ${y.gz} (${y.age} tuổi âm): lưu niên ở ${y.luuNien}${y.veMenh ? ' (lưu niên về đúng cung Mệnh)' : ''}, tiểu hạn ở ${y.tieuHan}${y.tamTai ? ', năm Tam Tai' : ''}. Lưu tứ hóa: ${y.mut.map(m => `${m.star} hóa ${m.hoa} vào ${m.palace}${m.chong ? ' (KỴ CHỒNG KỴ)' : ''}`).join('; ')}.`));
    return L.join('\n');
  }
  return { analyze, brief, STAR };
})();
if (typeof module !== 'undefined') module.exports = TVC;
