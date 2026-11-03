/* Tứ Chiếu — Human Design: tính biểu đồ (bodygraph) từ vị trí các thiên thể.
   Cần global Astronomy (astronomy-engine) và TC.lonOf (compute.js).
   Phần nghĩa viết lại bằng lời của Tứ Chiếu, không chép tài liệu gốc. */
const HD = (() => {
  const rad = Math.PI / 180, deg = 180 / Math.PI, norm = x => ((x % 360) + 360) % 360;
  // Vòng 64 cổng: cổng 41 bắt đầu ở 2° Bảo Bình (≈302,04°), mỗi cổng 5,625°, mỗi hào 0,9375°
  const WHEEL = [41,19,13,49,30,55,37,63,22,36,25,17,21,51,42,3,27,24,2,23,8,20,16,35,45,12,15,52,39,53,62,56,31,33,7,4,29,59,40,64,47,6,46,18,48,57,32,50,28,44,1,43,14,34,9,5,26,11,10,58,38,54,61,60];
  const gateOf = lon => { const x = norm(lon - 302.0416667); const i = Math.floor(x / 5.625); return { gate: WHEEL[i], line: Math.floor((x - i * 5.625) / 0.9375) + 1 }; };

  const CENTERS = {
    head: { name: 'Đầu', gates: [64, 61, 63] },
    ajna: { name: 'Ajna (Tư duy)', gates: [47, 24, 4, 17, 43, 11] },
    throat: { name: 'Cổ họng', gates: [62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16] },
    g: { name: 'G (Bản thể)', gates: [1, 13, 25, 46, 2, 15, 10, 7] },
    heart: { name: 'Tim (Ý chí)', gates: [21, 40, 26, 51] },
    sacral: { name: 'Xương cùng (Sacral)', gates: [5, 14, 29, 59, 9, 3, 42, 27, 34] },
    solar: { name: 'Đám rối mặt trời (Cảm xúc)', gates: [6, 37, 22, 36, 30, 55, 49] },
    spleen: { name: 'Lách (Bản năng)', gates: [48, 57, 44, 50, 32, 28, 18] },
    root: { name: 'Gốc (Áp lực)', gates: [53, 60, 52, 19, 39, 41, 58, 38, 54] }
  };
  const centerOfGate = {}; Object.entries(CENTERS).forEach(([k, c]) => c.gates.forEach(g => centerOfGate[g] = k));
  const CHANNELS = [[1,8],[2,14],[3,60],[4,63],[5,15],[6,59],[7,31],[9,52],[10,20],[10,34],[10,57],[11,56],[12,22],[13,33],[16,48],[17,62],[18,58],[19,49],[20,34],[20,57],[21,45],[23,43],[24,61],[25,51],[26,44],[27,50],[28,38],[29,46],[30,41],[32,54],[34,57],[35,36],[37,40],[39,55],[42,53],[47,64]];
  const MOTORS = ['sacral', 'heart', 'solar', 'root'];

  // Nút giao Bắc thật: từ mặt phẳng quỹ đạo tức thời của Mặt Trăng (vector mômen động lượng)
  function trueNode(date) {
    const t = Astronomy.MakeTime(date), dt = 1 / 24;
    const e1 = Astronomy.Ecliptic(Astronomy.GeoMoon(t)).vec, e2 = Astronomy.Ecliptic(Astronomy.GeoMoon(t.AddDays(dt))).vec;
    const v = { x: e2.x - e1.x, y: e2.y - e1.y, z: e2.z - e1.z };
    const h = { x: e1.y * v.z - e1.z * v.y, y: e1.z * v.x - e1.x * v.z };
    return norm(Math.atan2(h.x, -h.y) * deg);
  }
  const BODIES = [['Sun','Mặt Trời','☉'],['Earth','Trái Đất','⊕'],['NorthNode','Nút Bắc','☊'],['SouthNode','Nút Nam','☋'],['Moon','Mặt Trăng','☽'],['Mercury','Sao Thủy','☿'],['Venus','Sao Kim','♀'],['Mars','Sao Hỏa','♂'],['Jupiter','Sao Mộc','♃'],['Saturn','Sao Thổ','♄'],['Uranus','Thiên Vương','♅'],['Neptune','Hải Vương','♆'],['Pluto','Diêm Vương','♇']];
  function positions(date) {
    const sun = TC.lonOf('Sun', date), nn = trueNode(date);
    const L = { Sun: sun, Earth: norm(sun + 180), NorthNode: nn, SouthNode: norm(nn + 180) };
    ['Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'].forEach(k => L[k] = TC.lonOf(k, date));
    return BODIES.map(([k, n, g]) => ({ key: k, name: n, glyph: g, lon: L[k], ...gateOf(L[k]) }));
  }
  // Thời điểm "Design": lúc Mặt Trời lùi đúng 88° so với lúc sinh (khoảng 88–89 ngày trước)
  function designDate(birth) {
    const target = norm(TC.lonOf('Sun', birth) - 88);
    let t = new Date(birth.getTime() - 88.5 * 86400e3);
    for (let i = 0; i < 30; i++) { let d = norm(TC.lonOf('Sun', t) - target); if (d > 180) d -= 360; if (Math.abs(d) < 1e-7) break; t = new Date(t.getTime() - d / 0.9856 * 86400e3); }
    return t;
  }

  function chart(birthUTC) {
    const dDate = designDate(birthUTC);
    const pers = positions(birthUTC), des = positions(dDate);
    const active = {}; // cổng → {p: tính cách (ý thức), d: thiết kế (vô thức)}
    pers.forEach(x => { (active[x.gate] = active[x.gate] || { p: false, d: false }).p = true; });
    des.forEach(x => { (active[x.gate] = active[x.gate] || { p: false, d: false }).d = true; });
    const channels = CHANNELS.filter(([a, b]) => active[a] && active[b]).map(([a, b]) => ({ gates: [a, b], centers: [centerOfGate[a], centerOfGate[b]] }));
    const defined = new Set(channels.flatMap(c => c.centers));
    // Đồ thị các trung tâm có định nghĩa
    const adj = {}; Object.keys(CENTERS).forEach(k => adj[k] = new Set());
    channels.forEach(c => { adj[c.centers[0]].add(c.centers[1]); adj[c.centers[1]].add(c.centers[0]); });
    const reach = (from, to) => { if (!defined.has(from)) return false; const seen = new Set([from]), q = [from]; while (q.length) { const x = q.shift(); if (x === to) return true; adj[x].forEach(y => { if (!seen.has(y)) { seen.add(y); q.push(y); } }); } return false; };
    const motorToThroat = MOTORS.some(m => reach('throat', m));
    let type;
    if (!defined.size) type = 'Reflector';
    else if (defined.has('sacral')) type = motorToThroat ? 'Manifesting Generator' : 'Generator';
    else type = motorToThroat ? 'Manifestor' : 'Projector';
    let authority;
    if (defined.has('solar')) authority = 'Emotional';
    else if (defined.has('sacral')) authority = 'Sacral';
    else if (defined.has('spleen')) authority = 'Splenic';
    else if (defined.has('heart')) authority = reach('heart', 'throat') ? 'Ego Manifested' : 'Ego Projected';
    else if (defined.has('g') && reach('g', 'throat')) authority = 'Self-Projected';
    else if (type === 'Reflector') authority = 'Lunar';
    else authority = 'Mental';
    // Số nhóm định nghĩa
    const seen = new Set(); let groups = 0;
    defined.forEach(k => { if (seen.has(k)) return; groups++; const q = [k]; seen.add(k); while (q.length) { const x = q.shift(); adj[x].forEach(y => { if (!seen.has(y)) { seen.add(y); q.push(y); } }); } });
    const definition = ['Không có', 'Đơn (Single)', 'Chia đôi (Split)', 'Chia ba (Triple Split)', 'Chia bốn (Quadruple Split)'][groups] || groups + ' nhóm';
    const pSun = pers[0], dSun = des[0];
    const profile = `${pSun.line}/${dSun.line}`;
    const angle = ['4/1'].includes(profile) ? 'Juxtaposition (Đặt cạnh)' : ['5/1','5/2','6/2','6/3'].includes(profile) ? 'Left Angle (Góc trái)' : 'Right Angle (Góc phải)';
    const cross = { angle, gates: [pSun.gate, pers[1].gate, dSun.gate, des[1].gate] };
    return { pers, des, designDate: dDate, active, channels, defined: [...defined], type, authority, profile, definition, cross, motorToThroat };
  }


  const CHANNEL_NAME = {'1-8':'Cảm hứng','2-14':'Người giữ chìa khóa','3-60':'Đột biến','4-63':'Logic','5-15':'Nhịp điệu','6-59':'Thân mật','7-31':'Người dẫn đầu','9-52':'Tập trung','10-20':'Tỉnh thức','10-34':'Khám phá bản thân','10-57':'Hình thái hoàn hảo','11-56':'Tò mò','12-22':'Cởi mở','13-33':'Người trải nghiệm','16-48':'Bước sóng tài năng','17-62':'Chấp nhận, tổ chức','18-58':'Sửa đổi','19-49':'Tổng hợp, nhạy cảm','20-34':'Bận rộn, lôi cuốn','20-57':'Sóng não','21-45':'Tiền bạc','23-43':'Cấu trúc, thấu hiểu','24-61':'Nhận thức','25-51':'Khởi xướng','26-44':'Truyền đạt','27-50':'Bảo tồn','28-38':'Đấu tranh','29-46':'Khám phá','30-41':'Nhận biết','32-54':'Chuyển hóa','34-57':'Sức mạnh','35-36':'Phù du, trải nghiệm','37-40':'Cộng đồng','39-55':'Cảm xúc dâng trào','42-53':'Trưởng thành','47-64':'Trừu tượng'};
  const chKey = c => c.gates.slice().sort((a, b) => a - b).join('-');

  /* ---- Vẽ bodygraph (SVG). Màu lấy từ biến CSS của trang ---- */
  const SHAPE = {
    head: [[200,22],[250,100],[150,100]], ajna: [[150,130],[250,130],[200,207]],
    throat: [[160,240],[240,240],[240,320],[160,320]], g: [[200,355],[245,400],[200,445],[155,400]],
    heart: [[284,380],[318,440],[250,440]], spleen: [[40,425],[120,490],[40,555]], solar: [[360,425],[280,490],[360,555]],
    sacral: [[160,480],[240,480],[240,560],[160,560]], root: [[160,590],[240,590],[240,670],[160,670]]
  };
  const MID = {}; Object.entries(SHAPE).forEach(([k, pts]) => MID[k] = [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length]);
  const GP = { 64:[170,100],61:[200,100],63:[230,100], 47:[172,130],24:[200,130],4:[228,130],17:[180,175],43:[200,204],11:[220,175],
    62:[172,240],23:[200,240],56:[228,240],16:[160,262],20:[160,302],35:[240,258],12:[240,278],45:[240,302],31:[180,320],8:[200,320],33:[220,320],
    7:[186.5,368.5],1:[200,357],13:[213.5,368.5],10:[157,400],25:[243,400],15:[186.5,431.5],2:[200,443],46:[213.5,431.5],
    21:[294.2,398],51:[268.7,407],26:[262,440],40:[306,440],
    48:[56,438],57:[72,451],44:[88,464],50:[104,477],32:[100,506.3],28:[80,522.5],18:[60,538.8],
    36:[344,438],22:[328,451],37:[312,464],6:[296,477],49:[300,506.3],55:[320,522.5],30:[340,538.8],
    5:[180,480],14:[200,480],29:[220,480],34:[160,492],27:[160,525],59:[240,525],42:[178,560],3:[200,560],9:[222,560],
    53:[178,590],60:[200,590],52:[222,590],54:[160,612],38:[160,633],58:[160,654],19:[240,612],39:[240,633],41:[240,654] };
  const BEND = { '20-34': [112, 397] };   // kênh vòng qua trái để không cắt trung tâm G
  const FILL = { head:'y', ajna:'g', throat:'b', g:'y', heart:'r', sacral:'r', solar:'b', spleen:'b', root:'b' };
  // Đa giác bo góc mềm
  function roundPoly(pts, r) {
    const n = pts.length, f = v => v.toFixed(1); let d = '';
    for (let i = 0; i < n; i++) {
      const p = pts[i], a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
      const la = Math.hypot(a[0] - p[0], a[1] - p[1]), lb = Math.hypot(b[0] - p[0], b[1] - p[1]), k = Math.min(r, la / 3, lb / 3);
      const p1 = [p[0] + (a[0] - p[0]) / la * k, p[1] + (a[1] - p[1]) / la * k], p2 = [p[0] + (b[0] - p[0]) / lb * k, p[1] + (b[1] - p[1]) / lb * k];
      d += (i ? 'L' : 'M') + f(p1[0]) + ',' + f(p1[1]) + 'Q' + f(p[0]) + ',' + f(p[1]) + ' ' + f(p2[0]) + ',' + f(p2[1]);
    }
    return d + 'Z';
  }
  const BODY = 'M200,2C252,2 270,48 270,100C270,150 252,188 238,210L238,224C304,230 354,250 366,300L374,340C384,450 382,560 344,636C322,676 272,692 200,692C128,692 78,676 56,636C18,560 16,450 26,340L34,300C46,250 96,230 162,224L162,210C148,188 130,150 130,100C130,48 148,2 200,2Z';
  function svg(c, unsure) {
    unsure = unsure || new Set();
    const on = g => c.active[g] || { p: false, d: false };
    const col = g => { const s = on(g); return s.p && s.d ? 'url(#hdBoth)' : s.p ? 'var(--ink)' : s.d ? 'var(--seal)' : null; };
    const f = n => n.toFixed(1);
    let tubes = '', fills = '';
    CHANNELS.forEach(([a, b]) => {
      const P0 = GP[a], P2 = GP[b], key = a + '-' + b;
      const C = BEND[key] || [(P0[0] + P2[0]) / 2, (P0[1] + P2[1]) / 2];
      const M01 = [(P0[0] + C[0]) / 2, (P0[1] + C[1]) / 2], M12 = [(C[0] + P2[0]) / 2, (C[1] + P2[1]) / 2], M = [(M01[0] + M12[0]) / 2, (M01[1] + M12[1]) / 2];
      tubes += `<path d="M${f(P0[0])},${f(P0[1])} Q${f(C[0])},${f(C[1])} ${f(P2[0])},${f(P2[1])}"/>`;
      const ca = col(a), cb = col(b);
      if (ca) fills += `<path stroke="${ca}" d="M${f(P0[0])},${f(P0[1])} Q${f(M01[0])},${f(M01[1])} ${f(M[0])},${f(M[1])}"/>`;
      if (cb) fills += `<path stroke="${cb}" d="M${f(M[0])},${f(M[1])} Q${f(M12[0])},${f(M12[1])} ${f(P2[0])},${f(P2[1])}"/>`;
    });
    const centers = Object.keys(SHAPE).map(k => {
      const def = c.defined.includes(k);
      return `<g class="hd-center ${def ? 'def' : 'open'}" data-tip="hd" data-key="center:${k}" tabindex="0" role="button" aria-label="Trung tâm ${CENTERS[k].name}, ${def ? 'có định nghĩa' : 'để mở'}"><path d="${roundPoly(SHAPE[k], 9)}"${def ? ` style="fill:var(--hd-${FILL[k]})"` : ''}/></g>`;
    }).join('');
    const gates = Object.keys(c.active).map(Number).concat([...unsure].filter(g => !c.active[g])).map(g => {
      const k = centerOfGate[g], [x0, y0] = GP[g], [mx, my] = MID[k], d = Math.hypot(mx - x0, my - y0) || 1, x = x0 + (mx - x0) / d * 11, y = y0 + (my - y0) / d * 11, s = on(g);
      const cls = s.p && s.d ? 'both' : s.p ? 'p' : s.d ? 'd' : 'off';
      return `<g class="hd-gate ${cls}${unsure.has(g) ? ' unsure' : ''}" data-tip="hd" data-key="gate:${g}" tabindex="0" role="button" aria-label="Cổng ${g}"><circle cx="${f(x)}" cy="${f(y)}" r="8"/><text x="${f(x)}" y="${f(y + 3.2)}">${g}</text></g>`;
    }).join('');
    return `<svg class="hd-svg" viewBox="10 -4 380 702" role="img" aria-label="Biểu đồ Human Design: ${c.defined.length} trung tâm có định nghĩa, ${c.channels.length} kênh">
      <defs><pattern id="hdBoth" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)"><rect width="3.5" height="7" fill="var(--ink)"/><rect x="3.5" width="3.5" height="7" fill="var(--seal)"/></pattern></defs>
      <path class="hd-body-sil" d="${BODY}"/>
      <g class="hd-tube-o">${tubes}</g><g class="hd-tube-i">${tubes}</g><g class="hd-fill">${fills}</g>${centers}${gates}</svg>`;
  }

  /* ---- Tóm tắt cho AI (chỉ gửi khi người xem hỏi) ---- */
  function brief(c, note) {
    const t = TYPE[c.type], act = (arr) => arr.map(x => `${x.name} ${x.gate}.${x.line}`).join(', ');
    return `[HUMAN DESIGN] (hệ phụ, chỉ dùng khi câu hỏi nhắc tới Human Design hoặc thứ trong biểu đồ)${note ? ' ' + note : ''}
Loại ${c.type} (${t.vi}); chiến lược: ${t.strategy}; thẩm quyền ${c.authority}; hồ sơ ${c.profile}; định nghĩa ${c.definition}; thập tự ${c.cross.angle} ${c.cross.gates.join('/')}.
Trung tâm có định nghĩa: ${c.defined.map(k => CENTERS[k].name).join(', ') || 'không'}; để mở: ${Object.keys(CENTERS).filter(k => !c.defined.includes(k)).map(k => CENTERS[k].name).join(', ')}.
Kênh: ${c.channels.map(x => chKey(x) + ' ' + CHANNEL_NAME[chKey(x)]).join(', ') || 'không có'}.
Personality (ý thức): ${act(c.pers)}. Design (vô thức): ${act(c.des)}.`;
  }

  const TYPE = {
    'Generator': { vi: 'Người Tạo dựng', strategy: 'Chờ để đáp ứng', sig: 'Hài lòng', notSelf: 'Bực bội',
      text: 'Nguồn năng lượng bền, làm tốt nhất khi dồn sức vào việc mình thật sự thích. Thay vì tự lao vào, hãy chờ điều gì đó xuất hiện rồi nghe phản ứng "ừ/ừm" trong bụng.' },
    'Manifesting Generator': { vi: 'Người Tạo dựng Biểu hiện', strategy: 'Chờ để đáp ứng, rồi báo trước khi làm', sig: 'Hài lòng', notSelf: 'Bực bội, nóng giận',
      text: 'Năng lượng bền và nhanh, làm nhiều việc cùng lúc, hay nhảy bước. Vẫn nên chờ để đáp ứng, nhưng khi đã chọn thì báo cho người liên quan để đỡ va chạm.' },
    'Manifestor': { vi: 'Người Khởi xướng', strategy: 'Thông báo trước khi hành động', sig: 'Bình an', notSelf: 'Giận dữ',
      text: 'Sinh ra để mở đầu, châm ngòi cho việc mới. Không cần chờ ai mời, nhưng nên báo trước để người xung quanh không thấy bị bất ngờ hay cản đường.' },
    'Projector': { vi: 'Người Dẫn dắt', strategy: 'Chờ được mời', sig: 'Thành công', notSelf: 'Cay đắng',
      text: 'Giỏi nhìn thấu người khác và hệ thống, hợp vai dẫn dắt, cố vấn. Lời khuyên có sức nặng nhất khi được mời; tự xông vào dễ bị phớt lờ và mệt.' },
    'Reflector': { vi: 'Người Phản chiếu', strategy: 'Chờ một chu kỳ trăng (khoảng 28 ngày) trước quyết định lớn', sig: 'Ngạc nhiên thú vị', notSelf: 'Thất vọng',
      text: 'Rất hiếm, như tấm gương phản chiếu môi trường. Chọn đúng nơi chốn và con người là điều quan trọng nhất; quyết định lớn nên để qua một chu kỳ trăng.' }
  };
  const AUTH = {
    'Emotional': 'Cảm xúc: đừng quyết khi đang ở đỉnh vui hay đáy buồn. Để qua một thời gian, cảm xúc lắng xuống mới thấy rõ.',
    'Sacral': 'Sacral: tin phản ứng tức thì trong bụng (ừ/ừm, hứng/không hứng) ngay lúc được hỏi.',
    'Splenic': 'Bản năng: tin cảm giác đầu tiên, thoáng qua, chỉ nói một lần; nghĩ lại nhiều là mất.',
    'Ego Manifested': 'Ý chí: nghe xem mình có thật sự muốn và cam kết được không, rồi nói ra điều đó.',
    'Ego Projected': 'Ý chí: nói chuyện với người tin cậy, nghe xem điều mình muốn có phục vụ chính mình không.',
    'Self-Projected': 'Bản thể: nói to ra với người tin cậy, nghe chính giọng mình để biết hướng nào đúng.',
    'Mental': 'Môi trường: không có la bàn bên trong cố định; nói chuyện với vài người tin cậy ở nơi đúng để thấy rõ.',
    'Lunar': 'Chu kỳ trăng: để quyết định lớn qua khoảng 28 ngày, xem cảm nhận thay đổi thế nào.'
  };
  const PROFILE_LINE = ['', 'Người tìm hiểu: cần nền móng, thích nghiên cứu tận gốc', 'Người ẩn sĩ: có tài tự nhiên, cần thời gian riêng, chờ được gọi ra',
    'Người thử nghiệm: học qua va vấp, thử rồi sai rồi sửa', 'Người kết nối: cơ hội đến qua mạng lưới quen biết', 'Người giải quyết: người khác hay đặt kỳ vọng, nhờ cứu nguy',
    'Người làm gương: ba chặng đời, thử nghiệm, lùi lại quan sát, rồi làm hình mẫu'];
  const CENTER_TEXT = {
    head: ['Cảm hứng, câu hỏi, áp lực phải nghĩ', 'cảm hứng ổn định, có câu hỏi riêng', 'dễ bị cuốn theo câu hỏi của người khác, nên chọn điều đáng nghĩ'],
    ajna: ['Cách tư duy, xử lý thông tin', 'cách nghĩ cố định, đáng tin', 'đầu óc linh hoạt, nhìn được nhiều góc; đừng ép mình phải chắc chắn'],
    throat: ['Nói, biểu đạt, biến thành hành động', 'giọng nói, cách diễn đạt ổn định', 'dễ cố nói để được chú ý; chờ đúng lúc thì lời có sức nặng'],
    g: ['Bản thể, hướng đi, tình yêu', 'biết mình là ai, hướng đi khá rõ', 'bản thân thay đổi theo nơi chốn, con người; chọn đúng môi trường là chính'],
    heart: ['Ý chí, giá trị bản thân, cam kết', 'ý chí mạnh, giữ lời được', 'đừng cố chứng minh giá trị, đừng hứa quá sức'],
    sacral: ['Sức sống, năng lượng làm việc, tình dục', 'năng lượng bền, làm việc yêu thích không biết mệt', 'không có nguồn sức bền liên tục; biết khi nào đủ để nghỉ'],
    solar: ['Cảm xúc, cảm hứng, đam mê', 'cảm xúc lên xuống theo sóng của riêng mình', 'hấp thụ cảm xúc người khác; dễ né va chạm để giữ yên'],
    spleen: ['Bản năng, sức khỏe, nỗi sợ, thời điểm', 'bản năng nhạy, cảm nhận tức thì', 'dễ bám vào thứ không còn tốt cho mình vì sợ mất'],
    root: ['Áp lực, động lực, nhịp hối hả', 'chịu áp lực tốt, có nhịp riêng', 'dễ bị áp lực đẩy làm vội cho xong']
  };
  // Nghĩa ngắn của 64 cổng (theo tên quẻ Kinh Dịch tương ứng, diễn đạt lại)
  const GATE = {1:'Tự thể hiện, sáng tạo theo cách riêng',2:'Định hướng, biết lối đi cao hơn',3:'Sắp xếp cái mới từ hỗn loạn',4:'Trả lời, công thức, lời giải',5:'Nhịp đều, thói quen cố định',6:'Ma sát, cảm xúc quyết định gần gũi',7:'Vai trò dẫn dắt, định hướng tập thể',8:'Đóng góp, làm gương bằng sự độc đáo',9:'Tập trung vào chi tiết',10:'Yêu chính mình, sống thật',11:'Ý tưởng, hình ảnh, niềm tin',12:'Thận trọng trong lời nói, biểu đạt đúng lúc',13:'Lắng nghe, giữ bí mật của người khác',14:'Năng lực tích lũy tài sản',15:'Bao dung, chấp nhận nhịp khác nhau',16:'Kỹ năng, nhiệt huyết luyện tập',17:'Ý kiến, nhìn trước tổ chức',18:'Sửa sai, cải thiện',19:'Nhu cầu, nhạy với nhu cầu người khác',20:'Hiện tại, có mặt ngay lúc này',21:'Kiểm soát, nắm nguồn lực',22:'Duyên dáng, mở lòng',23:'Đơn giản hóa, diễn giải điều mới',24:'Suy ngẫm lặp lại, trở về',25:'Ngây thơ, tình yêu vô điều kiện',26:'Bán, thuyết phục, tô điểm',27:'Chăm sóc, nuôi dưỡng',28:'Tìm ý nghĩa, dám liều',29:'Nói có, cam kết hết mình',30:'Khao khát, mong đợi cảm xúc',31:'Ảnh hưởng, tiếng nói dẫn dắt',32:'Bền lâu, giữ cái đáng giữ',33:'Rút lui, nhìn lại và kể chuyện',34:'Sức mạnh, năng lượng tự thân',35:'Trải nghiệm, muốn thử cái mới',36:'Khủng hoảng, trải nghiệm cảm xúc mạnh',37:'Tình thân, thỏa thuận, gia đình',38:'Chiến đấu cho điều có ý nghĩa',39:'Khiêu khích, đánh thức người khác',40:'Một mình, nghỉ sau khi làm',41:'Khởi đầu, mơ ước, tưởng tượng',42:'Hoàn thành chu kỳ',43:'Thấu hiểu, ý tưởng đột phá',44:'Cảnh giác, nhận ra khuôn mẫu',45:'Người giữ của, phân phát',46:'Tận hưởng cơ thể, đúng chỗ đúng lúc',47:'Hiểu ra, sắp xếp quá khứ cho có nghĩa',48:'Chiều sâu, kiến thức nền',49:'Nguyên tắc, cải cách',50:'Giá trị, bảo vệ chuẩn mực',51:'Gây sốc, dám bứt phá',52:'Đứng yên, tập trung',53:'Khởi đầu, bắt tay vào',54:'Tham vọng, muốn đi lên',55:'Dồi dào cảm xúc, tinh thần',56:'Kể chuyện, kích thích tò mò',57:'Trực giác, nghe thấu',58:'Niềm vui sống, muốn hoàn thiện',59:'Thân mật, phá rào cản',60:'Chấp nhận giới hạn',61:'Bí ẩn, tìm sự thật bên trong',62:'Chi tiết, đặt tên sự việc',63:'Hoài nghi, đặt câu hỏi',64:'Rối rồi sáng, hình ảnh từ quá khứ'};
  return { chart, gateOf, svg, brief, chKey, CHANNEL_NAME, CENTERS, CHANNELS, centerOfGate, TYPE, AUTH, PROFILE_LINE, CENTER_TEXT, GATE };
})();
if (typeof module !== 'undefined') module.exports = HD;
