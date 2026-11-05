/* Tứ Chiếu — An sao Tử vi theo trường phái Việt Nam (Thái Thứ Lang / Thiên Lương).
   Cách an sao, bảng miếu vượng đắc hãm và tứ hóa chuyển từ dự án mã nguồn mở lasotuvi
   (c) 2016 doanguyen, giấy phép MIT: https://github.com/doanguyen/lasotuvi
   Lịch âm Việt Nam (múi giờ +7) theo thuật toán của Hồ Ngọc Đức (c) 2006.
   Chỉ số địa chi trong file này: 1 = Tý … 12 = Hợi (giống lasotuvi). */
const TVVN = (() => {
  const BR = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];
  const CAN = ['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'];
  const d = (c, ...n) => { let x = c; n.forEach(k => x += k); x %= 12; return x <= 0 ? x + 12 : x; };

  /* ---------- Lịch âm Việt Nam (Hồ Ngọc Đức) ---------- */
  const INT = Math.floor, PI = Math.PI;
  function jdFromDate(dd, mm, yy) { const a = INT((14 - mm) / 12), y = yy + 4800 - a, m = mm + 12 * a - 3;
    let jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
    if (jd < 2299161) jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083; return jd; }
  function newMoon(k) { const T = k / 1236.85, T2 = T * T, T3 = T2 * T, dr = PI / 180;
    let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
    Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
    const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
    let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
    C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
    C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
    C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
    C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
    C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
    C1 = C1 + 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
    const deltat = T < -11 ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3 : -0.000278 + 0.000265 * T + 0.000262 * T2;
    return Jd1 + C1 - deltat; }
  function sunLongitude(jdn) { const T = (jdn - 2451545.0) / 36525, T2 = T * T, dr = PI / 180;
    const M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2, L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
    let DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
    DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
    let L = (L0 + DL) * dr; L -= PI * 2 * INT(L / (PI * 2)); return L; }
  const sunLong = (dayNumber, tz) => INT(sunLongitude(dayNumber - 0.5 - tz / 24) / PI * 6);
  const newMoonDay = (k, tz) => INT(newMoon(k) + 0.5 + tz / 24);
  function lunarMonth11(yy, tz) { const off = jdFromDate(31, 12, yy) - 2415021, k = INT(off / 29.530588853);
    let nm = newMoonDay(k, tz); if (sunLong(nm, tz) >= 9) nm = newMoonDay(k - 1, tz); return nm; }
  function leapMonthOffset(a11, tz) { const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5); let last, i = 1, arc = sunLong(newMoonDay(k + i, tz), tz);
    do { last = arc; i++; arc = sunLong(newMoonDay(k + i, tz), tz); } while (arc !== last && i < 14); return i - 1; }
  function s2l(dd, mm, yy, tz = 7) {
    const dayNumber = jdFromDate(dd, mm, yy), k = INT((dayNumber - 2415021.076998695) / 29.530588853);
    let monthStart = newMoonDay(k + 1, tz); if (monthStart > dayNumber) monthStart = newMoonDay(k, tz);
    let a11 = lunarMonth11(yy, tz), b11 = a11, lunarYear;
    if (a11 >= monthStart) { lunarYear = yy; a11 = lunarMonth11(yy - 1, tz); } else { lunarYear = yy + 1; b11 = lunarMonth11(yy + 1, tz); }
    const lunarDay = dayNumber - monthStart + 1, diff = INT((monthStart - a11) / 29);
    let leap = false, lunarMonth = diff + 11;
    if (b11 - a11 > 365) { const leapOff = leapMonthOffset(a11, tz); if (diff >= leapOff) { lunarMonth = diff + 10; if (diff === leapOff) leap = true; } }
    if (lunarMonth > 12) lunarMonth -= 12; if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
    return { day: lunarDay, month: lunarMonth, year: lunarYear, leap };
  }
  const yearCanChi = y => ({ can: ((y + 6) % 10) + 1, chi: ((y + 8) % 12) + 1 }); // 1-based

  /* ---------- Bảng miếu (M) vượng (V) đắc (Đ) bình (B) hãm (H), Tý → Hợi ---------- */
  const DT = {"Tử Vi":"BĐMBVMMĐMBVB","Liêm Trinh":"VĐVHMHVĐVHMH","Thiên Đồng":"VHMĐHĐHHMHHĐ","Vũ Khúc":"VMVĐMHVMVĐMH","Thái Dương":"HĐVVVMMĐHHHH","Thiên Cơ":"ĐĐHMMVĐĐVMMH","Thiên Phủ":"MBMBVĐMĐMBVĐ","Thái Âm":"VĐHHHHHĐVMMM","Tham Lang":"HMĐHVHHMĐHVH","Cự Môn":"VHVMHHVHĐMHĐ","Thiên Tướng":"VĐMHVĐVĐMHVĐ","Thiên Lương":"VĐVVMHMĐVHMH","Thất Sát":"MĐMHHVMĐMHHV","Phá Quân":"MVHHĐHMVHHĐH","Đà La":"HĐHHĐHHĐHHĐH","Kình Dương":"HĐHHĐHHĐHHĐH","Linh Tinh":"HHĐĐĐĐĐHHHHH","Hỏa Tinh":"HHĐĐĐĐĐHHHHH","Văn Xương":"HĐHĐHĐHĐHHĐĐ","Văn Khúc":"HĐHĐHĐHĐHHĐĐ","Địa Không":"HHĐHHĐHHĐHHĐ","Địa Kiếp":"HHĐHHĐHHĐHHĐ","Đại Hao":"..ĐĐ....ĐĐ..","Tiểu Hao":"..ĐĐ....ĐĐ..","Thiên Khốc":"ĐĐ.Đ..ĐĐ.Đ..","Thiên Hư":"ĐĐ.Đ..ĐĐ.Đ..","Thiên Mã":"..Đ..Đ......","Thiên Hình":"..ĐĐ....ĐĐ..","Thiên Riêu":"..ĐĐ.....ĐĐ."};
  const LABEL = { M: 'Miếu', V: 'Vượng', 'Đ': 'Đắc', B: 'Bình', H: 'Hạn' };
  const bright = (name, b) => { const r = DT[name]; if (!r) return ''; const c = [...r][b - 1]; return LABEL[c] || ''; };

  /* ---------- Tứ hóa theo can (Lộc, Quyền, Khoa, Kỵ) ---------- */
  const TU_HOA = [['Liêm Trinh','Phá Quân','Vũ Khúc','Thái Dương'], ['Thiên Cơ','Thiên Lương','Tử Vi','Thái Âm'], ['Thiên Đồng','Thiên Cơ','Văn Xương','Liêm Trinh'],
    ['Thái Âm','Thiên Đồng','Thiên Cơ','Cự Môn'], ['Tham Lang','Thái Âm','Hữu Bật','Thiên Cơ'], ['Vũ Khúc','Tham Lang','Thiên Lương','Văn Khúc'],
    ['Thái Dương','Vũ Khúc','Thiên Đồng','Thái Âm'], ['Cự Môn','Thái Dương','Văn Khúc','Văn Xương'], ['Thiên Lương','Tử Vi','Thiên Phủ','Vũ Khúc'], ['Phá Quân','Cự Môn','Thái Âm','Tham Lang']];
  const tuHoa = canName => TU_HOA[CAN.indexOf(canName)] || [];

  // Loại sao: số < 10 là sao tốt, > 10 là sao xấu (theo lasotuvi); 1 là chính tinh
  const LOAI = {"Thái Tuế":15,"Thiếu Dương":5,"Tang Môn":12,"Thiếu Âm":5,"Quan Phù":12,"Tử Phù":12,"Tuế Phá":12,"Long Đức":5,"Bạch Hổ":12,"Phúc Đức":5,"Điếu Khách":12,"Trực Phù":16,
    "Lộc Tồn":3,"Bác Sĩ":5,"Lực Sĩ":2,"Thanh Long":5,"Tiểu Hao":12,"Tướng Quân":4,"Tấu Thư":3,"Phi Liêm":2,"Hỷ Thần":5,"Bệnh Phù":12,"Đại Hao":12,"Phục Binh":13,"Quan Phủ":12,
    "Đà La":11,"Kình Dương":11,"Địa Không":11,"Địa Kiếp":11,"Linh Tinh":11,"Hỏa Tinh":11,"Văn Xương":6,"Văn Khúc":6,"Thiên Khôi":6,"Thiên Việt":6,"Tả Phù":2,"Hữu Bật":2,
    "Long Trì":3,"Phượng Các":3,"Tam Thai":7,"Bát Tọa":7,"Ân Quang":3,"Thiên Quý":3,"Thiên Khốc":12,"Thiên Hư":12,"Thiên Đức":5,"Nguyệt Đức":5,"Thiên Hình":15,"Thiên Riêu":13,
    "Thiên Y":5,"Quốc Ấn":6,"Đường Phù":4,"Đào Hoa":8,"Hồng Loan":8,"Thiên Hỷ":5,"Thiên Giải":5,"Địa Giải":5,"Giải Thần":5,"Thai Phụ":6,"Phong Cáo":4,"Thiên Tài":2,"Thiên Thọ":5,
    "Thiên Thương":12,"Thiên Sứ":12,"Thiên La":12,"Địa Võng":12,"Cô Thần":13,"Quả Tú":13,"Thiên Mã":3,"Phá Toái":12,"Thiên Quan":5,"Thiên Phúc":5,"Lưu Hà":12,"Thiên Trù":5,
    "Kiếp Sát":11,"Hoa Cái":14,"Văn Tinh":6,"Đẩu Quân":5,"Thiên Không":11};
  // 14 sao "lục cát, lục sát" xếp vào nhóm phụ tinh chính (hiện đậm hơn); còn lại là sao nhỏ
  const MINOR = ['Tả Phù','Hữu Bật','Văn Xương','Văn Khúc','Thiên Khôi','Thiên Việt','Lộc Tồn','Thiên Mã','Kình Dương','Đà La','Hỏa Tinh','Linh Tinh','Địa Không','Địa Kiếp'];
  const isBad = n => (LOAI[n] || 0) > 10;

  /* ---------- An sao ----------
     o: { day, month (âm), canNam 1–10, chiNam 1–12, gio 1–12 (Tý = 1), nam: bool, menh, than (1–12), cuc 2–6, noBoc, tatAch (1–12) } */
  function place(o) {
    const S = {}; const put = (b, ...names) => names.forEach(n => (S[b] = S[b] || []).push(n));
    const nn = o.day, tt = o.month, can = o.canNam, chi = o.chiNam, gio = o.gio;
    const gt = o.nam ? 1 : -1, ad = can % 2 === 1 ? 1 : -1, adnn = gt * ad;
    // Tử vi tinh hệ
    let cung = 3, cc = o.cuc; while (cc < nn) { cc += o.cuc; cung++; } let sl = cc - nn; if (sl % 2 === 1) sl = -sl;
    const tv = d(cung, sl); put(tv, 'Tử Vi'); put(d(tv, 4), 'Liêm Trinh'); put(d(tv, 7), 'Thiên Đồng'); put(d(tv, 8), 'Vũ Khúc'); put(d(tv, 9), 'Thái Dương'); put(d(tv, 11), 'Thiên Cơ');
    const tp = d(3, 3 - tv); put(tp, 'Thiên Phủ'); put(d(tp, 1), 'Thái Âm'); put(d(tp, 2), 'Tham Lang'); put(d(tp, 3), 'Cự Môn'); put(d(tp, 4), 'Thiên Tướng'); put(d(tp, 5), 'Thiên Lương'); put(d(tp, 6), 'Thất Sát'); put(d(tp, 10), 'Phá Quân');
    // Vòng Lộc tồn – Bác sĩ
    const lt = [3, 4, 6, 7, 6, 7, 9, 10, 12, 1][can - 1]; put(lt, 'Lộc Tồn');
    const BS = ['Bác Sĩ','Lực Sĩ','Thanh Long','Tiểu Hao','Tướng Quân','Tấu Thư','Phi Liêm','Hỷ Thần','Bệnh Phù','Đại Hao','Phục Binh','Quan Phủ'];
    const boshi = {}; BS.forEach((n, i) => { const b = d(lt, i * adnn); put(b, n); boshi[b] = n; });
    // Vòng Thái tuế
    const TT = ['Thái Tuế','Thiếu Dương','Tang Môn','Thiếu Âm','Quan Phù','Tử Phù','Tuế Phá','Long Đức','Bạch Hổ','Phúc Đức','Điếu Khách','Trực Phù'];
    TT.forEach((n, i) => put(d(chi, i), n)); put(d(chi, 1), 'Thiên Không'); put(d(chi, 5), 'Nguyệt Đức'); put(d(chi, 9), 'Thiên Đức');
    // Vòng Trường sinh
    const ts0 = { 6: 3, 4: 6, 2: 9, 5: 9, 3: 12 }[o.cuc];
    const TS = ['Trường Sinh','Mộc Dục','Quan Đới','Lâm Quan','Đế Vượng','Suy','Bệnh','Tử','Mộ','Tuyệt','Thai','Dưỡng'];
    const changsheng = {}; TS.forEach((n, i) => changsheng[d(ts0, i * adnn)] = n);
    // Sao đôi
    const kd = d(lt, 1); put(d(lt, -1), 'Đà La'); put(kd, 'Kình Dương');
    const kiep = d(11, gio); put(kiep, 'Địa Kiếp'); put(d(12, 12 - kiep), 'Địa Không');
    let kh, kl; if ([3, 7, 11].includes(chi)) { kh = 2; kl = 4; } else if ([1, 5, 9].includes(chi)) { kh = 3; kl = 11; } else if ([6, 10, 2].includes(chi)) { kh = 11; kl = 4; } else { kh = 10; kl = 11; }
    if (adnn === -1) { put(d(kh + 1, -gio), 'Hỏa Tinh'); put(d(kl - 1, gio), 'Linh Tinh'); } else { put(d(kh - 1, gio), 'Hỏa Tinh'); put(d(kl + 1, -gio), 'Linh Tinh'); }
    const ltr = d(5, chi - 1); put(ltr, 'Long Trì'); put(d(2, 2 - ltr), 'Phượng Các', 'Giải Thần');
    const ta = d(5, tt - 1); put(ta, 'Tả Phù'); put(d(2, 2 - ta), 'Hữu Bật');
    const vk = d(5, gio - 1); put(vk, 'Văn Khúc'); const vx = d(2, 2 - vk); put(vx, 'Văn Xương');
    const tth = d(5, tt + nn - 2); put(tth, 'Tam Thai'); put(d(2, 2 - tth), 'Bát Tọa');
    const aq = d(vx, nn - 2); put(aq, 'Ân Quang'); put(d(2, 2 - aq), 'Thiên Quý');
    const khoi = [2, 1, 12, 10, 8, 1, 8, 7, 6, 4][can - 1]; put(khoi, 'Thiên Khôi'); put(d(5, 5 - khoi), 'Thiên Việt');
    put(d(7, chi - 1), 'Thiên Hư'); put(d(7, -chi + 1), 'Thiên Khốc');
    put(d(o.menh, chi - 1), 'Thiên Tài'); put(d(o.than, chi - 1), 'Thiên Thọ');
    const hl = d(4, -chi + 1); put(hl, 'Hồng Loan'); put(d(hl, 6), 'Thiên Hỷ');
    put([8, 5, 6, 3, 4, 10, 12, 10, 11, 7][can - 1], 'Thiên Quan'); put([10, 9, 1, 12, 4, 3, 7, 6, 7, 6][can - 1], 'Thiên Phúc');
    const th = d(10, tt - 1); put(th, 'Thiên Hình'); put(d(th, 4), 'Thiên Riêu', 'Thiên Y');
    const ct = [12, 1, 2].includes(chi) ? 3 : [3, 4, 5].includes(chi) ? 6 : [6, 7, 8].includes(chi) ? 9 : 12; put(ct, 'Cô Thần'); put(d(ct, -4), 'Quả Tú');
    const vt = d(kd, 2); put(vt, 'Văn Tinh'); const dp = d(vt, 2); put(dp, 'Đường Phù'); put(d(dp, 3), 'Quốc Ấn');
    put(d(vk, 2), 'Thai Phụ'); put(d(vk, -2), 'Phong Cáo');
    put(d(9, tt - 1), 'Thiên Giải'); // tháng Giêng tại Thân, đếm thuận không nhảy cung (như đa số lá số Việt hiện nay) put(d(ta, 3), 'Địa Giải');
    put(5, 'Thiên La'); put(11, 'Địa Võng'); put(o.noBoc, 'Thiên Thương'); put(o.tatAch, 'Thiên Sứ');
    const tm = { 1: 3, 2: 12, 3: 9, 0: 6 }[chi % 4]; put(tm, 'Thiên Mã'); put(d(tm, 2), 'Hoa Cái'); const ks = d(tm, 3); put(ks, 'Kiếp Sát'); put(d(ks, 4), 'Đào Hoa');
    put({ 1: 6, 0: 10, 2: 2 }[chi % 3], 'Phá Toái'); // Tý Ngọ Mão Dậu: Tỵ; Dần Thân Tỵ Hợi: Dậu; Thìn Tuất Sửu Mùi: Sửu
    put(d(chi, -tt + gio), 'Đẩu Quân');
    put([10, 11, 8, 5, 6, 7, 9, 4, 12, 3][can - 1], 'Lưu Hà'); put([6, 7, 1, 6, 7, 9, 3, 7, 10, 11][can - 1], 'Thiên Trù');
    const out = {};
    for (let b = 1; b <= 12; b++) out[BR[b - 1]] = (S[b] || []).map(n => ({ name: n, bright: bright(n, b), bad: isBad(n), minor: MINOR.includes(n), ring: TT.includes(n) ? 'tt' : BS.includes(n) ? 'bs' : '' }));
    return { stars: out, changsheng: Object.fromEntries(Object.entries(changsheng).map(([b, n]) => [BR[b - 1], n])), boshi: Object.fromEntries(Object.entries(boshi).map(([b, n]) => [BR[b - 1], n])) };
  }

  /* ---------- Lưu tinh của một năm (theo can chi năm xem) ---------- */
  function luu(yy) {
    const { can, chi } = yearCanChi(yy), S = {}; const put = (b, n) => (S[BR[b - 1]] = S[BR[b - 1]] || []).push({ name: n, type: '' });
    const lt = [3, 4, 6, 7, 6, 7, 9, 10, 12, 1][can - 1];
    put(lt, 'Lưu Lộc Tồn'); put(d(lt, 1), 'Lưu Kình Dương'); put(d(lt, -1), 'Lưu Đà La');
    put({ 1: 3, 2: 12, 3: 9, 0: 6 }[chi % 4], 'Lưu Thiên Mã');
    put(chi, 'Lưu Thái Tuế'); put(d(chi, 2), 'Lưu Tang Môn'); put(d(chi, 8), 'Lưu Bạch Hổ');
    put(d(7, chi - 1), 'Lưu Thiên Hư'); put(d(7, -chi + 1), 'Lưu Thiên Khốc');
    return S;
  }

  return { s2l, yearCanChi, place, luu, tuHoa, bright, LOAI, BR, CAN };
})();
if (typeof module !== 'undefined') module.exports = TVVN;
