/* Tứ Chiếu — compute core. Needs globals: Solar (lunar-javascript), Astronomy (astronomy-engine), iztro. */
const TC = (() => {
  const CAN = { '甲':'Giáp','乙':'Ất','丙':'Bính','丁':'Đinh','戊':'Mậu','己':'Kỷ','庚':'Canh','辛':'Tân','壬':'Nhâm','癸':'Quý' };
  const CHI = { '子':'Tý','丑':'Sửu','寅':'Dần','卯':'Mão','辰':'Thìn','巳':'Tỵ','午':'Ngọ','未':'Mùi','申':'Thân','酉':'Dậu','戌':'Tuất','亥':'Hợi' };
  const HANH = { '金':'Kim','木':'Mộc','水':'Thủy','火':'Hỏa','土':'Thổ' };
  const THAPTHAN = { '比肩':'Tỷ Kiên','劫财':'Kiếp Tài','食神':'Thực Thần','伤官':'Thương Quan','偏财':'Thiên Tài','正财':'Chính Tài','七杀':'Thất Sát','正官':'Chính Quan','偏印':'Thiên Ấn','正印':'Chính Ấn','日主':'Nhật chủ' };
  const NAPAM = {
    '海中金':'Hải Trung Kim','炉中火':'Lư Trung Hỏa','大林木':'Đại Lâm Mộc','路旁土':'Lộ Bàng Thổ','剑锋金':'Kiếm Phong Kim','山头火':'Sơn Đầu Hỏa',
    '涧下水':'Giản Hạ Thủy','城头土':'Thành Đầu Thổ','白蜡金':'Bạch Lạp Kim','杨柳木':'Dương Liễu Mộc','泉中水':'Tuyền Trung Thủy','屋上土':'Ốc Thượng Thổ',
    '霹雳火':'Tích Lịch Hỏa','松柏木':'Tùng Bách Mộc','长流水':'Trường Lưu Thủy','砂中金':'Sa Trung Kim','沙中金':'Sa Trung Kim','山下火':'Sơn Hạ Hỏa','平地木':'Bình Địa Mộc',
    '壁上土':'Bích Thượng Thổ','金箔金':'Kim Bạch Kim','覆灯火':'Phú Đăng Hỏa','天河水':'Thiên Hà Thủy','大驿土':'Đại Trạch Thổ','大泽土':'Đại Trạch Thổ','钗钏金':'Thoa Xuyến Kim',
    '桑柘木':'Tang Đố Mộc','大溪水':'Đại Khê Thủy','沙中土':'Sa Trung Thổ','砂中土':'Sa Trung Thổ','天上火':'Thiên Thượng Hỏa','石榴木':'Thạch Lựu Mộc','大海水':'Đại Hải Thủy'
  };
  const CAN_HANH = { 'Giáp':'Mộc','Ất':'Mộc','Bính':'Hỏa','Đinh':'Hỏa','Mậu':'Thổ','Kỷ':'Thổ','Canh':'Kim','Tân':'Kim','Nhâm':'Thủy','Quý':'Thủy' };
  const CHI_HANH = { 'Tý':'Thủy','Sửu':'Thổ','Dần':'Mộc','Mão':'Mộc','Thìn':'Thổ','Tỵ':'Hỏa','Ngọ':'Hỏa','Mùi':'Thổ','Thân':'Kim','Dậu':'Kim','Tuất':'Thổ','Hợi':'Thủy' };
  const tr = (s, map) => s.split('').map(c => map[c] || c).join(' ').trim();
  const gz = s => (CAN[s[0]] || s[0]) + ' ' + (CHI[s[1]] || s[1]);

  /* ---------- Thần số học (quy ước phổ biến tại VN) ---------- */
  const LETTER = {}; 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((c, i) => LETTER[c] = (i % 9) + 1);
  const strip = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase().replace(/[^A-Z ]/g, '');
  const digitSum = n => String(n).split('').reduce((a, d) => a + (+d || 0), 0);
  const reduce = (n, keep = [11, 22, 33]) => { while (n > 9 && !keep.includes(n)) n = digitSum(n); return n; };
  const reduceLP = n => { while (n > 11 && n !== 22 && n !== 33) n = digitSum(n); return n; };
  function numerology(name, d, m, y, nowYear) {
    const nm = strip(name); const letters = nm.replace(/ /g, '').split('');
    const isV = (c, i, arr) => 'AEIOU'.includes(c) || (c === 'Y' && !'AEIOU'.includes(arr[i - 1] || '') && !'AEIOU'.includes(arr[i + 1] || ''));
    let expr = 0, soul = 0, pers = 0;
    nm.split(' ').filter(Boolean).forEach(w => { const a = w.split(''); a.forEach((c, i) => { const v = LETTER[c]; expr += v; if (isV(c, i, a)) soul += v; else pers += v; }); });
    const allDigits = digitSum(d) + digitSum(m) + digitSum(y);
    const lifePath = reduceLP(allDigits);
    const expression = reduce(expr), soulN = reduce(soul), personality = reduce(pers);
    const maturity = reduce(lifePath + expression);
    const birthday = reduce(d);
    const attitude = reduce(digitSum(d) + digitSum(m));
    const py = yy => reduce(digitSum(d) + digitSum(m) + digitSum(yy), []);
    const personalYears = [0, 1, 2].map(k => ({ year: nowYear + k, n: py(nowYear + k) }));
    // biểu đồ ngày sinh: đếm chữ số 1-9
    const grid = {}; for (let i = 1; i <= 9; i++) grid[i] = 0;
    (String(d) + String(m) + String(y)).split('').forEach(c => { if (+c) grid[+c]++; });
    // đỉnh cao (kim tự tháp)
    const lpShort = lifePath > 9 && lifePath !== 11 && lifePath !== 22 && lifePath !== 33 ? digitSum(lifePath) : lifePath;
    const firstPeakAge = 36 - reduce(lifePath, []);
    const rd = reduce(d, []), rm = reduce(m, []), ry = reduce(digitSum(y), []);
    const peaks = [reduce(rd + rm), reduce(rd + ry), 0, reduce(rm + ry)];
    peaks[2] = reduce(peaks[0] + peaks[1]);
    const ages = [firstPeakAge, firstPeakAge + 9, firstPeakAge + 18, firstPeakAge + 27];
    // thử thách (lấy hiệu, không giữ số chủ đạo)
    const r1 = n => reduce(n, []);
    const ch = [Math.abs(r1(d) - r1(m)), Math.abs(r1(d) - r1(digitSum(y))), 0, Math.abs(r1(m) - r1(digitSum(y)))];
    ch[2] = Math.abs(ch[0] - ch[1]);
    // nợ nghiệp: 13, 14, 16, 19 xuất hiện trong các bước rút gọn
    const steps = n => { const a = [n]; while (n > 9) { n = digitSum(n); a.push(n); } return a; };
    const DEBT = [13, 14, 16, 19], debts = [];
    [['Ngày sinh', [d]], ['Đường đời', steps(allDigits)], ['Sứ mệnh', steps(expr)], ['Linh hồn', steps(soul)], ['Nhân cách', steps(pers)]]
      .forEach(([where, arr]) => arr.filter(v => DEBT.includes(v)).forEach(v => debts.push({ n: v, where })));
    // đam mê ẩn: con số xuất hiện nhiều nhất trong tên
    const nameGrid = {}; for (let i = 1; i <= 9; i++) nameGrid[i] = 0;
    letters.forEach(c => nameGrid[LETTER[c]]++);
    const maxN = Math.max(...Object.values(nameGrid));
    const passion = maxN ? Object.keys(nameGrid).filter(k => nameGrid[k] === maxN).map(Number) : [];
    const now = new Date(), curMonth = now.getMonth() + 1;
    const personalMonth = reduce(py(nowYear) + curMonth, []);
    // mũi tên trên biểu đồ (đủ cả 3 số = mũi tên đầy, thiếu cả 3 = mũi tên trống)
    const ARROWS = [[[1,2,3],'Kế hoạch',null],[[4,5,6],'Ý chí','Uất giận'],[[7,8,9],'Hoạt động','Thụ động'],[[3,6,9],'Trí tuệ','Trí nhớ ngắn hạn'],
      [[2,5,8],'Cân bằng cảm xúc','Nhạy cảm'],[[1,4,7],'Thực tế','Thiếu trật tự'],[[1,5,9],'Quyết tâm','Trì hoãn'],[[3,5,7],'Tâm linh','Hoài nghi']];
    const arrowsOf = g => ARROWS.map(([nums, full, empty]) => nums.every(k => g[k]) ? { nums, kind: 'full', name: full } : (empty && nums.every(k => !g[k]) ? { nums, kind: 'empty', name: empty } : null)).filter(Boolean);
    const both = {}; for (let i = 1; i <= 9; i++) both[i] = grid[i] + nameGrid[i];
    const yearCycle = py(nowYear);
    return { name: nm, lifePath, expression, soul: soulN, personality, maturity, birthday, attitude, personalYears, grid, peaks: peaks.map((p, i) => ({ age: ages[i], year: y + ages[i], n: p })), lpShort,
      challenges: ch.map(r1), debts, passion, personalMonth: { month: curMonth, n: personalMonth }, nameGrid, bothGrid: both,
      arrows: arrowsOf(grid), arrowsBoth: arrowsOf(both), yearCycle };
  }

  /* ---------- Bát tự ---------- */
  const DISHI = { '长生':'Trường Sinh','沐浴':'Mộc Dục','冠带':'Quan Đới','临官':'Lâm Quan','帝旺':'Đế Vượng','衰':'Suy','病':'Bệnh','死':'Tử','墓':'Mộ','绝':'Tuyệt','胎':'Thai','养':'Dưỡng' };
  const BR = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];
  const TRIO = b => [['Thân','Tý','Thìn'],['Dần','Ngọ','Tuất'],['Tỵ','Dậu','Sửu'],['Hợi','Mão','Mùi']].findIndex(g => g.includes(b));
  // Thần sát phổ biến. byStem: tra theo can ngày; byTrio: tra theo nhóm tam hợp của chi năm và chi ngày
  const SHENSHA = [
    ['Thiên Ất Quý Nhân', 'stem', { 'Giáp':['Sửu','Mùi'],'Mậu':['Sửu','Mùi'],'Canh':['Sửu','Mùi'],'Ất':['Tý','Thân'],'Kỷ':['Tý','Thân'],'Bính':['Hợi','Dậu'],'Đinh':['Hợi','Dậu'],'Nhâm':['Tỵ','Mão'],'Quý':['Tỵ','Mão'],'Tân':['Ngọ','Dần'] }, 'Quý nhân phù trợ, gặp khó có người giúp'],
    ['Văn Xương', 'stem', { 'Giáp':['Tỵ'],'Ất':['Ngọ'],'Bính':['Thân'],'Đinh':['Dậu'],'Mậu':['Thân'],'Kỷ':['Dậu'],'Canh':['Hợi'],'Tân':['Tý'],'Nhâm':['Dần'],'Quý':['Mão'] }, 'Thông minh, học hành, chữ nghĩa'],
    ['Lộc Thần', 'stem', { 'Giáp':['Dần'],'Ất':['Mão'],'Bính':['Tỵ'],'Mậu':['Tỵ'],'Đinh':['Ngọ'],'Kỷ':['Ngọ'],'Canh':['Thân'],'Tân':['Dậu'],'Nhâm':['Hợi'],'Quý':['Tý'] }, 'Lộc ăn, nguồn thu ổn định'],
    ['Dương Nhận', 'stem', { 'Giáp':['Mão'],'Bính':['Ngọ'],'Mậu':['Ngọ'],'Canh':['Dậu'],'Nhâm':['Tý'] }, 'Cương quyết, mạnh tay, dễ nóng'],
    ['Đào Hoa', 'trio', ['Dậu','Mão','Ngọ','Tý'], 'Duyên dáng, dễ được mến, chuyện tình cảm'],
    ['Dịch Mã', 'trio', ['Dần','Thân','Hợi','Tỵ'], 'Hay di chuyển, thay đổi chỗ ở, chỗ làm'],
    ['Hoa Cái', 'trio', ['Thìn','Tuất','Sửu','Mùi'], 'Nghệ thuật, tôn giáo, thích một mình'],
    ['Kiếp Sát', 'trio', ['Tỵ','Hợi','Dần','Thân'], 'Biến động bất ngờ, cần cẩn trọng tiền bạc'],
  ];
  const STEM_ORDER = ['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'];
  function shensha(pillars) {
    const dm = pillars[2].can; const out = pillars.map(() => []);
    const roots = [pillars[0].chi, pillars[2].chi];
    SHENSHA.forEach(([name, kind, table, note]) => {
      let targets = [];
      if (kind === 'stem') targets = table[dm] || [];
      else roots.forEach(r => { const g = TRIO(r); if (g >= 0) targets.push(table[g]); });
      pillars.forEach((p, i) => { if (p && targets.includes(p.chi) && !out[i].some(x => x.name === name)) out[i].push({ name, note }); });
    });
    // Nguyệt Đức: theo chi tháng, xét thiên can các trụ
    const nd = ['Nhâm','Bính','Canh','Giáp'][TRIO(pillars[1].chi)];
    pillars.forEach((p, i) => { if (p && p.can === nd) out[i].push({ name: 'Nguyệt Đức', note: 'Phúc đức, gặp dữ hóa lành' }); });
    return out;
  }
  // Thân vượng hay nhược: cách đếm đơn giản (can 1 điểm, tàng can 0,6/0,3/0,1, chi tháng nhân 2)
  const GEN = { 'Mộc':'Hỏa','Hỏa':'Thổ','Thổ':'Kim','Kim':'Thủy','Thủy':'Mộc' };
  const MOTHER = Object.fromEntries(Object.entries(GEN).map(([a, b]) => [b, a]));
  const CTRL = { 'Mộc':'Thổ','Thổ':'Thủy','Thủy':'Hỏa','Hỏa':'Kim','Kim':'Mộc' };
  function strength(pillars) {
    const dmH = pillars[2].canHanh, sc = { 'Kim': 0, 'Mộc': 0, 'Thủy': 0, 'Hỏa': 0, 'Thổ': 0 };
    const W = [[1], [0.6, 0.4], [0.6, 0.3, 0.1]];
    pillars.forEach((p, i) => {
      if (!p) return;
      if (i !== 2) sc[p.canHanh] += 1;
      const w = W[p.tangCan.length - 1] || W[2], k = i === 1 ? 2 : 1;
      p.tangCan.forEach((g, j) => sc[CAN_HANH[g]] += w[j] * k);
    });
    const total = Object.values(sc).reduce((a, b) => a + b, 0);
    const support = sc[dmH] + sc[MOTHER[dmH]], ratio = support / total;
    const monthH = CHI_HANH[pillars[1].chi], deLenh = monthH === dmH || monthH === MOTHER[dmH];
    const level = ratio >= 0.56 ? 'Thân vượng' : ratio <= 0.44 ? 'Thân nhược' : 'Trung hòa';
    const controller = Object.keys(CTRL).find(k => CTRL[k] === dmH);
    const help = level === 'Thân vượng' ? [GEN[dmH], CTRL[dmH], controller]
      : level === 'Thân nhược' ? [MOTHER[dmH], dmH] : [];
    return { ratio: +(ratio * 100).toFixed(0), level, deLenh, monthH, support: +support.toFixed(1), total: +total.toFixed(1), score: sc, help: [...new Set(help)] };
  }
  // Hợp, xung, hình, hại giữa các chi (và can) — list: [{label, b}] với b là can hoặc chi
  const PAIRS = {
    'Lục hợp': [['Tý','Sửu'],['Dần','Hợi'],['Mão','Tuất'],['Thìn','Dậu'],['Tỵ','Thân'],['Ngọ','Mùi']],
    'Lục xung': [['Tý','Ngọ'],['Sửu','Mùi'],['Dần','Thân'],['Mão','Dậu'],['Thìn','Tuất'],['Tỵ','Hợi']],
    'Lục hại': [['Tý','Mùi'],['Sửu','Ngọ'],['Dần','Tỵ'],['Mão','Thìn'],['Thân','Hợi'],['Dậu','Tuất']],
    'Tương hình': [['Dần','Tỵ'],['Tỵ','Thân'],['Dần','Thân'],['Sửu','Tuất'],['Tuất','Mùi'],['Sửu','Mùi'],['Tý','Mão'],['Thìn','Thìn'],['Ngọ','Ngọ'],['Dậu','Dậu'],['Hợi','Hợi']]
  };
  const STEM_PAIRS = { 'Thiên can hợp': [['Giáp','Kỷ'],['Ất','Canh'],['Bính','Tân'],['Đinh','Nhâm'],['Mậu','Quý']], 'Thiên can xung': [['Giáp','Canh'],['Ất','Tân'],['Bính','Nhâm'],['Đinh','Quý']] };
  const same = (a, b, x, y) => (a === x && b === y) || (a === y && b === x);
  function relations(items) { // items: [{label, can, chi}]
    const out = [];
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const A = items[i], B = items[j]; if (!A || !B) continue;
      for (const [k, list] of Object.entries(PAIRS)) if (list.some(([x, y]) => same(A.chi, B.chi, x, y))) out.push({ kind: k, text: `${A.chi} (${A.label}) – ${B.chi} (${B.label})` });
      for (const [k, list] of Object.entries(STEM_PAIRS)) if (A.can && B.can && list.some(([x, y]) => same(A.can, B.can, x, y))) out.push({ kind: k, text: `${A.can} (${A.label}) – ${B.can} (${B.label})` });
    }
    // tam hợp (đủ 3) và bán hợp (2 chi có chi giữa)
    [['Thân','Tý','Thìn','Thủy'],['Dần','Ngọ','Tuất','Hỏa'],['Tỵ','Dậu','Sửu','Kim'],['Hợi','Mão','Mùi','Mộc']].forEach(([a, mid, c, h]) => {
      const has = x => items.filter(it => it && it.chi === x).map(it => it.label);
      const A = has(a), M = has(mid), C = has(c);
      if (A.length && M.length && C.length) out.push({ kind: 'Tam hợp', text: `${a}–${mid}–${c} hóa ${h}` });
      else if (M.length && (A.length || C.length)) out.push({ kind: 'Bán hợp', text: `${A.length ? a : c}–${mid} (${h})` });
    });
    return out;
  }
  function yearGZ(yy) { const s = Solar.fromYmd(yy, 6, 1).getLunar().getYearInGanZhi(); return { can: CAN[s[0]], chi: CHI[s[1]] }; }
  function bazi(y, mo, d, h, mi, gender) {
    const lunar = Solar.fromYmdHms(y, mo, d, h, mi, 0).getLunar();
    const e = lunar.getEightChar();
    const cols = ['Year', 'Month', 'Day', 'Time'];
    const pillars = cols.map(c => {
      const s = e['get' + c]();
      const hide = e['get' + c + 'HideGan']().map(g => CAN[g]);
      return {
        can: CAN[s[0]], chi: CHI[s[1]],
        canHanh: CAN_HANH[CAN[s[0]]], chiHanh: CHI_HANH[CHI[s[1]]],
        thapThanCan: THAPTHAN[e['get' + c + 'ShiShenGan']()] || '',
        tangCan: hide,
        thapThanChi: e['get' + c + 'ShiShenZhi']().map(x => THAPTHAN[x] || x),
        napAm: NAPAM[e['get' + c + 'NaYin']()] || e['get' + c + 'NaYin'](),
        truongSinh: DISHI[e['get' + c + 'DiShi']()] || ''
      };
    });
    const xk = e.getDayXunKong(); const khongVong = [CHI[xk[0]], CHI[xk[1]]];
    const count = { 'Kim': 0, 'Mộc': 0, 'Thủy': 0, 'Hỏa': 0, 'Thổ': 0 };
    const countFull = { 'Kim': 0, 'Mộc': 0, 'Thủy': 0, 'Hỏa': 0, 'Thổ': 0 };
    pillars.forEach(p => {
      count[p.canHanh]++; count[p.chiHanh]++;
      countFull[p.canHanh] += 1; countFull[p.chiHanh] += 1;
      p.tangCan.forEach((g, i) => countFull[CAN_HANH[g]] += i === 0 ? 0.5 : 0.25);
    });
    const yun = e.getYun(gender === 'nam' ? 1 : 0);
    const daiVan = yun.getDaYun().slice(1, 10).map(dy => {
      const s = dy.getGanZhi(); const canV = CAN[s[0]];
      return { startYear: dy.getStartYear(), endYear: dy.getEndYear(), age: dy.getStartAge(), gz: gz(s), thapThan: tenGodOf(pillars[2].can, canV) };
    });
    const nowY = new Date().getFullYear();
    const years = [0, 1, 2].map(k => {
      const yy = nowY + k; const l2 = Solar.fromYmd(yy, 6, 1).getLunar(); const s = l2.getYearInGanZhi();
      return { year: yy, gz: gz(s), thapThan: tenGodOf(pillars[2].can, CAN[s[0]]) };
    });
    return {
      pillars, dayMaster: pillars[2].can, dayMasterHanh: pillars[2].canHanh, count, countFull,
      lunarDate: { d: lunar.getDay(), m: lunar.getMonth(), y: lunar.getYear(), yearGZ: gz(lunar.getYearInGanZhi()) },
      startYun: { y: yun.getStartYear(), m: yun.getStartMonth() }, daiVan, years,
      khongVong, shensha: shensha(pillars), strength: strength(pillars),
      relations: relations(pillars.map((p, i) => ({ label: ['năm','tháng','ngày','giờ'][i], can: p.can, chi: p.chi })))
    };
  }
  const STEMS = ['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'];
  const ORDER = ['Mộc','Hỏa','Thổ','Kim','Thủy'];
  function tenGodOf(dm, other) {
    const a = STEMS.indexOf(dm), b = STEMS.indexOf(other);
    const ea = ORDER.indexOf(CAN_HANH[dm]), eb = ORDER.indexOf(CAN_HANH[other]);
    const same = (a % 2) === (b % 2);
    const rel = (eb - ea + 5) % 5; // 0 same,1 I produce,2 I control,3 controls me,4 produces me
    return [['Tỷ Kiên','Kiếp Tài'],['Thực Thần','Thương Quan'],['Thiên Tài','Chính Tài'],['Thất Sát','Chính Quan'],['Thiên Ấn','Chính Ấn']][rel][same ? 0 : 1];
  }

  /* ---------- Chiêm tinh (Placidus, hoàng đạo nhiệt đới) ---------- */
  const SIGNS = ['Bạch Dương','Kim Ngưu','Song Tử','Cự Giải','Sư Tử','Xử Nữ','Thiên Bình','Bọ Cạp','Nhân Mã','Ma Kết','Bảo Bình','Song Ngư'];
  const SIGN_GLYPH = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
  const SIGN_EL = ['Lửa','Đất','Khí','Nước','Lửa','Đất','Khí','Nước','Lửa','Đất','Khí','Nước'];
  const MODES = ['Khởi phát','Kiên định','Linh hoạt'];
  // chủ tinh theo cung: [hiện đại, cổ điển nếu khác]
  const RULER = [['Mars'],['Venus'],['Mercury'],['Moon'],['Sun'],['Mercury'],['Venus'],['Pluto','Mars'],['Jupiter'],['Saturn'],['Uranus','Saturn'],['Neptune','Jupiter']];
  const BODIES = [
    ['Sun','Mặt Trời','☉'],['Moon','Mặt Trăng','☽'],['Mercury','Sao Thủy','☿'],['Venus','Sao Kim','♀'],['Mars','Sao Hỏa','♂'],
    ['Jupiter','Sao Mộc','♃'],['Saturn','Sao Thổ','♄'],['Uranus','Thiên Vương','♅'],['Neptune','Hải Vương','♆'],['Pluto','Diêm Vương','♇']
  ];
  const rad = Math.PI / 180, deg = 180 / Math.PI;
  const norm = x => ((x % 360) + 360) % 360;
  function lonOf(body, date) {
    if (body === 'Sun') return Astronomy.SunPosition(date).elon;
    if (body === 'Moon') return Astronomy.EclipticGeoMoon(date).lon;
    return Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body[body], date, true)).elon;
  }
  function speedOf(body, date) {
    const d2 = new Date(date.getTime() + 3600e3 * 12), d1 = new Date(date.getTime() - 3600e3 * 12);
    let dv = lonOf(body, d2) - lonOf(body, d1); if (dv > 180) dv -= 360; if (dv < -180) dv += 360; return dv;
  }
  function obliquity(date) { const T = (Astronomy.MakeTime(date).tt) / 36525; return 23.4392911 - 0.0130042 * T; }
  function trueNode(date) { // mean node (đủ chính xác cho mục đích diễn giải, sai lệch < 1.5°)
    const T = Astronomy.MakeTime(date).tt / 36525;
    return norm(125.04452 - 1934.136261 * T);
  }
  function houses(date, lat, lon) {
    const eps = obliquity(date) * rad, phi = lat * rad;
    const ramc = norm(Astronomy.SiderealTime(date) * 15 + lon);
    const R = ramc * rad;
    const mc = norm(Math.atan2(Math.sin(R), Math.cos(R) * Math.cos(eps)) * deg);
    const asc = norm(Math.atan2(Math.cos(R), -(Math.sin(eps) * Math.tan(phi) + Math.cos(eps) * Math.sin(R))) * deg);
    const lonFromRA = ra => norm(Math.atan2(Math.sin(ra * rad), Math.cos(ra * rad) * Math.cos(eps)) * deg);
    function cusp(frac, above) {
      let lam = norm(mc + (above ? 30 : 150) * frac * 3 / (above ? 3 : 3));
      let ra = 0;
      for (let i = 0; i < 30; i++) {
        const dec = Math.asin(Math.sin(eps) * Math.sin(lam * rad));
        let x = Math.tan(phi) * Math.tan(dec); x = Math.max(-1, Math.min(1, x));
        const ad = Math.asin(x) * deg;
        if (above) ra = ramc + frac * (90 + ad); else ra = ramc + 180 - frac * (90 - ad);
        lam = lonFromRA(norm(ra));
      }
      return lam;
    }
    const c = new Array(12);
    c[0] = asc; c[9] = mc; c[3] = norm(mc + 180); c[6] = norm(asc + 180);
    if (Math.abs(lat) < 66) {
      c[10] = cusp(1 / 3, true); c[11] = cusp(2 / 3, true);
      c[2] = cusp(1 / 3, false); c[1] = cusp(2 / 3, false);
    } else { // Porphyry fallback
      const q1 = norm(asc - mc) / 3; c[10] = norm(mc + q1); c[11] = norm(mc + 2 * q1);
      const q2 = norm(c[3] - asc) / 3; c[1] = norm(asc + q2); c[2] = norm(asc + 2 * q2);
    }
    c[4] = norm(c[10] + 180); c[5] = norm(c[11] + 180); c[7] = norm(c[1] + 180); c[8] = norm(c[2] + 180);
    return { asc, mc, cusps: c };
  }
  const houseOf = (l, cusps) => { for (let i = 0; i < 12; i++) { const a = cusps[i], b = cusps[(i + 1) % 12]; if (norm(l - a) < norm(b - a)) return i + 1; } return 1; };
  const fmtDeg = l => { const s = Math.floor(l / 30), dd = l % 30; const d0 = Math.floor(dd), m0 = Math.floor((dd - d0) * 60); return { sign: SIGNS[s], signGlyph: SIGN_GLYPH[s], signIdx: s, text: `${d0}°${String(m0).padStart(2, '0')}′ ${SIGNS[s]}` }; };
  const ASPECTS = [['Trùng tụ', 0, 8, '☌'], ['Lục hợp', 60, 5, '⚹'], ['Vuông góc', 90, 7, '□'], ['Tam hợp', 120, 7, '△'], ['Đối đỉnh', 180, 8, '☍']];
  function aspectsOf(points) {
    const out = [];
    for (let i = 0; i < points.length; i++) for (let j = i + 1; j < points.length; j++) {
      let d = Math.abs(points[i].lon - points[j].lon); if (d > 180) d = 360 - d;
      for (const [n, a, orb, g] of ASPECTS) {
        const o = Math.abs(d - a);
        const lim = (points[i].key === 'Sun' || points[i].key === 'Moon' || points[j].key === 'Sun' || points[j].key === 'Moon') ? orb : orb - 1;
        if (o <= lim) out.push({ a: points[i].name, b: points[j].name, ak: points[i].key, bk: points[j].key, type: n, glyph: g, angle: a, orb: +o.toFixed(1) });
      }
    }
    return out.sort((x, y) => x.orb - y.orb);
  }
  function natal(y, mo, d, h, mi, tz, lat, lon) {
    const date = new Date(Date.UTC(y, mo - 1, d, h, mi) - tz * 3600e3);
    const H = houses(date, lat, lon);
    const pts = BODIES.map(([key, name, glyph]) => {
      const l = lonOf(key, date); const sp = speedOf(key, date);
      return { key, name, glyph, lon: l, retro: sp < 0, house: houseOf(l, H.cusps), ...fmtDeg(l) };
    });
    const nn = trueNode(date);
    pts.push({ key: 'Node', name: 'La Hầu (Bắc Giao)', glyph: '☊', lon: nn, retro: true, house: houseOf(nn, H.cusps), ...fmtDeg(nn) });
    const asp = aspectsOf(pts.filter(p => p.key !== 'Node').concat([{ key: 'ASC', name: 'Cung Mọc', lon: H.asc }, { key: 'MC', name: 'Thiên Đỉnh', lon: H.mc }]));
    const elements = { 'Lửa': 0, 'Đất': 0, 'Khí': 0, 'Nước': 0 };
    const modes = { 'Khởi phát': 0, 'Kiên định': 0, 'Linh hoạt': 0 };
    const matrix = {}; // nguyên tố × tính chất → danh sách sao
    pts.slice(0, 10).forEach(p => { const w = (p.key === 'Sun' || p.key === 'Moon') ? 2 : 1; const el = SIGN_EL[p.signIdx], md = MODES[p.signIdx % 3];
      elements[el] += w; modes[md] += w; (matrix[el + '|' + md] = matrix[el + '|' + md] || []).push(p.glyph); });
    // Điểm phụ: Lilith (viễn điểm trung bình của Mặt Trăng), Điểm may mắn (cần giờ sinh)
    const T = Astronomy.MakeTime(date).tt / 36525;
    const lil = norm(83.3532465 + 4069.0137287 * T - 0.01032 * T * T + 180);
    const sun = pts[0], moon = pts[1], dayBirth = sun.house >= 7;
    const pof = norm(dayBirth ? H.asc + moon.lon - sun.lon : H.asc + sun.lon - moon.lon);
    const extra = [{ key: 'Lilith', name: 'Lilith (Trăng Đen)', glyph: '⚸', lon: lil, house: houseOf(lil, H.cusps), ...fmtDeg(lil) },
      { key: 'PoF', name: 'Điểm may mắn', glyph: '⊗', lon: pof, house: houseOf(pof, H.cusps), dayBirth, ...fmtDeg(pof) }];
    // chủ tinh của 12 nhà (hiện đại, kèm cổ điển nếu khác)
    const rulers = H.cusps.map((c, i) => { const si = Math.floor(c / 30), r = RULER[si]; const rp = pts.find(p => p.key === r[0]);
      return { house: i + 1, sign: SIGNS[si], ruler: r[0], rulerName: rp ? rp.name : r[0], trad: r[1] ? (pts.find(p => p.key === r[1]) || {}).name : null, inHouse: rp ? rp.house : null, inSign: rp ? rp.sign : null }; });
    return { date, asc: { lon: H.asc, ...fmtDeg(H.asc) }, mc: { lon: H.mc, ...fmtDeg(H.mc) }, cusps: H.cusps.map(c => ({ lon: c, ...fmtDeg(c) })), points: pts, aspects: asp, elements, modes, matrix, extra, rulers };
  }
  // quá cảnh: Sao Mộc, Sao Thổ chạm các điểm chính trong 18 tháng tới
  function transits(nat, fromDate, months = 18) {
    const targets = [['Mặt Trời', nat.points[0].lon], ['Mặt Trăng', nat.points[1].lon], ['Sao Kim', nat.points[3].lon], ['Cung Mọc', nat.asc.lon], ['Thiên Đỉnh (MC)', nat.mc.lon]];
    const movers = [['Jupiter', 'Sao Mộc'], ['Saturn', 'Sao Thổ'], ['Uranus', 'Thiên Vương'], ['Neptune', 'Hải Vương'], ['Pluto', 'Diêm Vương']];
    const asp = [['trùng tụ', 0], ['vuông góc', 90], ['tam hợp', 120], ['đối đỉnh', 180]];
    const events = []; const open = {};
    const days = Math.round(months * 30.5);
    for (let k = 0; k <= days; k += 2) {
      const dt = new Date(fromDate.getTime() + k * 86400e3);
      for (const [mk, mn] of movers) {
        const l = lonOf(mk, dt);
        for (const [tn, tl] of targets) for (const [an, a] of asp) {
          let dd = Math.abs(l - tl); if (dd > 180) dd = 360 - dd;
          const id = mk + tn + an; const on = Math.abs(dd - a) <= 1;
          if (on && !open[id]) open[id] = { mover: mn, target: tn, aspect: an, start: dt, end: dt };
          else if (on) open[id].end = dt;
          else if (open[id]) { events.push(open[id]); delete open[id]; }
        }
      }
    }
    Object.values(open).forEach(e => events.push(e));
    // gộp các lần chạm (do nghịch hành) gần nhau thành một đợt
    return events.sort((a, b) => a.start - b.start);
  }

  /* ---------- Tử vi (iztro) ---------- */
  function tuvi(y, mo, d, h, mi, gender) {
    const idx = h === 23 ? 12 : Math.floor((h + 1) / 2);
    const a = iztro.astro.bySolar(`${y}-${mo}-${d}`, idx, gender === 'nam' ? '男' : '女', true, 'vi-VN');
    let hs = null; try { hs = a.horoscope(new Date()); } catch (e) { }
    const star = s => ({ name: s.name, bright: s.brightness || '', mut: s.mutagen || '', type: s.type || '' });
    const rd = a.rawDates.lunarDate, ly = Solar.fromYmd(y, mo, d).getLunar();
    const yg = gz(ly.getYearInGanZhi()), [ycan, ychi] = yg.split(' ');
    // Tuần: hai chi trống của tuần Giáp chứa năm sinh; Triệt: theo can năm
    const si = STEM_ORDER.indexOf(ycan), bi = BR.indexOf(ychi), start = ((bi - si) % 12 + 12) % 12;
    const tuan = [BR[(start + 10) % 12], BR[(start + 11) % 12]];
    const triet = { 'Giáp':['Thân','Dậu'],'Kỷ':['Thân','Dậu'],'Ất':['Ngọ','Mùi'],'Canh':['Ngọ','Mùi'],'Bính':['Thìn','Tỵ'],'Tân':['Thìn','Tỵ'],'Đinh':['Dần','Mão'],'Nhâm':['Dần','Mão'],'Mậu':['Tý','Sửu'],'Quý':['Tý','Sửu'] }[ycan];
    const horo = yy => { // xem theo năm: đại hạn, tiểu hạn, lưu niên, lưu tứ hóa, lưu tinh
      const h = a.horoscope(new Date(yy, 6, 1)); const br = i => a.palaces[i].earthlyBranch;
      const g = gz(Solar.fromYmd(yy, 7, 1).getLunar().getYearInGanZhi());
      return { year: yy, gz: g, age: h.age.nominalAge, decadal: br(h.decadal.index), decadalGZ: h.decadal.heavenlyStem + ' ' + h.decadal.earthlyBranch, decadalMut: h.decadal.mutagen,
        tieuHan: h.age.earthlyBranch, yearly: br(h.yearly.index), yearlyMut: h.yearly.mutagen,
        yearlyNames: Object.fromEntries(a.palaces.map((p, i) => [p.earthlyBranch, h.yearly.palaceNames[i]])),
        stars: Object.fromEntries(a.palaces.map((p, i) => [p.earthlyBranch, (h.yearly.stars[i] || []).map(s => ({ name: s.name, type: s.type }))])) };
    };
    return {
      menh: a.earthlyBranchOfSoulPalace, than: a.earthlyBranchOfBodyPalace, cuc: a.fiveElementsClass, soul: a.soul, body: a.body,
      lunar: `${rd.lunarDay}/${rd.lunarMonth}${rd.isLeap ? ' (nhuận)' : ''} năm ${yg}`, lunarYearGZ: yg, napAmNam: NAPAM[ly.getYearNaYin()] || ly.getYearNaYin(),
      amDuong: (si % 2 === 0 ? 'Dương ' : 'Âm ') + (gender === 'nam' ? 'Nam' : 'Nữ'), tuan, triet, horo,
      chineseDate: a.chineseDate, time: a.time, zodiac: a.zodiac,
      palaces: a.palaces.map(p => ({
        name: p.name, stem: p.heavenlyStem, branch: p.earthlyBranch, isBody: p.isBodyPalace,
        major: p.majorStars.map(star), minor: p.minorStars.map(star), adj: (p.adjectiveStars || []).map(s => s.name),
        decadal: p.decadal ? p.decadal.range : null, changsheng: p.changsheng12, boshi: p.boshi12, ages: p.ages
      })),
      decadalNow: hs && hs.decadal ? { name: hs.decadal.name, branch: hs.decadal.earthlyBranch, stem: hs.decadal.heavenlyStem, palaceNames: hs.decadal.palaceNames } : null,
      yearlyNow: hs && hs.yearly ? { stem: hs.yearly.heavenlyStem, branch: hs.yearly.earthlyBranch, palaceNames: hs.yearly.palaceNames, mutagen: hs.yearly.mutagen } : null
    };
  }

  function all(inp) {
    const [y, mo, d] = inp.date.split('-').map(Number); const [h, mi] = inp.time.split(':').map(Number);
    const now = new Date();
    const nat = natal(y, mo, d, h, mi, inp.tz, inp.lat, inp.lon);
    return {
      input: inp,
      numerology: numerology(inp.name, d, mo, y, now.getFullYear()),
      bazi: bazi(y, mo, d, h, mi, inp.gender),
      astro: nat,
      transits: transits(nat, now),
      tuvi: tuvi(y, mo, d, h, mi, inp.gender)
    };
  }
  return { all, numerology, bazi, natal, transits, tuvi, SIGNS, SIGN_GLYPH, SIGN_EL, MODES, fmtDeg, yearGZ, tenGodOf, relations, strength, shensha, BR };
})();
if (typeof module !== 'undefined') module.exports = TC;
