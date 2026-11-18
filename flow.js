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
    sum: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    laso: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
    hop: '<circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/>'
  };
  const SEC = [['sum', 'Tổng quan'], ['laso', 'Lá số'], ['hop', 'Hợp nhau']];
  let cur = 'sum', sys = 'tv';

  const res = $('#ket-qua .container');
  const bar = el('div', 'fl-who'); bar.id = 'flWho';
  const nav = el('nav', 'fl-nav'); nav.setAttribute('aria-label', 'Các mục kết quả');
  nav.innerHTML = SEC.map(([k, n]) => `<button type="button" data-sec="${k}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg><span>${n}</span></button>`).join('');
  const pick = el('div', 'fl-sys'); pick.setAttribute('role', 'group'); pick.setAttribute('aria-label', 'Chọn môn');
  pick.innerHTML = SYS.map((s, i) => `${s.beta && !SYS[i - 1].beta ? '<span class="fl-beta">Beta</span>' : ''}<button type="button" data-sys="${s.k}">${s.name}</button>`).join('');
  res.prepend(bar, nav, pick);
  const bottom = nav.cloneNode(true); bottom.className = 'fl-bottom'; document.body.append(bottom);
  function el(t, c) { const e = document.createElement(t); e.className = c; return e; }

  function open(sec, s) {
    cur = sec; if (s) sys = s;
    const S = SYS.find(x => x.k === sys);
    UI.show(sec === 'sum' ? 't-sum' : sec === 'hop' ? 't-hop' : S.tab);
    if (sec === 'laso' && S.lab) UI.labOpen(S.lab);
    sync();
    const y = res.getBoundingClientRect().top + scrollY - 64; if (scrollY > y + 10) scrollTo({ top: y });
  }
  function sync() {
    // trang cũ vẫn tự gọi show() (nút "Xem Tử vi →", "Hỏi AI về điều này"): suy ra mục đang mở từ tab đang chọn
    const t = (document.querySelector('.tabs [role=tab][aria-selected=true]') || {}).id || 't-sum';
    // nút cũ mở "Luận giải AI" (Hỏi AI về năm…, Hỏi AI về điều này): đưa về Tổng quan, cuộn tới ô hỏi
    if (t === 't-ai') { UI.show('t-sum'); cur = 'sum'; requestAnimationFrame(() => { const a = $('#ask'); if (a) { a.scrollIntoView({ block: 'center' }); a.focus({ preventScroll: true }); } }); }
    else if (t === 't-sum') cur = 'sum'; else if (t === 't-hop') cur = 'hop';
    else { cur = 'laso'; const S = SYS.find(x => x.tab === t && (!x.lab || x.lab === (document.querySelector('#labNav [aria-pressed=true]') || {}).dataset?.lab)); if (S) sys = S.k; }
    [nav, bottom].forEach(n => n.querySelectorAll('[data-sec]').forEach(b => b.setAttribute('aria-current', b.dataset.sec === cur ? 'page' : 'false')));
    pick.hidden = cur !== 'laso';
    pick.querySelectorAll('[data-sys]').forEach(b => b.setAttribute('aria-pressed', b.dataset.sys === sys));
    read.hidden = traits.hidden = hero.hidden = tiles.hidden = cur !== 'sum';
  }
  [nav, bottom].forEach(n => n.querySelectorAll('[data-sec]').forEach(b => b.onclick = () => open(b.dataset.sec)));
  pick.querySelectorAll('[data-sys]').forEach(b => b.onclick = () => open('laso', b.dataset.sys));
  new MutationObserver(sync).observe($('.tabs'), { attributes: true, subtree: true, attributeFilter: ['aria-selected'] });

  /* ---------- Hai chế độ: nhập thông tin / xem kết quả ---------- */
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  function who() {
    const R = UI.R(); if (!R) return; const i = R.input;
    bar.innerHTML = `<div><b>${esc(i.name)}</b><span>${i.gender === 'nam' ? 'Nam' : 'Nữ'} · ${i.date.split('-').reverse().join('/')} · ${esc(i.timeLabel)} · ${esc(i.place)}</span></div><button type="button" class="btn-ghost btn-sm" id="flEdit">Sửa</button>`;
    $('#flEdit').onclick = () => { document.body.classList.remove('has-result'); scrollTo({ top: 0 }); };
  }
  function showResult() { document.body.classList.add('has-result'); who(); sync(); }
  $('#f').addEventListener('submit', () => setTimeout(() => { if (!UI.R()) return; showResult(); open('sum'); scrollTo({ top: 0 }); }, 0));

  /* ---------- Tổng quan chứa luôn bài luận AI; mục Hỏi chỉ còn ô hỏi ---------- */
  const read = el('section', 'fl-read'); read.setAttribute('aria-label', 'Luận giải');
  // bỏ ô "bối cảnh": bài Tổng quan luôn là bài tổng quát, muốn hỏi gì thì hỏi ở ô ngay dưới bài
  const ctxField = $('#ctx').closest('.field'); ctxField.hidden = true; $('#ctx').value = '';
  const head = $('#p-ai .ai-head'); head.querySelector('h2').textContent = 'Luận giải bốn lá số';
  const chatSlot = el('div', 'fl-chatslot');
  read.append(head, $('#aiOut'), chatSlot);
  // đặt ngoài #p-sum (khối đó bị vẽ lại mỗi lần lập lá số), ẩn hiện theo mục Tổng quan
  const traits = el('div', 'fl-traits'); traits.hidden = true;
  const hero = el('section', 'fl-hero'); hero.hidden = true;
  const tiles = el('div', 'fl-tiles'); tiles.hidden = true;
  $('#p-sum').before(hero, tiles, read, traits);
  const opt = el('details', 'fl-opt'); opt.innerHTML = '<summary>Tùy chọn</summary><div class="fl-opt-body"></div>';
  [head.querySelector('label[for=focus]'), $('#focus'), $('#code'), $('#copyPrompt')].forEach(x => x && opt.lastChild.append(x));
  head.querySelector('.ai-controls').append(opt);
  // ô hỏi: tiêu đề và gợi ý
  // ô hỏi: chỉ một chỗ, ngay dưới bài luận ở Tổng quan
  const chat = $('#chat'); chatSlot.append(chat);
  chat.insertAdjacentHTML('afterbegin', '<h2 class="fl-h">Bạn muốn hỏi gì?</h2><p class="small muted" style="margin:0 0 10px">Hỏi về con người, công việc, tình cảm, năm nay… AI đọc trên lá số của bạn. Câu hỏi về một việc cụ thể ("có nên…", "…được không") sẽ được đọc bằng Kỳ Môn Độn Giáp lập theo lúc hỏi.</p>');
  const hint = chat.querySelector('.chat-hint'); if (hint) hint.remove();
  chat.append($('#askStatus'));

  /* ---------- Sau mỗi lần vẽ lại: gỡ tab con, gom khối về đúng chỗ ---------- */
  const TECH = ['Bảng góc chiếu', 'Vị trí các sao', '12 nhà và chủ tinh'];
  function tidy() {
    // nét tính cách nổi bật (Tử vi), ngay dưới bài luận; tính lại khi lá số đổi
    const R = UI.R();
    if (R && R.tuvi !== tidy.tv) { tidy.tv = R.tuvi; traits.innerHTML = '';
      const top = R.tuvi && typeof TVP !== 'undefined' ? TVP.traits(R.tuvi).filter(x => x.pct >= 75 || x.pct <= 25).sort((a, b) => Math.abs(b.pct - 50) - Math.abs(a.pct - 50)).slice(0, 3) : [];
      if (top.length) traits.innerHTML = `<span class="label">Nổi bật nhất theo Tử vi</span><div>${top.map(x => `<span class="fl-trait"><b>${x.name}</b> <span class="${x.pct >= 75 ? 't-tot' : 't-luuy'}">${x.level.toLowerCase()}</span> <small>hơn ${x.pct}% người</small></span>`).join('')}</div>`;
      traits.classList.toggle('empty', !top.length); }
    if (R && R !== tidy.r) { tidy.r = R; visuals(R); }
    // Tử vi: hiện liền mọi phần (cách cục, nét tính cách, đại hạn, 12 tháng)
    document.querySelectorAll('#p-tv [role=tabpanel][hidden]').forEach(x => x.hidden = false);
    // Kỳ Môn: bỏ nút Mệnh bàn / Hỏi việc; phần hỏi việc chạy ngầm qua ô Hỏi
    const qmHead = $('#lab-qm .qm-head .seg'); if (qmHead) qmHead.remove();
    const qmM = $('#qmMenh'); if (qmM) qmM.hidden = false;
    const qmH = $('#qmHoi'); if (qmH) qmH.hidden = true;
    // bài luận: mở hết các phần, không gập
    document.querySelectorAll('#aiOut .rd-body[hidden]').forEach(b => b.hidden = false);
    // chiêm tinh: bảng kỹ thuật xuống cuối trang
    document.querySelectorAll('#p-as .panel h3').forEach(h => { if (TECH.includes(h.textContent.trim())) h.closest('.panel').classList.add('fl-tech'); });
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
      .map(([x, yy, r, o]) => `<span class="fl-star" style="left:${x}%;top:${yy}%;width:${r}px;height:${r}px;opacity:${o}"></span>`).join('');
    const moonSvg = K.moon ? `<svg width="26" height="26" viewBox="-23 -23 46 46" role="img" aria-label="${K.moon.name}, ngày ${K.lunarDay} âm"><circle r="18" fill="#fff" opacity=".1"/>${K.moon.dark ? '' : `<path d="${K.moon.path}" fill="#F6EEDC"/>`}</svg>` : '';
    const [g0, g1, g2] = K.sky.g, tint = K.main ? K.INK[K.main] : '#5a6aa0';
    hero.innerHTML = `<div class="fl-card" style="--g0:${g0};--g1:${g1};--g2:${g2};--tint:${tint}">
        <div class="fl-grain"></div>${stars}
        <div class="fl-ctop"><span>${K.timeKnown ? esc(i.time) + ' · ' : ''}${d}.${mo}.${y}</span>${moonSvg}</div>
        <svg class="fl-mark" width="200" height="200" viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="flh"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
          <circle cx="100" cy="100" r="62" fill="none" stroke="#fff" stroke-opacity=".14"/><circle cx="100" cy="100" r="30" fill="url(#flh)"/>${rays}<circle cx="100" cy="100" r="3.5" fill="#fff"/></svg>
        <div class="fl-ct">${S ? `<span class="fl-k">${esc(i.name)} · ${esc(K.title)}</span><h2>${S.lines.map(x => `<span style="white-space:nowrap">${esc(x)}</span>`).join(' ')}</h2><p class="fl-story">${esc(S.story)}</p><p>${esc(S.trait)}</p><p class="fl-nhu">${esc(S.nhu)}</p>`
          : `<span class="fl-k">${esc(i.name)}</span><h2>${esc(K.title)}</h2><p>${esc(K.body)}</p>`}</div>
      </div>`;
    const row = (k, sys, detail, color, state) => `<button type="button" class="fl-it" data-open="${k}"><i style="background:${color}"></i><span>${sys}<small>${esc(detail)}${state ? ', ' + state : ''}</small></span></button>`;
    const st = v => !K.main ? '' : v.agree ? 'đồng ý' : 'nói khác';
    tiles.innerHTML = `<div class="fl-key">${['bz', 'as', 'tv'].map(k => by[k] ? row(k, by[k].sys, by[k].detail + ' → ' + by[k].el, K.INK[by[k].el], st(by[k])) : '').join('')}
        ${row('nm', 'Thần số', 'Đường đời ' + K.num, '#C9A95A', 'không xét')}</div>
      <p class="fl-note">${S ? 'Đoạn kể tính từ bầu trời thật lúc và nơi bạn sinh. Tên thẻ ghép từ chất chính và nhóm sao ở cung Mệnh. ' : ''}Bốn tia sáng là bốn môn: tia rõ là đồng ý, tia mờ là nói khác. ${[K.timeKnown ? 'Màu trời theo giờ sinh (' + K.sky.name + ')' : 'Không rõ giờ sinh nên trời để màu ban ngày', K.moon ? 'trăng vẽ đúng pha ngày ' + K.lunarDay + ' âm' : ''].filter(Boolean).join(', ')}. Bấm một dòng để xem môn đó.</p>
      ${typeof SHARE !== 'undefined' ? `<div class="fl-share"><button type="button" class="btn-ghost btn-sm" id="flShare">Tạo ảnh để đăng story</button><span>Ảnh dọc, có màu và hướng hợp với bạn. Ảnh tạo ngay trên máy, không gửi đi đâu.</span></div>` : ''}`;
    tiles.querySelectorAll('[data-open]').forEach(x => x.onclick = () => open('laso', x.dataset.open));
    const sb = tiles.querySelector('#flShare');
    if (sb) sb.onclick = async () => { sb.disabled = true; const t = sb.textContent; sb.textContent = 'Đang tạo ảnh…';
      try { await SHARE.share(R, UI.openSheet); sb.textContent = t; } catch (e) { console.error(e); sb.textContent = 'Không tạo được ảnh, thử lại'; setTimeout(() => sb.textContent = t, 2500); }
      sb.disabled = false; };
  }

  let tm; new MutationObserver(() => { clearTimeout(tm); tm = setTimeout(tidy, 30); }).observe($('#result'), { childList: true, subtree: true });
  tidy();
  // mở lại lá số đã lưu: chạy sau cùng, khi mọi khối ở trên đã dựng xong
  let saved = null; try { saved = localStorage.getItem('tuchieu:last'); } catch (e) {}
  if (saved && UI.R()) showResult();
})();
