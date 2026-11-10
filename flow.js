/* Tứ Chiếu — lớp luồng đi mới (bản mẫu).
   Không đổi phần tính toán hay cách vẽ: chỉ sắp lại trang thành 2 chế độ (nhập / xem kết quả) và 4 mục chính.
   Dựa vào các hàm của trang qua window.TCUI = { R, show, go }. */
(() => {
  const $ = s => document.querySelector(s), UI = window.TCUI;
  if (!UI) return;
  document.body.classList.add('flow');

  /* ---------- 4 mục chính, mỗi mục gom một hoặc nhiều tab cũ ---------- */
  const SEC = [
    { k: 'sum', name: 'Tổng quan', tabs: [['t-sum']], icon: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>' },
    { k: 'laso', name: 'Lá số', tabs: [['t-tv', 'Tử vi'], ['t-bz', 'Bát tự'], ['t-as', 'Bản đồ sao'], ['t-nm', 'Thần số']], icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>' },
    { k: 'ai', name: 'Hỏi AI', tabs: [['t-ai']], icon: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>' },
    { k: 'them', name: 'Thêm', tabs: [['t-hop', 'Xem độ hợp'], ['t-lab', 'Khám phá']], icon: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>' }
  ];
  const secOf = id => SEC.find(s => s.tabs.some(t => t[0] === id));
  const last = {}; // tab con dùng gần nhất của mỗi mục
  const cur = () => (document.querySelector('.tabs [role=tab][aria-selected=true]') || {}).id || 't-sum';

  const res = $('#ket-qua .container');
  const bar = document.createElement('div'); bar.className = 'fl-who'; bar.id = 'flWho';
  const nav = document.createElement('nav'); nav.className = 'fl-nav'; nav.setAttribute('aria-label', 'Các mục kết quả');
  nav.innerHTML = SEC.map(s => `<button type="button" data-sec="${s.k}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${s.icon}</svg><span>${s.name}</span></button>`).join('');
  const sub = document.createElement('div'); sub.className = 'fl-sub'; sub.setAttribute('role', 'group');
  res.prepend(bar, nav, sub);
  const bottom = nav.cloneNode(true); bottom.className = 'fl-bottom'; document.body.append(bottom);

  function open(id, scroll = true) {
    UI.show(id); const s = secOf(id); if (s) last[s.k] = id; sync();
    if (scroll) { const y = res.getBoundingClientRect().top + scrollY - 70; if (scrollY > y + 10) scrollTo({ top: y, behavior: 'auto' }); }
  }
  function sync() {
    const id = cur(), s = secOf(id) || SEC[0];
    [nav, bottom].forEach(n => n.querySelectorAll('[data-sec]').forEach(b => b.setAttribute('aria-current', b.dataset.sec === s.k ? 'page' : 'false')));
    sub.hidden = s.tabs.length < 2; sub.setAttribute('aria-label', s.name);
    sub.innerHTML = s.tabs.length < 2 ? '' : s.tabs.map(([t, n]) => `<button type="button" data-t="${t}" aria-pressed="${t === id}">${n}</button>`).join('');
    sub.querySelectorAll('[data-t]').forEach(b => b.onclick = () => open(b.dataset.t));
  }
  [nav, bottom].forEach(n => n.querySelectorAll('[data-sec]').forEach(b => b.onclick = () => { const s = SEC.find(x => x.k === b.dataset.sec); open(last[s.k] || s.tabs[0][0]); }));
  // Trang cũ vẫn gọi show() ở nhiều chỗ (nút "Xem Tử vi →", "Hỏi AI về…"): theo dõi để cập nhật thanh mục
  new MutationObserver(sync).observe($('.tabs'), { attributes: true, subtree: true, attributeFilter: ['aria-selected'] });

  /* ---------- Hai chế độ: nhập thông tin / xem kết quả ---------- */
  function who() {
    const R = UI.R(); if (!R) return;
    const i = R.input;
    bar.innerHTML = `<div><b>${esc(i.name)}</b><span>${i.gender === 'nam' ? 'Nam' : 'Nữ'} · ${i.date.split('-').reverse().join('/')} · ${esc(i.timeLabel)} · ${esc(i.place)}</span></div><button type="button" class="btn-ghost btn-sm" id="flEdit">Sửa</button>`;
    $('#flEdit').onclick = () => { document.body.classList.remove('has-result'); scrollTo({ top: 0 }); setTimeout(() => $('#date').focus({ preventScroll: true }), 50); };
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  function showResult() { document.body.classList.add('has-result'); who(); sync(); }
  $('#f').addEventListener('submit', () => setTimeout(() => { if (!UI.R()) return; showResult(); open('t-sum', false); scrollTo({ top: 0 }); }, 0));
  let saved = null; try { saved = localStorage.getItem('tuchieu:last'); } catch (e) {}
  if (saved && UI.R()) showResult();

  /* ---------- Form gọn: ô hỏi AI chuyển sang mục Hỏi AI ---------- */
  const ctxField = $('#ctx').closest('.field');
  ctxField.classList.add('fl-ctx'); ctxField.querySelector('label').innerHTML = 'Bạn đang băn khoăn điều gì? <span class="muted" style="font-weight:400">(không bắt buộc, AI sẽ trả lời xoáy vào đây)</span>';
  $('#ctx').placeholder = 'Ví dụ: đang phân vân đổi việc trong năm nay';
  $('#p-ai .ai-body').prepend(ctxField);
  const ctl = $('#p-ai .ai-controls'), opt = document.createElement('details'); opt.className = 'fl-opt';
  opt.innerHTML = '<summary>Tùy chọn</summary><div class="fl-opt-body"></div>';
  const ob = opt.querySelector('.fl-opt-body');
  [ctl.querySelector('label[for=focus]'), $('#focus'), $('#code'), $('#copyPrompt')].forEach(el => el && ob.append(el));
  ctl.append(opt);

  /* ---------- Tổng quan: bắt đầu từ đâu ---------- */
  function start() {
    const R = UI.R(), box = $('#p-sum'); if (!R || !box || box.querySelector('.fl-start')) return;
    let top = [];
    if (R.tuvi && typeof TVP !== 'undefined') top = TVP.traits(R.tuvi).filter(x => x.pct >= 75 || x.pct <= 25).sort((a, b) => Math.abs(b.pct - 50) - Math.abs(a.pct - 50)).slice(0, 3);
    const el = document.createElement('div'); el.className = 'fl-start';
    el.innerHTML = `<div class="fl-start-main"><span class="label">Bắt đầu từ đây</span>
        <h2>Đọc bài luận giải của bạn</h2>
        <p>AI đọc cả bốn lá số cùng lúc, chỉ ra chỗ các môn cùng nói một điều và chỗ khác nhau. Khoảng một phút.</p>
        <button type="button" class="btn-primary btn-lg" id="flAi">Đọc luận giải AI</button></div>
      ${top.length ? `<div class="fl-start-side"><span class="label">Nổi bật nhất (theo Tử vi)</span>${top.map(x => `<button type="button" class="fl-trait" data-k="${x.k}"><b>${x.name}</b><span class="${x.pct >= 75 ? 't-tot' : 't-luuy'}">${x.level.toLowerCase()}</span><small>hơn ${x.pct}% người</small></button>`).join('')}
        <button type="button" class="fl-link" id="flTraits">Xem đủ 12 nét →</button></div>` : ''}`;
    box.prepend(el);
    $('#flAi').onclick = () => { open('t-ai'); if (!$('#aiGo').disabled) $('#aiGo').click(); };
    const toTraits = () => { open('t-tv'); const b = document.querySelector('[data-tvs="tinh"]'); if (b) { b.click(); setTimeout(() => $('#tvs-tinh').scrollIntoView({ block: 'start' }), 30); } };
    el.querySelectorAll('.fl-trait').forEach(b => b.onclick = toTraits); const tl = $('#flTraits'); if (tl) tl.onclick = toTraits;
  }

  /* ---------- Bớt chữ: đoạn giải thích thành nút (?), bảng kỹ thuật thu gọn sẵn ---------- */
  const FOLD = ['Bảng góc chiếu', 'Vị trí các sao', '12 nhà và chủ tinh'];
  function tidy() {
    document.querySelectorAll('#result .panel h3, #result .cc-head h3').forEach(h => {
      if (h.dataset.fl) return; h.dataset.fl = 1;
      const panel = h.closest('.panel'); if (!panel) return;
      const anchor = h.closest('.cc-head') || h, p = anchor.nextElementSibling;
      if (p && p.matches('p.small.muted') && p.textContent.length > 60) {
        p.hidden = true; p.classList.add('fl-help');
        const q = document.createElement('button'); q.type = 'button'; q.className = 'fl-q'; q.setAttribute('aria-label', 'Giải thích'); q.setAttribute('aria-expanded', 'false'); q.textContent = '?';
        q.onclick = () => { p.hidden = !p.hidden; q.setAttribute('aria-expanded', !p.hidden); };
        h.append(q);
      }
      if (FOLD.includes(h.textContent.replace('?', '').trim())) {
        panel.classList.add('fl-fold');
        const t = document.createElement('button'); t.type = 'button'; t.className = 'fl-fold-t'; t.setAttribute('aria-expanded', 'false');
        t.innerHTML = `<span>${h.firstChild.textContent}</span><small>Bảng chi tiết · bấm để mở</small>`;
        t.onclick = () => { const on = panel.classList.toggle('open'); t.setAttribute('aria-expanded', on); };
        h.replaceWith(t);
      }
    });
    start();
  }
  let tm; new MutationObserver(() => { clearTimeout(tm); tm = setTimeout(tidy, 30); }).observe($('#result'), { childList: true, subtree: true });
  tidy(); sync();
})();
