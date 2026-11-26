/* Tứ Chiếu — bố cục trang kết quả.
   Một tầng điều hướng duy nhất: Tổng quan · Lá số · Hợp nhau. Chỉ có một chỗ hỏi: ngay dưới bài luận ở Tổng quan. Không tab con, không mục gập: cứ cuộn là đọc hết.
   Lớp này chỉ sắp xếp lại các khối mà trang đã vẽ (dùng window.TCUI = { R, show, go, labOpen }), không đổi phần tính toán. */
(() => {
  const $ = s => document.querySelector(s), UI = window.TCUI;
  if (!UI) return;
  document.body.classList.add('flow');

  /* ---------- 3 mục; mục Lá số có hàng chọn môn ---------- */
  const SYS = [
    { k: 'tv', name: 'Tử vi', tab: 't-tv' }, { k: 'bz', name: 'Bát tự', tab: 't-bz' }, { k: 'as', name: 'Chiêm tinh', tab: 't-as' }, { k: 'nm', name: 'Thần số', tab: 't-nm' },
    { k: 'qm', name: 'Kỳ Môn', tab: 't-lab', lab: 'qm', beta: true }, { k: 'hd', name: 'Human Design', tab: 't-lab', lab: 'hd', beta: true }, { k: 'kd', name: 'Kinh Dịch', tab: 't-lab', lab: 'kd', beta: true }
  ];
  const ICON = {
    ban: '<path d="M12 3 13.6 10.4 21 12 13.6 13.6 12 21 10.4 13.6 3 12 10.4 10.4Z"/>',
    homnay: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    laso: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
    hop: '<circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/>'
  };
  // ba màn: Bạn (thẻ + luận giải) · Hôm nay (ngày, năm, Kể nghe) · Lá số (từng môn, Hợp nhau)
  const SEC = [['ban', 'Bạn'], ['homnay', 'Hôm nay'], ['laso', 'Lá số']];
  let cur = 'ban', sys = 'tv';
  // chuyển động: Yên chậm, êm; Vui nảy hơn. Máy bật "giảm chuyển động" thì bỏ hết
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  const vui = () => document.documentElement.dataset.skin === 'vui';
  const EASE = () => vui() ? 'cubic-bezier(.34,1.56,.64,1)' : 'cubic-bezier(.2,.8,.2,1)';
  const anim = (node, kf, ms) => !RM.matches && node && node.animate ? node.animate(kf, { duration: ms * (vui() ? .8 : 1), easing: EASE(), fill: 'backwards' }) : null;

  const res = $('#ket-qua .container');
  const bar = el('div', 'fl-who'); bar.id = 'flWho';
  const nav = el('nav', 'fl-nav'); nav.setAttribute('aria-label', 'Các mục kết quả');
  nav.innerHTML = SEC.map(([k, n]) => `<button type="button" data-sec="${k}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg><span>${n}</span></button>`).join('');
  const pick = el('div', 'fl-sys'); pick.setAttribute('role', 'group'); pick.setAttribute('aria-label', 'Chọn môn');
  pick.innerHTML = SYS.map((s, i) => `${s.beta && !SYS[i - 1].beta ? '<span class="fl-beta">Beta</span>' : ''}<button type="button" data-sys="${s.k}">${s.name}</button>`).join('') + '<span class="fl-beta"></span><button type="button" data-hop>Hợp nhau</button>';
  res.prepend(bar, nav, pick);
  const ind = el('span', 'fl-nav-ind'); nav.append(ind);
  const bottom = nav.cloneNode(true); bottom.className = 'fl-bottom'; document.body.append(bottom);
  function el(t, c) { const e = document.createElement(t); e.className = c; return e; }

  function open(sec, s) {
    const changed = sec !== cur; cur = sec; if (s) sys = s;
    const S = SYS.find(x => x.k === sys);
    UI.show(sec === 'ban' || sec === 'homnay' ? 't-sum' : sec === 'hop' ? 't-hop' : S.tab);
    if (sec === 'laso' && S.lab) UI.labOpen(S.lab);
    sync();
    if (changed) { anim($('#result'), [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], 320); if (sec === 'homnay') countDay(); }
    const y = res.getBoundingClientRect().top + scrollY - 64; if (scrollY > y + 10) scrollTo({ top: y });
  }
  function sync() {
    // trang cũ vẫn tự gọi show() (nút "Xem Tử vi →", "Hỏi AI về điều này"): suy ra mục đang mở từ tab đang chọn
    const t = (document.querySelector('.tabs [role=tab][aria-selected=true]') || {}).id || 't-sum';
    // nút cũ mở "Luận giải AI" (Hỏi AI về năm…, Hỏi AI về điều này): đưa về Tổng quan, cuộn tới ô hỏi
    if (t === 't-ai') { UI.show('t-sum'); if (cur !== 'homnay') cur = 'ban'; askOpen(); }
    else if (t === 't-sum') { if (cur !== 'homnay') cur = 'ban'; } else if (t === 't-hop') cur = 'hop';
    else { cur = 'laso'; const S = SYS.find(x => x.tab === t && (!x.lab || x.lab === (document.querySelector('#labNav [aria-pressed=true]') || {}).dataset?.lab)); if (S) sys = S.k; }
    const navCur = cur === 'hop' ? 'laso' : cur;
    [nav, bottom].forEach(n => n.querySelectorAll('[data-sec]').forEach(b => b.setAttribute('aria-current', b.dataset.sec === navCur ? 'page' : 'false')));
    document.body.dataset.sec = cur; moveInd();
    pick.hidden = cur !== 'laso' && cur !== 'hop';
    pick.querySelectorAll('[data-sys]').forEach(b => b.setAttribute('aria-pressed', cur === 'laso' && b.dataset.sys === sys));
    pick.querySelector('[data-hop]').setAttribute('aria-pressed', cur === 'hop');
    hero.hidden = synth.hidden = cur !== 'ban'; todayBox.hidden = cur !== 'homnay'; read.hidden = traits.hidden = tiles.hidden = true;
  }
  [nav, bottom].forEach(n => n.querySelectorAll('[data-sec]').forEach(b => b.onclick = () => open(b.dataset.sec)));
  pick.querySelectorAll('[data-sys]').forEach(b => b.onclick = () => open('laso', b.dataset.sys));
  pick.querySelector('[data-hop]').onclick = () => open('hop');
  new MutationObserver(sync).observe($('.tabs'), { attributes: true, subtree: true, attributeFilter: ['aria-selected'] });

  /* ---------- Hai chế độ: nhập thông tin / xem kết quả ---------- */
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  function who() {
    const R = UI.R(); if (!R) return; const i = R.input;
    bar.innerHTML = `<div><b>${esc(i.name)}</b><span>${i.gender === 'nam' ? 'Nam' : 'Nữ'} · ${i.date.split('-').reverse().join('/')} · ${esc(i.timeLabel)} · ${esc(i.place)}</span></div><button type="button" class="btn-ghost btn-sm" id="flEdit">Sửa</button>`;
    $('#flEdit').onclick = () => { document.body.classList.remove('has-result'); scrollTo({ top: 0 }); };
  }
  function showResult() { document.body.classList.add('has-result'); who(); sync(); }
  $('#f').addEventListener('submit', () => setTimeout(() => { if (!UI.R()) return; arrange(false); showResult(); open('ban'); scrollTo({ top: 0 }); restoreReading(); }, 0));

  /* ---------- Tổng quan chứa luôn bài luận AI; mục Hỏi chỉ còn ô hỏi ---------- */
  const read = el('section', 'fl-read'); read.setAttribute('aria-label', 'Luận giải');
  // bỏ ô "bối cảnh": bài Tổng quan luôn là bài tổng quát, muốn hỏi gì thì hỏi ở ô ngay dưới bài
  const ctxField = $('#ctx').closest('.field'); ctxField.hidden = true; $('#ctx').value = '';
  const head = $('#p-ai .ai-head'); head.querySelector('h2').textContent = 'Luận giải của bạn';
  const chatSlot = el('div', 'fl-chatslot');
  const synth = el('section', 'fl-luan'); synth.setAttribute('aria-label', 'Luận giải của bạn');
  synth.innerHTML = `<div class="fl-say"></div>
    <div class="fl-chap-h" hidden><span class="fl-lab">Đọc theo từng mảng</span><span class="fl-vtog" role="group" aria-label="Cách hiện"><button type="button" data-v="list" aria-pressed="true">Danh sách</button><button type="button" data-v="grid" aria-pressed="false">Dạng ô</button></span></div>
    <div class="fl-chlist"></div>
    <div class="fl-luan-foot" hidden><button type="button" class="fl-link" id="flFull">Đọc luận giải đầy đủ ›</button></div>
    <div class="fl-luan-src"></div>`;
  synth.querySelector('.fl-luan-src').append(head, $('#aiOut'));
  read.append(chatSlot);
  // đặt ngoài #p-sum (khối đó bị vẽ lại mỗi lần lập lá số), ẩn hiện theo mục Tổng quan
  const traits = el('div', 'fl-traits'); traits.hidden = true;
  const hero = el('section', 'fl-hero'); hero.hidden = true;
  const tiles = el('div', 'fl-tiles'); tiles.hidden = true;
  const todayBox = el('section', 'fl-today'); todayBox.hidden = true; todayBox.setAttribute('aria-label', 'Hôm nay của bạn');
  $('#p-sum').before(hero, todayBox, traits); $('#p-sum').after(tiles, synth, read);
  // khách quay lại (mở trang đã có lá số lưu sẵn): Hôm nay lên đầu; lần đầu lập lá số: thẻ bầu trời lên đầu
  function arrange(back) { if (back) tiles.before(hero); else todayBox.before(hero); }
  const opt = el('details', 'fl-opt'); opt.innerHTML = '<summary>Tùy chọn</summary><div class="fl-opt-body"></div>';
  [head.querySelector('label[for=focus]'), $('#focus'), $('#code'), $('#copyPrompt')].forEach(x => x && opt.lastChild.append(x));
  head.querySelector('.ai-controls').append(opt);
  // ô hỏi: tiêu đề và gợi ý
  // ô hỏi: chỉ một chỗ, ngay dưới bài luận ở Tổng quan
  const chat = $('#chat'); chatSlot.append(chat);
  chat.insertAdjacentHTML('afterbegin', '<p class="small muted" style="margin:0 0 10px">Hỏi về tính cách, công việc, tình cảm, năm nay… Câu "có nên…" sẽ được đọc bằng Kỳ Môn theo đúng lúc hỏi.</p>');
  const hint = chat.querySelector('.chat-hint'); if (hint) hint.remove();
  chat.append($('#askStatus'));

  /* ---------- Sau mỗi lần vẽ lại: gỡ tab con, gom khối về đúng chỗ ---------- */
  const TECH = ['Các hành tinh tác động lẫn nhau', 'Các hành tinh lúc bạn sinh', '12 mảng đời sống'];
  function tidy() {
    // nét tính cách nổi bật (Tử vi), ngay dưới bài luận; tính lại khi lá số đổi
    const R = UI.R();
    if (R && R.tuvi !== tidy.tv) { tidy.tv = R.tuvi; traits.innerHTML = '';
      const top = R.tuvi && typeof TVP !== 'undefined' ? TVP.traits(R.tuvi).filter(x => x.pct >= 75 || x.pct <= 25).sort((a, b) => Math.abs(b.pct - 50) - Math.abs(a.pct - 50)).slice(0, 3) : [];
      if (top.length) traits.innerHTML = `<span class="label">Nổi bật nhất theo Tử vi</span><div>${top.map(x => `<span class="fl-trait"><b>${x.name}</b> <span class="${x.pct >= 75 ? 't-tot' : 't-luuy'}">${x.level.toLowerCase()}</span> <small>hơn ${x.pct}% người</small></span>`).join('')}</div>`;
      traits.classList.toggle('empty', !top.length); }
    if (R && R !== tidy.r) { tidy.r = R; visuals(R); renderToday(R, localYmd(new Date())); }
    // Năm của bạn: bản gọn (tên năm, nhãn); bấm mới mở bốn ô chi tiết
    const yp = $('#yearPanel');
    if (yp && !yp.querySelector('.fl-yr-more')) { const t = el('button', 'btn-ghost btn-sm fl-yr-more'); t.type = 'button'; t.textContent = 'Xem chi tiết năm';
      t.onclick = () => { const o = yp.classList.toggle('open'); t.textContent = o ? 'Thu gọn' : 'Xem chi tiết năm'; }; yp.append(t); }
    if (synth.classList.contains('streaming') && !$('#aiGo').disabled && !$('#aiOut .rd-sec')) { synth.classList.remove('streaming'); buildLuan(); }
    // bài luận: chưa viết thì ẩn khung chữ hướng dẫn
    const ao = $('#aiOut'); if (ao) ao.hidden = /Bấm\s*Đọc luận giải/.test(ao.textContent) && ao.children.length <= 1;
    // Tử vi: hiện liền mọi phần (cách cục, nét tính cách, đại hạn, 12 tháng)
    document.querySelectorAll('#p-tv [role=tabpanel][hidden]').forEach(x => x.hidden = false);
    // Kỳ Môn: bỏ nút chuyển chế độ, hiện liền hai phần: Hỏi việc ở trên, Mệnh bàn ở dưới
    const qmHead = $('#lab-qm .qm-head .seg'); if (qmHead) qmHead.remove();
    const qmM = $('#qmMenh'), qmH = $('#qmHoi');
    if (qmM && qmH && !qmH.dataset.fl) {
      qmH.dataset.fl = 1; qmH.hidden = false; qmM.hidden = false; qmM.before(qmH);
      qmH.insertAdjacentHTML('afterbegin', '<h3 class="fl-qmh">Hỏi một việc cụ thể</h3><p class="small muted" style="margin:0 0 8px">Bàn lập đúng lúc bạn hỏi. Hợp với câu kiểu "có nên…", "…được không", "khi nào nên…".</p>');
      qmM.insertAdjacentHTML('afterbegin', '<h3 class="fl-qmh" style="margin-top:28px">Bàn Kỳ Môn lúc bạn sinh</h3>');
      // câu hỏi việc từ ô Hỏi ở Tổng quan có thể đã mang khung kết quả đi; hỏi ở đây thì trả khung về chỗ cũ
      const go = $('#qmGo'), orig = go && go.onclick;
      if (go && orig) go.onclick = e => { const out = $('#qmHoiOut');
        if (out && !qmH.contains(out)) { if (out.innerHTML.trim()) { const snap = out.cloneNode(true); snap.removeAttribute('id'); snap.querySelectorAll('[id]').forEach(x => x.removeAttribute('id')); snap.querySelectorAll('.qm-chat,.qa-more').forEach(x => x.remove()); out.replaceWith(snap); } else out.remove();
          const fresh = document.createElement('div'); fresh.id = 'qmHoiOut'; qmH.append(fresh); }
        return orig.call(go, e); };
    }
    // bài luận: mở hết các phần, không gập
    document.querySelectorAll('#aiOut .rd-body[hidden]').forEach(b => b.hidden = false);
    // chiêm tinh: bảng kỹ thuật xuống cuối trang
    document.querySelectorAll('#p-as .panel h3').forEach(h => { if (TECH.includes(h.textContent.split('·')[0].trim())) h.closest('.panel').classList.add('fl-tech'); });
    // đoạn giải thích dài dưới tiêu đề: thu thành nút (?), không phải nội dung chính
    document.querySelectorAll('#result .panel h3, #result .cc-head h3').forEach(h => {
      if (h.dataset.fl) return; h.dataset.fl = 1;
      const anchor = h.closest('.cc-head') || h, p = anchor.nextElementSibling;
      if (!p || !p.matches('p.small.muted') || p.textContent.length < 60) return;
      p.hidden = true; p.classList.add('fl-help');
      const q = document.createElement('button'); q.type = 'button'; q.className = 'fl-q'; q.setAttribute('aria-label', 'Giải thích'); q.setAttribute('aria-expanded', 'false'); q.textContent = '?';
      q.onclick = () => { p.hidden = !p.hidden; q.setAttribute('aria-expanded', !p.hidden); }; h.append(q);
    });
    sync();
  }
  /* ---------- Thẻ đầu Tổng quan: bầu trời lúc sinh, trăng đúng pha, bốn tia là bốn môn (card.js lo phần nội dung) ---------- */
  function visuals(R) {
    if (typeof CARD === 'undefined') return;
    const K = CARD.build(R), i = R.input, by = Object.fromEntries(K.votes.map(v => [v.k, v]));
    let S = null; try { S = typeof STORY !== 'undefined' ? STORY.build(R, K) : null; } catch (e) { console.error(e); }
    const [y, mo, d] = i.date.split('-');
    // bốn tia: trên Bát tự, phải Chiêm tinh, dưới Tử vi, trái Thần số; tia đồng ý thì rõ, nói khác thì mờ
    const ray = (v, dPath) => v ? `<path d="${dPath}" fill="${K.RAY[v.el]}" opacity="${v.agree || !K.main ? 1 : .42}"/>` : '';
    const rays = ray(by.bz, 'M100 10 102.5 92 100 100 97.5 92Z') + ray(by.as, 'M190 100 108 102.5 100 100 108 97.5Z') + ray(by.tv, 'M100 190 97.5 108 100 100 102.5 108Z')
      + `<path d="M10 100 92 97.5 100 100 92 102.5Z" fill="#f1dca8" opacity=".55"/>`;
    const stars = [[14, 22, 2, .8], [31, 14, 1.5, .5], [70, 20, 2, .7], [84, 36, 1.5, .5], [9, 46, 1.5, .4], [58, 10, 1.5, .6], [42, 30, 1.2, .35]]
      .map(([x, yy, r, o]) => `<span class="fl-star" style="left:${x}%;top:${yy}%;width:${r}px;height:${r}px;--o:${o};animation-delay:${(x * 7 % 30) / 10}s"></span>`).join('');
    const moonSvg = K.moon ? `<svg width="26" height="26" viewBox="-23 -23 46 46" role="img" aria-label="${K.moon.name}, ngày ${K.lunarDay} âm"><circle r="18" fill="#fff" opacity=".1"/>${K.moon.dark ? '' : `<path d="${K.moon.path}" fill="#F6EEDC"/>`}</svg>` : '';
    const [g0, g1, g2] = K.sky.g, tint = K.main ? K.INK[K.main] : '#5a6aa0';
    hero.innerHTML = `<div class="fl-card${S ? ' has-sil' : ''}" style="--g0:${g0};--g1:${g1};--g2:${g2};--tint:${tint}">
        <div class="fl-sky"><div class="fl-grain"></div>${stars}${S ? `<img class="fl-sil" src="${S.sil.replace('/bong/', '/bong-rong/')}" alt="" width="1440" height="720" decoding="async">` : ''}</div>
        <div class="fl-ctop"><span>${K.timeKnown ? esc(i.time) + ' · ' : ''}${d}.${mo}.${y}</span><span class="fl-ctop-r">${moonSvg}${typeof SHARE !== 'undefined' ? '<button type="button" class="fl-sharebtn" id="flShare" aria-label="Tạo ảnh story"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M12 3v13"/><path d="m7 8 5-5 5 5"/></svg></button>' : ''}</span></div>
        <svg class="fl-mark" width="200" height="200" viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="flh"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
          <circle cx="100" cy="100" r="62" fill="none" stroke="#fff" stroke-opacity=".14"/><circle class="fl-ring" cx="100" cy="100" r="62" fill="none" stroke="#fff" stroke-width="1.5"/><circle class="fl-halo" cx="100" cy="100" r="30" fill="url(#flh)"/><g class="fl-rays">${rays}</g><circle cx="100" cy="100" r="3.5" fill="#fff"/></svg>
        <div class="fl-ct">${S ? `<span class="fl-k">${esc(i.name)} · ${esc(K.title)}</span><h2>${S.lines.map(x => `<span style="white-space:nowrap">${esc(x)}</span>`).join(' ')}</h2><p class="fl-nhu">${esc(S.nhu)}</p><button type="button" class="fl-link fl-storyb" aria-expanded="false">Câu chuyện lúc bạn sinh ›</button><div class="fl-storyx" hidden><p class="fl-story">${esc(S.story)}</p><p>${esc(S.trait)}</p></div>`
          : `<span class="fl-k">${esc(i.name)}</span><h2>${esc(K.title)}</h2><p>${esc(K.body)}</p>`}</div>
      </div>`;
    const tv = R.tuvi, menh = tv && tv.palaces.find(p => p.name === 'Mệnh'), pts = R.astro.points, known = i.timeMode !== 'unknown';
    const four = [
      ['bz', 'Bát tự', `Nhật chủ ${R.bazi.dayMaster} ${R.bazi.dayMasterHanh}, ${R.bazi.strength.level.toLowerCase()}`, by.bz],
      ['tv', 'Tử vi', !tv ? 'Cần giờ sinh để lập' : menh.major.length ? `Mệnh có ${menh.major.map(x => x.name).join(', ')}` : 'Mệnh vô chính diệu', by.tv],
      ['as', 'Chiêm tinh', `Mặt Trời ${pts[0].sign}, Trăng ${pts[1].sign}${known && R.astro.asc ? `, Mọc ${R.astro.asc.sign}` : ''}`, by.as],
      ['nm', 'Thần số', `Đường đời ${K.num}`, null]];
    tiles.innerHTML = `<div class="fl-four-h"><h2 class="fl-sec-h">Xem từng lá số</h2></div>
      <div class="fl-four">${four.map(([k, name, line, v]) => `<button type="button" class="fl-fc" data-open="${k}"><span class="fl-fc-n"><i style="background:${v ? K.INK[v.el] : '#C9A95A'}"></i>${name}${v ? ` <small>${v.el}${K.main && !v.agree ? ', nói khác' : ''}</small>` : ''}</span><span class="fl-fc-l">${esc(line)}</span><span class="fl-fc-go">Xem lá số →</span></button>`).join('')}</div>`;
    tiles.querySelectorAll('[data-open]').forEach(x => x.onclick = () => open('laso', x.dataset.open));
    const stb = hero.querySelector('.fl-storyb'); if (stb) stb.onclick = () => { const x = hero.querySelector('.fl-storyx'); x.hidden = !x.hidden; stb.setAttribute('aria-expanded', !x.hidden); };
    const sb = hero.querySelector('#flShare');
    if (sb) sb.onclick = async () => { sb.disabled = true; const t = sb.innerHTML; UI.toast('Đang tạo ảnh story…');
      try { await SHARE.share(R, UI.openSheet); } catch (e) { console.error(e); UI.toast('Không tạo được ảnh, thử lại'); }
      sb.innerHTML = t; sb.disabled = false; };
  }

  /* ---------- Hôm nay của bạn: tính bằng công thức (today.js), chọn được ngày khác ---------- */
  function localYmd(dt) { return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`; }
  function renderToday(R, ymd) {
    if (typeof TODAY === 'undefined' || !R) return;
    let T; try { T = TODAY.build(R, ymd); } catch (e) { console.error(e); todayBox.innerHTML = ''; return; }
    const isToday = ymd === localYmd(new Date()), li = a => a.map(x => `<li>${esc(x)}</li>`).join('');
    const mood = T.moon ? [T.moon.hit ? T.moon.hit.text + '.' : '', T.moon.houseTxt].filter(Boolean).join(' ') : '';
    todayBox.innerHTML = `<div class="fl-td-head"><div class="fl-td-num" aria-hidden="true">${T.d}</div><div class="fl-td-hx"><h2 class="fl-sec-h">${isToday ? 'Hôm nay của bạn' : 'Ngày bạn chọn'}</h2>
        <div class="fl-td-date">${T.thu}, ${T.d}/${T.m}/${T.y} · ngày ${esc(T.gz)}${T.lunar ? ' · ' + T.lunar : ''}</div></div>
        <div class="fl-td-nav"><button type="button" class="btn-ghost btn-sm" data-step="-1" aria-label="Ngày trước">‹</button><input type="date" value="${ymd}" aria-label="Chọn ngày"><button type="button" class="btn-ghost btn-sm" data-step="1" aria-label="Ngày sau">›</button>${isToday ? '' : '<button type="button" class="btn-ghost btn-sm" data-today>Hôm nay</button>'}</div></div>
      <div class="fl-mood" hidden></div>
      <h3 class="fl-td-theme">${esc(T.theme)}</h3>
      <div class="fl-td-tags"><span class="fl-td-tag ${T.hoang ? 'good' : 'bad'}">Ngày ${T.hoang ? 'hoàng đạo' : 'hắc đạo'} (${T.dayThan})</span>${T.notes.slice(0, 1).map(n => `<span class="fl-td-tag ${/xung|hại/.test(n) ? 'bad' : 'good'}">${esc(n[0].toUpperCase() + n.slice(1))}</span>`).join('')}</div>
      <div class="fl-td-cols"><div><h4>Nên</h4><ul>${li(T.nen.slice(0, 2))}</ul></div><div><h4>Tránh</h4><ul>${li(T.tranh.slice(0, 2))}</ul></div></div>
      <p class="fl-td-line"><b>Giờ tốt:</b> ${T.gio.map(g => g.gio).join(', ') || 'không có giờ hoàng đạo ban ngày'}</p>
      ${mood ? `<p class="fl-td-line"><b>Tâm trạng:</b> ${esc(mood)}</p>` : ''}
      
      <details class="fl-td-why"><summary>Vì sao?</summary> Bát tự, ngày ${esc(T.gz)} là ngày ${T.god} với nhật chủ ${esc(R.bazi.dayMaster)}${T.notes.length ? '; ' + esc(T.notes.join(', ')) : ''}. Chiêm tinh, Mặt Trăng ở ${T.moon ? T.moon.sign : '?'}${T.moon && T.moon.house ? ', nhà ' + T.moon.house : ''}. Lịch Việt, ngày ${T.dayThan}, giờ hoàng đạo theo 12 thần. Thần số, số ngày cá nhân ${T.pday.n}.</details>
      <div class="fl-ke"></div>`;
    const go = v => { renderToday(R, v); anim(todayBox, [{ opacity: .3, transform: 'perspective(900px) rotateX(8deg) translateY(6px)' }, { opacity: 1, transform: 'none' }], 380); };
    todayBox.querySelector('input[type=date]').onchange = e => e.target.value && go(e.target.value);
    todayBox.querySelectorAll('[data-step]').forEach(bt => bt.onclick = () => { const [y, m, d] = ymd.split('-').map(Number); go(localYmd(new Date(y, m - 1, d + +bt.dataset.step))); });
    const tb = todayBox.querySelector('[data-today]'); if (tb) tb.onclick = () => go(localYmd(new Date()));
    const dayTxt = `Ngày ${T.thu}, ${T.d}/${T.m}/${T.y} (${T.gz}${T.lunar ? ', ' + T.lunar : ''}): chủ đề "${T.theme}"; ngày ${T.god} với nhật chủ; ${T.hoang ? 'hoàng đạo' : 'hắc đạo'} ${T.dayThan}${T.notes.length ? '; ' + T.notes.join(', ') : ''}; nên: ${T.nen.join('; ')}; nên tránh: ${T.tranh.join('; ')}; giờ tốt: ${T.gio.map(g => g.gio).join(', ') || 'không'}; Mặt Trăng ở ${T.moon ? T.moon.sign : '?'}${T.moon && T.moon.house ? ' nhà ' + T.moon.house : ''}${mood ? ' (' + mood + ')' : ''}; số ngày cá nhân ${T.pday.n}.`;
    lastYmd = ymd; renderKe(R, ymd, isToday, dayTxt); moodTip(T, ymd);
  }

  /* ---------- Kể nghe: than riêng, chỉ lưu trên máy này ---------- */
  const KE_KEY = 'tuchieu:ke', KE_MAX = 3;
  const keId = R => [R.input.name, R.input.date, R.input.time || ''].join('|');
  function keAll() { try { return JSON.parse(localStorage.getItem(KE_KEY)) || {}; } catch (e) { return {}; } }
  function keSave(all) { try { localStorage.setItem(KE_KEY, JSON.stringify(all)); } catch (e) {} }
  const keGet = (R, ymd) => ((keAll()[keId(R)] || {})[ymd]) || [];
  function kePut(R, ymd, list) { const all = keAll(), id = keId(R); all[id] = all[id] || {}; if (list.length) all[id][ymd] = list; else delete all[id][ymd]; keSave(all);
    document.dispatchEvent(new CustomEvent('tc:ke', { detail: { id, ymd, list } })); } // auth.js đồng bộ nếu người dùng bật
  // auth.js vừa kéo lời kể từ tài khoản về: vẽ lại thẻ Hôm nay
  let lastYmd = null;
  document.addEventListener('tc:ke-refresh', () => { if (UI.R() && lastYmd) renderToday(UI.R(), lastYmd); });
  // dấu hiệu nguy hiểm: hiện ngay chỗ có người thật hỗ trợ, không chờ AI
  const deacc = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  function risky(t) {
    const x = t.toLowerCase(), y = deacc(x);
    if (/tự tử|tự sát|tu sat|không muốn sống|khong muon song|không thiết sống|khong thiet song|chán sống|chan song|kết liễu|ket lieu|tự làm (hại|đau)|tu lam (hai|dau)|rạch tay|rach tay|cắt tay|cat tay|chết quách|chet quach|nhảy cầu|nhay cau|muốn biến mất|muon bien mat|không muốn tỉnh dậy|khong muon tinh day/.test(x + ' ' + y)) return true;
    const m = y.match(/(\S+)\s+muon chet/); if (!/muon chet/.test(y)) return false;
    return !m || !/^(met|nong|doi|vui|so|lo|ngai|lanh|them|kho|cuoi|chan|dau|buon|ret|nhuc|xau|ho|ngu|ngai)$/.test(m[1]);
  }
  const HELP = `<div class="fl-ke-help" role="note"><b>Bạn không phải một mình.</b> Nếu bạn đang nghĩ tới chuyện làm hại bản thân, hãy nói ngay với một người bạn tin, hoặc gọi đường dây Ngày Mai <a href="tel:0963061414">096 306 1414</a> (13h–20h30, thứ Tư đến Chủ nhật, miễn phí). Đang gặp nguy hiểm thì gọi <a href="tel:115">115</a>.</div>`;
  let keCtl = null;
  function renderKe(R, ymd, isToday, dayTxt) {
    const box = todayBox.querySelector('.fl-ke'); if (!box) return;
    const list = keGet(R, ymd), days = Object.keys(keAll()[keId(R)] || {}).length;
    const item = e => `<div class="fl-ke-it"><div class="fl-ke-q">${esc(e.q)}</div>${risky(e.q) ? HELP : ''}<div class="fl-ke-a">${UI.md(e.a)}</div></div>`;
    const left = KE_MAX - list.length;
    box.innerHTML = `${isToday ? `<h4>Hôm nay của bạn thế nào?</h4>` : list.length ? '<h4>Bạn đã kể hôm đó</h4>' : ''}
      <div class="fl-ke-list">${list.map(item).join('')}</div>
      ${isToday ? (left > 0 ? `<form class="fl-ke-f"><textarea rows="2" maxlength="800" placeholder="${list.length ? 'Kể tiếp…' : 'Kể nghe, chuyện gì cũng được…'}" aria-label="Kể chuyện hôm nay"></textarea><button type="submit" class="btn-primary btn-sm">Gửi</button></form>`
        : `<p class="small muted">Hôm nay bạn kể đủ ${KE_MAX} lần rồi, mai kể tiếp nhé.</p>`) : ''}
      <p class="fl-ke-st small" aria-live="polite"></p>
      ${days ? `<p class="fl-ke-note small"><button type="button" class="fl-ke-old">Những ngày đã kể (${days})</button></p>` : ''}`;
    const ob = box.querySelector('.fl-ke-old'); if (ob) ob.onclick = () => keSheet(R);
    const f = box.querySelector('form'); if (!f) return;
    const ta = f.querySelector('textarea'), st = box.querySelector('.fl-ke-st');
    ta.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); f.requestSubmit(); } };
    f.onsubmit = async e => {
      e.preventDefault(); const q = ta.value.trim(); if (!q) return;
      // lần đầu: hỏi đồng ý gửi lời kể tới dịch vụ AI (im lặng không tính là đồng ý)
      let agreed = false; try { agreed = !!localStorage.getItem('tuchieu:ke-ok'); } catch (x) {}
      if (!agreed) {
        if (!box.querySelector('.fl-ke-ok')) {
          f.insertAdjacentHTML('beforebegin', `<div class="fl-ke-ok"><span>Tứ Chiếu dùng AI để nghe và đáp, không ai khác đọc lời kể của bạn. <a href="/chinh-sach-bao-mat.html" target="_blank" rel="noopener">chi tiết</a></span><button type="button" class="btn-primary btn-sm">Đồng ý và gửi</button></div>`);
          box.querySelector('.fl-ke-ok button').onclick = () => { try { localStorage.setItem('tuchieu:ke-ok', new Date().toISOString()); } catch (x) {} box.querySelector('.fl-ke-ok').remove(); f.requestSubmit(); };
        }
        return;
      }
      const it = document.createElement('div'); it.className = 'fl-ke-it'; it.innerHTML = `<div class="fl-ke-q">${esc(q)}</div>${risky(q) ? HELP : ''}<div class="fl-ke-a"><p class="muted">Đang nghe…</p></div>`;
      box.querySelector('.fl-ke-list').append(it); const a = it.querySelector('.fl-ke-a');
      ta.value = ''; ta.disabled = f.querySelector('button').disabled = true; st.textContent = '';
      keCtl = new AbortController(); let text = '';
      try {
        const res = await fetch('/api/luangiai', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-access-code': UI.code() }, signal: keCtl.signal,
          body: JSON.stringify({ mode: 'ke', brief: UI.brief(), today: dayTxt, text: q, history: list.slice(-4) }) });
        if (!res.ok) { let m = 'Máy chủ báo lỗi (' + res.status + ').'; try { m = (await res.json()).error || m; } catch (x) {} throw new Error(m); }
        const rd = res.body.getReader(), dec = new TextDecoder();
        for (;;) { const { done, value } = await rd.read(); if (done) break; text += dec.decode(value, { stream: true }); a.innerHTML = UI.md(text.split('\u0000ERR:')[0]); }
        if (text.includes('\u0000ERR:')) throw new Error(text.split('\u0000ERR:')[1] || 'AI bị gián đoạn.');
        kePut(R, ymd, [...list, { q, a: text, t: Date.now() }]);
        renderKe(R, ymd, isToday, dayTxt);
      } catch (err) {
        if (!text) { it.remove(); ta.value = q; }
        else kePut(R, ymd, [...list, { q, a: text.split('\u0000ERR:')[0], t: Date.now() }]);
        st.innerHTML = `<span class="err">${esc(err.message)}</span>`; ta.disabled = f.querySelector('button').disabled = false;
      }
    };
  }
  function keSheet(R) {
    const mine = keAll()[keId(R)] || {}, ds = Object.keys(mine).sort().reverse();
    const fmt = d => { const [y, m, dd] = d.split('-'); return `${+dd}/${+m}/${y}`; };
    UI.openSheet(`<h3 id="sheetTitle" style="margin:0 0 6px">Những ngày đã kể</h3><p class="small muted" style="margin:0 0 14px">Chỉ nằm trên máy này. Xóa là mất hẳn.</p>
      ${ds.length ? ds.map(d => `<section class="fl-ke-day" data-d="${d}"><div class="fl-ke-dh"><b>${fmt(d)}</b><button type="button" class="btn-ghost btn-sm" data-del="${d}">Xóa ngày này</button></div>
        ${mine[d].map(e => `<div class="fl-ke-q">${esc(e.q)}</div><div class="fl-ke-a">${UI.md(e.a)}</div>`).join('')}</section>`).join('') : '<p class="muted">Chưa có ngày nào.</p>'}`);
    document.querySelectorAll('#sheet [data-del]').forEach(b => b.onclick = () => { kePut(R, b.dataset.del, []); b.closest('.fl-ke-day').remove(); renderToday(R, localYmd(new Date())); });
  }

  /* ---------- Bạn: luận giải là phần chính ---------- */
  const say = synth.querySelector('.fl-say'), chList = synth.querySelector('.fl-chlist'), chHead = synth.querySelector('.fl-chap-h'), lFoot = synth.querySelector('.fl-luan-foot'), lSrc = synth.querySelector('.fl-luan-src');
  const CH_EL = [[/tính cách/i, 'moc'], [/sự nghiệp|tài chính|tiền/i, 'kim'], [/tình cảm|quan hệ/i, 'hoa'], [/thời vận|năm/i, 'tho'], [/khác nhau/i, 'diff'], [/lời khuyên|nên làm/i, 'thuy']];
  function rKey() { const s = UI.saved(); return s ? 'tuchieu:reading:' + [s.name, s.date, s.time, s.placeName, s.gender].join('|') : ''; }
  function firstSentence(t) { t = t.replace(/\s+/g, ' ').trim(); const m = t.match(/^.{20,160}?[.!?](\s|$)/); return m ? m[0].trim() : t.slice(0, 140) + (t.length > 140 ? '…' : ''); }
  let view = 'list'; try { view = localStorage.getItem('tuchieu:chview') || 'list'; } catch (e) {}
  function buildLuan() {
    const secs = [...$('#aiOut').querySelectorAll('.rd-sec')];
    if (!secs.length) { // chưa có luận giải: một lời mời
      chHead.hidden = lFoot.hidden = true; chList.innerHTML = ''; synth.classList.remove('has-luan');
      say.innerHTML = `<span class="fl-lab">Bốn lá số cùng nói</span><p class="fl-say-big">Bát tự, Tử vi, Chiêm tinh và Thần số đọc chéo nhau, ra một kết luận về bạn.</p><button type="button" class="btn-primary" id="flRead">Đọc luận giải</button>`;
      say.querySelector('#flRead').onclick = () => { $('#aiGo').click(); synth.classList.add('streaming');
        say.innerHTML = `<span class="fl-lab">Bốn lá số cùng nói</span><p class="fl-wait">Đang đọc chéo bốn lá số<span class="fl-dots"><i></i><i></i><i></i></span></p><div class="fl-skel"><i></i><i></i><i style="width:62%"></i></div>`; };
      return; }
    synth.classList.add('has-luan'); synth.classList.remove('streaming');
    const get = sec => ({ title: sec.querySelector('.rd-toggle').textContent.trim(), body: sec.querySelector('.rd-body') });
    const all = secs.map(get), quick = all.find(x => /đọc nhanh/i.test(x.title)), main = all.find(x => /cùng nói|chân dung/i.test(x.title));
    const mp = main && main.body.querySelector('p');
    say.innerHTML = `<span class="fl-lab">Bốn lá số cùng nói</span>${mp ? `<p class="fl-say-big">${mp.innerHTML}</p>` : ''}${quick ? `<ul class="fl-say-list">${[...quick.body.querySelectorAll('li')].slice(0, 4).map(li => `<li>${li.innerHTML}</li>`).join('')}</ul>` : ''}${main && main.body.children.length > 1 ? '<button type="button" class="fl-link" data-ch="main">Đọc tiếp ›</button>' : ''}`;
    const chs = all.filter(x => x !== quick && x !== main);
    chList.innerHTML = chs.map((c, i) => { const e = (CH_EL.find(([r]) => r.test(c.title)) || [0, 'tho'])[1];
      return `<button type="button" class="fl-ch el-${e}" data-ch="${i}"><span class="fl-ch-t">${esc(c.title)}</span><span class="fl-ch-s">${esc(firstSentence(c.body.textContent))}</span><span class="fl-ch-go" aria-hidden="true">›</span></button>`; }).join('');
    chHead.hidden = !chs.length; lFoot.hidden = false; setView(view);
    anim(say, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], 600);
    [...say.children].forEach((c, i) => anim(c, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], 500 + i * 120));
    revealChs();
    const openCh = (c, from) => { UI.openSheet(`<div class="sh-top"><div><span class="fl-lab">Luận giải</span><h3 id="sheetTitle">${esc(c.title)}</h3></div></div><div class="ai-out">${c.body.innerHTML}</div>`, from); popFrom(from); };
    chList.querySelectorAll('[data-ch]').forEach(b => b.onclick = () => openCh(chs[+b.dataset.ch], b));
    const more = say.querySelector('[data-ch=main]'); if (more) more.onclick = () => openCh(main, more);
  }
  function setView(v, flip) {
    const items = [...chList.children], before = flip && !RM.matches ? items.map(x => x.getBoundingClientRect()) : null;
    view = v; chList.classList.toggle('grid', v === 'grid'); chHead.querySelectorAll('[data-v]').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === v)); try { localStorage.setItem('tuchieu:chview', v); } catch (e) {}
    if (before) items.forEach((x, i) => { const a = before[i], b = x.getBoundingClientRect();
      x.animate([{ transform: `translate(${a.left - b.left}px,${a.top - b.top}px)`, opacity: .5 }, { transform: 'none', opacity: 1 }], { duration: vui() ? 420 : 380, easing: EASE(), delay: i * 25, fill: 'backwards' }); }); }
  chHead.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { if (b.dataset.v !== view) setView(b.dataset.v, true); });
  // các chương hiện lần lượt khi cuộn tới
  const chObs = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('seen'); chObs.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' }) : null;
  function revealChs() { [...chList.children].forEach((x, i) => { x.style.setProperty('--i', i % 6); if (chObs && !RM.matches) { x.classList.add('rv'); chObs.observe(x); } }); }
  synth.querySelector('#flFull').onclick = () => { synth.classList.toggle('show-full'); const on = synth.classList.contains('show-full'); synth.querySelector('#flFull').textContent = on ? 'Thu gọn luận giải đầy đủ' : 'Đọc luận giải đầy đủ ›'; if (on) lSrc.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  document.addEventListener('tc:reading', e => { const k = rKey(); if (k && e.detail) try { localStorage.setItem(k, e.detail); } catch (er) {} setTimeout(buildLuan, 0); });
  function restoreReading() { const k = rKey(); let t = null; try { t = k && localStorage.getItem(k); } catch (e) {} if (t) UI.setReading(t); buildLuan(); }

  /* ---------- Thanh hỏi ở đáy: mở khung hỏi đáp ---------- */
  const askSheet = el('div', 'fl-asksheet'); askSheet.hidden = true; askSheet.setAttribute('role', 'dialog'); askSheet.setAttribute('aria-label', 'Hỏi Tứ Chiếu');
  askSheet.innerHTML = '<div class="fl-as-bg"></div><div class="fl-as-panel"><div class="fl-as-top"><b>Hỏi Tứ Chiếu</b><button type="button" class="fl-as-x" aria-label="Đóng">×</button></div><div class="fl-as-body"></div></div>';
  document.body.append(askSheet); askSheet.querySelector('.fl-as-body').append(chatSlot); chat.hidden = false;
  const CHIPS = ['Tháng này của tôi thế nào?', 'Năm sau có nên đổi việc không?', 'Tiền bạc của tôi nên giữ thế nào?'];
  const dock = el('form', 'fl-dock'); dock.setAttribute('aria-label', 'Hỏi Tứ Chiếu');
  dock.innerHTML = `<div class="fl-dock-chips">${CHIPS.map(c => `<button type="button" class="fl-chip">${c}</button>`).join('')}</div><div class="fl-dock-row"><input name="q" placeholder="Hỏi Tứ Chiếu về bạn…" autocomplete="off" aria-label="Câu hỏi"><button type="submit" class="fl-dock-go" aria-label="Hỏi"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></div>`;
  document.body.append(dock);
  function askOpen(q) { askSheet.hidden = false; document.body.classList.add('asking');
    if (q) { $('#ask').value = q; $('#askGo').click(); } else requestAnimationFrame(() => $('#ask').focus({ preventScroll: true }));
    const l = $('#qaList'); requestAnimationFrame(() => { const b = askSheet.querySelector('.fl-as-body'); b.scrollTop = b.scrollHeight; }); }
  function askClose() { askSheet.hidden = true; document.body.classList.remove('asking'); }
  dock.onsubmit = e => { e.preventDefault(); const q = dock.q.value.trim(); dock.q.value = ''; askOpen(q); };
  dock.querySelectorAll('.fl-chip').forEach(b => b.onclick = () => askOpen(b.textContent));
  askSheet.querySelector('.fl-as-x').onclick = askSheet.querySelector('.fl-as-bg').onclick = askClose;
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !askSheet.hidden) askClose(); });

  /* ---------- Chuyển động phụ ---------- */
  function moveInd() { const b = nav.querySelector('[aria-current=page]'); if (!b) return; ind.style.width = b.offsetWidth + 'px'; ind.style.transform = `translateX(${b.offsetLeft}px)`; ind.style.height = b.offsetHeight + 'px'; ind.style.top = b.offsetTop + 'px'; }
  addEventListener('resize', moveInd);
  // cuộn xuống: ẩn thanh chọn màn cho rộng chỗ đọc; cuộn lên: hiện lại
  let lastY = scrollY, tick = false;
  addEventListener('scroll', () => { if (tick) return; tick = true; requestAnimationFrame(() => { const y = scrollY, d = y - lastY;
    if (Math.abs(d) > 6) { document.body.classList.toggle('fl-down', d > 0 && y > 260); lastY = y; } tick = false; }); }, { passive: true });
  function countDay() { const n = todayBox.querySelector('.fl-td-num'); if (!n || RM.matches) return; const to = +n.textContent, t0 = performance.now(), dur = 550;
    const step = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); n.textContent = Math.max(1, Math.round(to * e)); if (k < 1) requestAnimationFrame(step); else n.textContent = to; }; requestAnimationFrame(step); }
  function popFrom(from) { const card = $('#sheet .sheet-card'); if (!card || !from || RM.matches) return; const a = from.getBoundingClientRect(), b = card.getBoundingClientRect();
    card.animate([{ transform: `translate(${a.left + a.width / 2 - (b.left + b.width / 2)}px,${a.top + a.height / 2 - (b.top + b.height / 2)}px) scale(${Math.max(.2, a.width / b.width)},${Math.max(.1, a.height / b.height)})`, opacity: .4 }, { transform: 'none', opacity: 1 }], { duration: vui() ? 380 : 340, easing: EASE() }); }

  /* ---------- Gợi ý theo tâm trạng: ngày Mặt Trăng chiếu khó mà đang dùng Vui ---------- */
  function moodTip(T, ymd) {
    const box = todayBox.querySelector('.fl-mood'); if (!box) return;
    const k = 'tuchieu:moodtip:' + ymd; let off = false; try { off = !!localStorage.getItem(k); } catch (e) {}
    const hard = T.moon && T.moon.hit && T.moon.hit.kind === 'khó';
    if (!hard || off || document.documentElement.dataset.skin !== 'vui' || ymd !== localYmd(new Date())) { box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = `<p>Hôm nay Mặt Trăng chiếu khó, dễ mệt hơn thường. Đổi sang giao diện Yên cho dịu mắt?</p><button type="button" class="btn-ghost btn-sm" data-yen>Đổi sang Yên</button><button type="button" class="fl-mood-x" aria-label="Ẩn gợi ý">×</button>`;
    const done = () => { try { localStorage.setItem(k, 1); } catch (e) {} box.hidden = true; };
    box.querySelector('[data-yen]').onclick = () => { done(); UI.setSkin('yen'); };
    box.querySelector('.fl-mood-x').onclick = done;
  }
  document.addEventListener('tc:skin', () => { if (UI.R() && lastYmd) renderToday(UI.R(), lastYmd); });

  let tm; new MutationObserver(() => { clearTimeout(tm); tm = setTimeout(tidy, 30); }).observe($('#result'), { childList: true, subtree: true });
  tidy();
  // mở lại lá số đã lưu: chạy sau cùng, khi mọi khối ở trên đã dựng xong
  let saved = null; try { saved = localStorage.getItem('tuchieu:last'); } catch (e) {}
  if (saved && UI.R()) { arrange(true); showResult(); restoreReading(); } else buildLuan();
})();
