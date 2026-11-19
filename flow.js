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
    read.hidden = traits.hidden = hero.hidden = tiles.hidden = todayBox.hidden = cur !== 'sum';
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
  read.append(chatSlot, head, $('#aiOut'));
  // đặt ngoài #p-sum (khối đó bị vẽ lại mỗi lần lập lá số), ẩn hiện theo mục Tổng quan
  const traits = el('div', 'fl-traits'); traits.hidden = true;
  const hero = el('section', 'fl-hero'); hero.hidden = true;
  const tiles = el('div', 'fl-tiles'); tiles.hidden = true;
  const todayBox = el('section', 'fl-today'); todayBox.hidden = true; todayBox.setAttribute('aria-label', 'Hôm nay của bạn');
  $('#p-sum').before(hero, tiles, todayBox, traits); $('#p-sum').after(read);
  const opt = el('details', 'fl-opt'); opt.innerHTML = '<summary>Tùy chọn</summary><div class="fl-opt-body"></div>';
  [head.querySelector('label[for=focus]'), $('#focus'), $('#code'), $('#copyPrompt')].forEach(x => x && opt.lastChild.append(x));
  head.querySelector('.ai-controls').append(opt);
  // ô hỏi: tiêu đề và gợi ý
  // ô hỏi: chỉ một chỗ, ngay dưới bài luận ở Tổng quan
  const chat = $('#chat'); chatSlot.append(chat);
  chat.insertAdjacentHTML('afterbegin', '<h2 class="fl-h">Bạn muốn hỏi gì?</h2><p class="small muted" style="margin:0 0 10px">Hỏi về tính cách, công việc, tình cảm, năm nay… Câu "có nên…" sẽ được đọc bằng Kỳ Môn theo đúng lúc hỏi.</p>');
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
    if (R && R !== tidy.r) { tidy.r = R; visuals(R); renderToday(R, localYmd(new Date())); }
    // Năm của bạn: bản gọn (tên năm, nhãn); bấm mới mở bốn ô chi tiết
    const yp = $('#yearPanel');
    if (yp && !yp.querySelector('.fl-yr-more')) { const t = el('button', 'btn-ghost btn-sm fl-yr-more'); t.type = 'button'; t.textContent = 'Xem chi tiết năm';
      t.onclick = () => { const o = yp.classList.toggle('open'); t.textContent = o ? 'Thu gọn' : 'Xem chi tiết năm'; }; yp.append(t); }
    // bài luận: chưa viết thì ẩn khung chữ hướng dẫn
    const ao = $('#aiOut'); if (ao) ao.hidden = /Bấm\s*Viết luận giải/.test(ao.textContent) && ao.children.length <= 1;
    // Tử vi: hiện liền mọi phần (cách cục, nét tính cách, đại hạn, 12 tháng)
    document.querySelectorAll('#p-tv [role=tabpanel][hidden]').forEach(x => x.hidden = false);
    // Kỳ Môn: bỏ nút chuyển chế độ, hiện liền hai phần: Hỏi việc ở trên, Mệnh bàn ở dưới
    const qmHead = $('#lab-qm .qm-head .seg'); if (qmHead) qmHead.remove();
    const qmM = $('#qmMenh'), qmH = $('#qmHoi');
    if (qmM && qmH && !qmH.dataset.fl) {
      qmH.dataset.fl = 1; qmH.hidden = false; qmM.hidden = false; qmM.before(qmH);
      qmH.insertAdjacentHTML('afterbegin', '<h3 class="fl-qmh">Hỏi một việc cụ thể</h3><p class="small muted" style="margin:0 0 8px">Bàn lập đúng lúc bạn hỏi. Hợp với câu kiểu "có nên…", "…được không", "khi nào nên…".</p>');
      qmM.insertAdjacentHTML('afterbegin', '<h3 class="fl-qmh" style="margin-top:28px">Mệnh bàn (lập theo giờ sinh)</h3>');
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
    hero.innerHTML = `<div class="fl-card${S ? ' has-sil' : ''}" style="--g0:${g0};--g1:${g1};--g2:${g2};--tint:${tint}">
        <div class="fl-sky"><div class="fl-grain"></div>${stars}${S ? `<img class="fl-sil" src="${S.sil}" alt="" width="1440" height="520" decoding="async">` : ''}</div>
        <div class="fl-ctop"><span>${K.timeKnown ? esc(i.time) + ' · ' : ''}${d}.${mo}.${y}</span>${moonSvg}</div>
        <svg class="fl-mark" width="200" height="200" viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="flh"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
          <circle cx="100" cy="100" r="62" fill="none" stroke="#fff" stroke-opacity=".14"/><circle cx="100" cy="100" r="30" fill="url(#flh)"/>${rays}<circle cx="100" cy="100" r="3.5" fill="#fff"/></svg>
        <div class="fl-ct">${S ? `<span class="fl-k">${esc(i.name)} · ${esc(K.title)}</span><h2>${S.lines.map(x => `<span style="white-space:nowrap">${esc(x)}</span>`).join(' ')}</h2><p class="fl-story">${esc(S.story)}</p><p>${esc(S.trait)}</p><p class="fl-nhu">${esc(S.nhu)}</p>`
          : `<span class="fl-k">${esc(i.name)}</span><h2>${esc(K.title)}</h2><p>${esc(K.body)}</p>`}</div>
      </div>`;
    const chip = (k, txt, color, dim, title) => `<button type="button" class="fl-chip${dim ? ' dim' : ''}" data-open="${k}" title="${esc(title)}"><i style="background:${color}"></i>${esc(txt)}</button>`;
    tiles.innerHTML = `<div class="fl-chips">${['bz', 'as', 'tv'].map(k => by[k] ? chip(k, `${by[k].sys}: ${by[k].el}`, K.INK[by[k].el], K.main && !by[k].agree, by[k].detail + (K.main ? (by[k].agree ? ', đồng ý' : ', nói khác') : '')) : '').join('')}
        ${chip('nm', 'Thần số: ' + K.num, '#C9A95A', false, 'Đường đời ' + K.num)}
        ${typeof SHARE !== 'undefined' ? '<button type="button" class="fl-chip fl-chip-share" id="flShare">Tạo ảnh story</button>' : ''}</div>`;
    tiles.querySelectorAll('[data-open]').forEach(x => x.onclick = () => open('laso', x.dataset.open));
    const sb = tiles.querySelector('#flShare');
    if (sb) sb.onclick = async () => { sb.disabled = true; const t = sb.textContent; sb.textContent = 'Đang tạo ảnh…';
      try { await SHARE.share(R, UI.openSheet); sb.textContent = t; } catch (e) { console.error(e); sb.textContent = 'Không tạo được ảnh, thử lại'; setTimeout(() => sb.textContent = t, 2500); }
      sb.disabled = false; };
  }

  /* ---------- Hôm nay của bạn: tính bằng công thức (today.js), chọn được ngày khác ---------- */
  function localYmd(dt) { return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`; }
  function renderToday(R, ymd) {
    if (typeof TODAY === 'undefined' || !R) return;
    let T; try { T = TODAY.build(R, ymd); } catch (e) { console.error(e); todayBox.innerHTML = ''; return; }
    const isToday = ymd === localYmd(new Date()), li = a => a.map(x => `<li>${esc(x)}</li>`).join('');
    const mood = T.moon ? [T.moon.hit ? T.moon.hit.text + '.' : '', T.moon.houseTxt].filter(Boolean).join(' ') : '';
    todayBox.innerHTML = `<div class="fl-td-head"><div><h2 class="fl-sec-h">${isToday ? 'Hôm nay của bạn' : 'Ngày bạn chọn'}</h2>
        <div class="fl-td-date">${T.thu}, ${T.d}/${T.m}/${T.y} · ngày ${esc(T.gz)}${T.lunar ? ' · ' + T.lunar : ''}</div></div>
        <div class="fl-td-nav"><button type="button" class="btn-ghost btn-sm" data-step="-1" aria-label="Ngày trước">‹</button><input type="date" value="${ymd}" aria-label="Chọn ngày"><button type="button" class="btn-ghost btn-sm" data-step="1" aria-label="Ngày sau">›</button>${isToday ? '' : '<button type="button" class="btn-ghost btn-sm" data-today>Hôm nay</button>'}</div></div>
      <h3 class="fl-td-theme">${esc(T.theme)}</h3>
      <div class="fl-td-tags"><span class="fl-td-tag ${T.hoang ? 'good' : 'bad'}">Ngày ${T.hoang ? 'hoàng đạo' : 'hắc đạo'} (${T.dayThan})</span>${T.notes.slice(0, 1).map(n => `<span class="fl-td-tag ${/xung|hại/.test(n) ? 'bad' : 'good'}">${esc(n[0].toUpperCase() + n.slice(1))}</span>`).join('')}</div>
      <div class="fl-td-cols"><div><h4>Nên</h4><ul>${li(T.nen.slice(0, 2))}</ul></div><div><h4>Nên tránh</h4><ul>${li(T.tranh.slice(0, 2))}</ul></div></div>
      <p class="fl-td-line"><b>Giờ tốt:</b> ${T.gio.map(g => g.gio).join(', ') || 'không có giờ hoàng đạo ban ngày'}</p>
      ${mood ? `<p class="fl-td-line"><b>Tâm trạng:</b> ${esc(mood)}</p>` : ''}
      
      <details class="fl-td-why"><summary>Vì sao?</summary> Bát tự, ngày ${esc(T.gz)} là ngày ${T.god} với nhật chủ ${esc(R.bazi.dayMaster)}${T.notes.length ? '; ' + esc(T.notes.join(', ')) : ''}. Chiêm tinh, Mặt Trăng ở ${T.moon ? T.moon.sign : '?'}${T.moon && T.moon.house ? ', nhà ' + T.moon.house : ''}. Lịch Việt, ngày ${T.dayThan}, giờ hoàng đạo theo 12 thần. Thần số, số ngày cá nhân ${T.pday.n}.</details>
      <button type="button" class="btn-ghost btn-sm" data-ask>Hỏi AI về ngày này</button>`;
    const go = v => renderToday(R, v);
    todayBox.querySelector('input[type=date]').onchange = e => e.target.value && go(e.target.value);
    todayBox.querySelectorAll('[data-step]').forEach(bt => bt.onclick = () => { const [y, m, d] = ymd.split('-').map(Number); go(localYmd(new Date(y, m - 1, d + +bt.dataset.step))); });
    const tb = todayBox.querySelector('[data-today]'); if (tb) tb.onclick = () => go(localYmd(new Date()));
    todayBox.querySelector('[data-ask]').onclick = () => {
      const q = `Ngày ${T.d}/${T.m}/${T.y} (${T.gz}) với tôi thế nào? Tứ Chiếu tính: ngày ${T.god} với nhật chủ, ${T.hoang ? 'hoàng đạo' : 'hắc đạo'} ${T.dayThan}${T.notes.length ? ', ' + T.notes.join(', ') : ''}, Mặt Trăng ở ${T.moon ? T.moon.sign : '?'}${T.moon && T.moon.house ? ' nhà ' + T.moon.house : ''}, số ngày cá nhân ${T.pday.n}. Đọc kỹ hơn cho tôi.`;
      const a = $('#ask'); if (!a) return; a.value = q; const c = $('#chat'); if (c) c.hidden = false; $('#askGo').click(); a.scrollIntoView({ block: 'center' }); };
  }

  let tm; new MutationObserver(() => { clearTimeout(tm); tm = setTimeout(tidy, 30); }).observe($('#result'), { childList: true, subtree: true });
  tidy();
  // mở lại lá số đã lưu: chạy sau cùng, khi mọi khối ở trên đã dựng xong
  let saved = null; try { saved = localStorage.getItem('tuchieu:last'); } catch (e) {}
  if (saved && UI.R()) showResult();
})();
