/* Tứ Chiếu — đăng nhập (Supabase): Google hoặc link qua email, lưu lá số theo tài khoản.
   Cấu hình lấy từ /api/config (biến môi trường trên Vercel). Chưa cấu hình thì nút chỉ báo "sắp mở".
   Lưu: lá số; câu hỏi và câu trả lời AI nếu người dùng đồng ý (hỏi ở lần hỏi đầu); lời kể "Kể nghe" chỉ khi người dùng bật đồng bộ. */
(() => {
  const $ = s => document.querySelector(s), UI = window.TCUI, btn = $('#authBtn');
  if (!btn || !UI) return;
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  let sb = null, user = null;
  const CONSENT_V = '2026-11-21', CONSENT_KEY = 'tuchieu:consent';
  const consentLocal = () => { try { return JSON.parse(localStorage.getItem(CONSENT_KEY)); } catch (e) { return null; } };
  async function saveConsent() {
    const c = consentLocal(); if (!sb || !user || !c) return;
    const { error } = await sb.from('profiles').upsert({ id: user.id, consent_version: c.v, consent_at: c.at });
    if (error) console.error('Lưu đồng ý lỗi:', error.message);
  }

  // khóa nhận diện một lá số: cùng người, cùng ngày giờ nơi sinh thì ghi đè, không nhân bản
  const ckey = s => [s.name || '', s.date, s.noTime ? 'canh' + (s.canh ?? '') : s.time, s.placeName || `${s.lat},${s.lon}`, s.gender, s.cal || 'duong'].join('|');
  const when = s => { const [y, m, d] = (s.date || '').split('-'); return `${+d}/${+m}/${y}${s.noTime ? '' : s.time ? ' · ' + s.time : ''}`; };
  const loadScript = src => new Promise((ok, no) => { const x = document.createElement('script'); x.src = src; x.onload = ok; x.onerror = no; document.head.append(x); });

  function paint() {
    if (!user) { btn.textContent = 'Đăng nhập'; btn.classList.remove('in'); btn.removeAttribute('title'); return; }
    const md = user.user_metadata || {}, nm = md.full_name || md.name || user.email || '';
    btn.classList.add('in'); btn.title = 'Tài khoản: ' + nm;
    btn.innerHTML = md.avatar_url ? `<img class="auth-av" src="${esc(md.avatar_url)}" alt="" referrerpolicy="no-referrer">` : `<span class="auth-av">${esc((nm.trim()[0] || '?').toUpperCase())}</span>`;
    btn.insertAdjacentHTML('beforeend', '<span class="auth-lb">Tài khoản</span>');
  }

  async function saveChart(s) {
    if (!sb || !user || !s || !s.date) return;
    const { error } = await sb.from('charts').upsert({ user_id: user.id, ckey: ckey(s), name: s.name || 'Không tên', data: s, updated_at: new Date().toISOString() }, { onConflict: 'user_id,ckey' });
    if (error) console.error('Lưu lá số lỗi:', error.message);
  }
  async function listCharts() {
    const { data, error } = await sb.from('charts').select('id,name,data,updated_at').order('updated_at', { ascending: false }).limit(50);
    if (error) throw error; return data || [];
  }
  // vừa đăng nhập: đưa lá số đang mở lên tài khoản; nếu máy này chưa có lá số thì mở lá số gần nhất trong tài khoản
  async function afterLogin() {
    await saveConsent();
    try { await syncOnLogin(); } catch (e) { console.error(e); }
    const cur = UI.saved();
    if (cur && cur.date) { await saveChart(cur); return; }
    try { const [last] = await listCharts(); if (last) UI.load(last.data); } catch (e) { console.error(e); }
  }

  const G = '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
  function loginSheet() {
    UI.openSheet(`<h3 id="sheetTitle" style="margin:0 0 6px">Đăng nhập Tứ Chiếu</h3>
      <p class="muted" style="margin:0 0 16px">Lá số được lưu vào tài khoản. Đổi máy hay xóa trình duyệt vẫn mở lại được.</p>
      <label class="auth-ok"><input type="checkbox" id="authOk"><span>Đồng ý lưu email và lá số vào tài khoản · <a href="/chinh-sach-bao-mat.html" target="_blank" rel="noopener">Chính sách</a></span></label>
      <button type="button" class="btn-ghost auth-google">${G}<span>Tiếp tục với Google</span></button>
      <div class="auth-or"><span>hoặc nhận link qua email</span></div>
      <form class="auth-mail"><input type="email" required autocomplete="email" placeholder="email của bạn" aria-label="Email"><button type="submit" class="btn-primary">Gửi link</button></form>
      <p class="auth-st small" aria-live="polite"></p>
      <p class="small muted" style="margin-top:14px"><a href="/dieu-khoan.html" target="_blank" rel="noopener">Điều khoản sử dụng</a></p>`);
    const st = $('#sheet .auth-st'), ok = $('#authOk');
    const need = () => { if (ok.checked) { try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ v: CONSENT_V, at: new Date().toISOString() })); } catch (e) {} return true; }
      st.innerHTML = '<span class="err">Bạn cần đánh dấu đồng ý ở trên để tạo tài khoản.</span>'; ok.focus(); return false; };
    $('#sheet .auth-google').onclick = async () => {
      if (!need()) return;
      const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname } });
      if (error) st.innerHTML = `<span class="err">Không mở được Google: ${esc(error.message)}</span>`;
    };
    $('#sheet .auth-mail').onsubmit = async e => {
      e.preventDefault(); if (!need()) return; const f = e.target, em = f.querySelector('input').value.trim(), b = f.querySelector('button');
      b.disabled = true; st.textContent = 'Đang gửi…';
      const { error } = await sb.auth.signInWithOtp({ email: em, options: { emailRedirectTo: location.origin + location.pathname } });
      b.disabled = false;
      st.innerHTML = error ? `<span class="err">${/rate|seconds/i.test(error.message) ? 'Bạn vừa gửi rồi, đợi khoảng một phút rồi thử lại.' : 'Không gửi được: ' + esc(error.message)}</span>`
        : `Đã gửi link tới <b>${esc(em)}</b>. Mở email <b>trên máy này</b> và bấm link để vào. Không thấy thì xem thư mục Spam.`;
    };
  }

  async function accountSheet() {
    const md = user.user_metadata || {};
    UI.openSheet(`<h3 id="sheetTitle" style="margin:0 0 4px">Tài khoản</h3>
      <p class="muted" style="margin:0 0 14px">${esc(md.full_name || md.name || '')}${md.full_name || md.name ? ' · ' : ''}${esc(user.email || '')}</p>
      <h4 style="margin:0 0 8px">Lá số đã lưu</h4><div class="auth-list"><p class="muted small">Đang tải…</p></div>
      <button type="button" class="btn-ghost btn-sm auth-hist" style="margin-top:12px">Những lần đã hỏi →</button>
      <div class="auth-opts"><h4>Lưu trữ</h4>
        <label class="auth-sw"><input type="checkbox" id="optHist"${histPref() === 'yes' ? ' checked' : ''}><span>Lưu câu hỏi đã hỏi</span></label>
        <label class="auth-sw"><input type="checkbox" id="optKe"${kePref() ? ' checked' : ''}><span>Đồng bộ lời kể <span class="muted">(chuyện riêng tư)</span></span></label>
      </div>
      <button type="button" class="btn-ghost auth-out" style="margin-top:16px">Đăng xuất</button>
      <details class="auth-danger"><summary>Xóa dữ liệu</summary>
        <p class="small muted" style="margin:6px 0 0">Xóa tài khoản là mất hẳn mọi thứ đã lưu, không khôi phục được.</p>
        <button type="button" class="btn-ghost btn-sm auth-del">Xóa tài khoản</button><button type="button" class="btn-ghost btn-sm auth-wipe">Xóa dữ liệu trên máy này</button></details>`);
    $('#sheet .auth-hist').onclick = () => histSheet();
    $('#optHist').onchange = e => { histSetPref(e.target.checked ? 'yes' : 'no'); if (e.target.checked) histUpload(histAll().filter(x => !x.up)); };
    $('#optKe').onchange = async e => { e.target.disabled = true; await keSetPref(e.target.checked); e.target.disabled = false; UI.toast(e.target.checked ? 'Đã bật đồng bộ lời kể.' : 'Đã tắt và xóa lời kể trên tài khoản.'); };
    $('#sheet .auth-out').onclick = async () => { await sb.auth.signOut(); UI.toast('Đã đăng xuất. Lá số đang mở vẫn còn trên máy này.'); $('#sheet [data-close]').click(); };
    const twice = (b, label, run) => b.onclick = async () => { if (!b.classList.contains('sure')) { b.classList.add('sure'); b.textContent = label; return; } b.disabled = true; await run(); };
    twice($('#sheet .auth-del'), 'Bấm lần nữa để xóa hẳn', async () => {
      const { error } = await sb.rpc('delete_me');
      if (error) { UI.toast('Không xóa được tài khoản, thử lại hoặc viết email cho Tứ Chiếu.'); console.error(error.message); return; }
      try { localStorage.removeItem(CONSENT_KEY); } catch (e) {}
      await sb.auth.signOut(); $('#sheet [data-close]').click(); UI.toast('Đã xóa tài khoản cùng mọi dữ liệu đã lưu trên máy chủ.');
    });
    twice($('#sheet .auth-wipe'), 'Bấm lần nữa để xóa', async () => {
      try { Object.keys(localStorage).filter(k => k.startsWith('tuchieu:') && k !== 'tuchieu:theme').forEach(k => localStorage.removeItem(k)); } catch (e) {}
      location.reload();
    });
    const box = $('#sheet .auth-list');
    try {
      const list = await listCharts();
      if (!list.length) { box.innerHTML = `<div class="fl-empty">${(window.DOODLE && DOODLE.D) || ''}<p class="muted small">Chưa có lá số nào. Lập một lá số là tự lưu vào đây.</p></div>`; return; }
      box.innerHTML = list.map(r => `<div class="auth-row" data-id="${r.id}"><div><b>${esc(r.name)}</b><span class="small muted">${esc(when(r.data))}${r.data.placeName ? ' · ' + esc(r.data.placeName) : ''}</span></div>
        <button type="button" class="btn-primary btn-sm" data-open>Mở</button><button type="button" class="btn-ghost btn-sm" data-del aria-label="Xóa lá số ${esc(r.name)}">Xóa</button></div>`).join('');
      box.querySelectorAll('.auth-row').forEach((row, i) => {
        row.querySelector('[data-open]').onclick = () => { $('#sheet [data-close]').click(); UI.load(list[i].data); };
        const del = row.querySelector('[data-del]');
        del.onclick = async () => {
          if (del.dataset.sure !== '1') { del.dataset.sure = '1'; del.textContent = 'Xóa hẳn?'; return; }
          const { error } = await sb.from('charts').delete().eq('id', row.dataset.id);
          if (error) UI.toast('Không xóa được, thử lại.'); else row.remove();
        };
      });
    } catch (e) { box.innerHTML = `<p class="err small">Không tải được danh sách: ${esc(e.message)}</p>`; }
  }


  /* ---------- Lịch sử hỏi: lưu trên máy, và vào tài khoản khi đăng nhập (chỉ khi người dùng đồng ý) ---------- */
  const HIST_KEY = 'tuchieu:hist', HIST_OK = 'tuchieu:hist-ok', KE_SYNC = 'tuchieu:ke-sync', HIST_MAX = 80;
  const KIND = { tong: 'Bài đọc tổng hợp', hoi: 'Hỏi đáp', qm: 'Kỳ Môn hỏi việc', kd: 'Kinh Dịch', ke: 'Kể nghe' };
  const jget = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
  const jset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const histAll = () => jget(HIST_KEY, []);
  const histPref = () => (jget(HIST_OK, null) || {}).v || null;
  const kePref = () => (jget(KE_SYNC, null) || {}).v === 'yes';
  const newId = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
  const fmtAt = t => new Date(t).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  function histLocalPut(item) { const a = histAll().filter(x => x.lid !== item.lid); a.push(item); jset(HIST_KEY, a.slice(-HIST_MAX)); }
  const row = it => ({ user_id: user.id, lid: it.lid, ckey: it.ckey, chart_name: it.name, kind: it.kind, question: it.q, answer: it.a, meta: it.meta || {}, created_at: it.at });
  async function histUpload(items) {
    if (!sb || !user || !items.length) return;
    const { error } = await sb.from('readings').upsert(items.map(row), { onConflict: 'user_id,lid' });
    if (error) { console.error('Lưu lịch sử lỗi:', error.message); return; }
    const ids = new Set(items.map(x => x.lid)); jset(HIST_KEY, histAll().map(x => ids.has(x.lid) ? { ...x, up: 1 } : x));
  }
  async function profileSet(fields) { if (!sb || !user) return; const { error } = await sb.from('profiles').upsert({ id: user.id, ...fields }); if (error) console.error('profiles:', error.message); }
  function histSetPref(v) {
    const at = new Date().toISOString(); jset(HIST_OK, { v, at });
    profileSet({ save_readings: v === 'yes', save_readings_at: at }); paintHistLink();
  }
  let pending = [];
  function histStore(item) { histLocalPut(item); if (user) histUpload([item]); paintHistLink(); }
  function histAsk(el) {
    if (document.querySelector('.hist-ask')) return;
    const bar = document.createElement('div'); bar.className = 'hist-ask';
    bar.innerHTML = `<span>Lưu câu này để xem lại sau? <a href="/chinh-sach-bao-mat.html" target="_blank" rel="noopener">chi tiết</a></span>
      <span class="hist-ask-b"><button type="button" class="btn-primary btn-sm" data-y>Lưu</button><button type="button" class="btn-ghost btn-sm" data-n>Không</button></span>`;
    (el && el.isConnected ? el : document.body).insertAdjacentElement(el && el.isConnected ? 'afterend' : 'beforeend', bar);
    bar.querySelector('[data-y]').onclick = () => { histSetPref('yes'); pending.forEach(histStore); pending = []; bar.remove(); UI.toast('Đã lưu. Xem lại trong "Những lần đã hỏi".'); };
    bar.querySelector('[data-n]').onclick = () => { histSetPref('no'); pending = []; bar.remove(); };
  }
  window.TCHIST = {
    add({ kind, q, a, meta, el }) {
      if (!a || !q) return;
      const s = UI.saved(), item = { lid: newId(), ckey: s && s.date ? ckey(s) : '', name: (s && s.name) || '', kind, q, a, meta: meta || null, at: new Date().toISOString() };
      const p = histPref(); if (p === 'no') return;
      if (p === 'yes') histStore(item); else { pending.push(item); histAsk(el); }
    },
    open: () => histSheet()
  };
  // nút "Những lần đã hỏi" dưới khung hỏi
  function paintHistLink() {
    const chat = $('#chat'); if (!chat) return;
    let b = $('#histLink'); const n = histAll().length;
    if (!n && !user) { if (b) b.remove(); return; }
    if (!b) { chat.insertAdjacentHTML('afterend', '<p class="hist-link"><button type="button" id="histLink"></button></p>'); b = $('#histLink'); b.onclick = () => histSheet(); }
    b.textContent = user ? 'Những lần đã hỏi →' : `Những lần đã hỏi (${n}) →`;
  }
  async function histList() {
    if (sb && user) {
      const { data, error } = await sb.from('readings').select('lid,kind,question,chart_name,meta,created_at').neq('kind', 'ke').order('created_at', { ascending: false }).limit(200);
      if (error) throw error; return data.map(r => ({ lid: r.lid, kind: r.kind, q: r.question, name: r.chart_name, meta: r.meta, at: r.created_at }));
    }
    return histAll().slice().reverse();
  }
  async function histGet(lid) {
    const loc = histAll().find(x => x.lid === lid); if (loc) return loc;
    const { data, error } = await sb.from('readings').select('lid,kind,question,answer,chart_name,meta,created_at').eq('lid', lid).single();
    if (error) throw error; return { lid: data.lid, kind: data.kind, q: data.question, a: data.answer, name: data.chart_name, meta: data.meta, at: data.created_at };
  }
  async function histDel(lids) {
    jset(HIST_KEY, histAll().filter(x => !lids.includes(x.lid)));
    if (sb && user) { const { error } = await sb.from('readings').delete().in('lid', lids); if (error) throw error; }
    paintHistLink();
  }
  async function histDelAll() {
    jset(HIST_KEY, []);
    if (sb && user) { const { error } = await sb.from('readings').delete().neq('kind', 'ke').eq('user_id', user.id); if (error) throw error; }
    paintHistLink();
  }
  const sub = it => [it.name, it.meta && it.meta.que ? 'quẻ ' + it.meta.que : '', it.meta && it.meta.topic ? it.meta.topic : '', fmtAt(it.at)].filter(Boolean).join(' · ');
  async function histSheet() {
    const off = histPref() === 'no';
    UI.openSheet(`<h3 id="sheetTitle" style="margin:0 0 4px">Những lần đã hỏi</h3>
      ${off ? `<p class="small muted" style="margin:0 0 12px">Đang tắt lưu câu hỏi mới. Bật lại trong mục Tài khoản.</p>` : ''}
      <div class="hist-list"><p class="muted small">Đang tải…</p></div>`);
    const box = $('#sheet .hist-list');
    let list; try { list = await histList(); } catch (e) { box.innerHTML = `<p class="err small">Không tải được: ${esc(e.message)}</p>`; return; }
    if (!list.length) { box.innerHTML = `<div class="fl-empty">${(window.DOODLE && DOODLE.D) || ''}<p class="muted small">Chưa có lần hỏi nào được lưu. Hỏi Tứ Chiếu một câu, bấm Lưu là câu đó nằm ở đây.</p></div>`; return; }
    box.innerHTML = list.map(it => `<button type="button" class="hist-row" data-lid="${esc(it.lid)}"><span class="hist-k">${esc(KIND[it.kind] || it.kind)}</span><b>${esc(it.q)}</b><span class="small muted">${esc(sub(it))}</span></button>`).join('')
      + '<button type="button" class="btn-ghost btn-sm hist-clear" style="margin-top:14px">Xóa hết</button>';
    box.querySelectorAll('.hist-row').forEach(b => b.onclick = () => histOne(b.dataset.lid));
    const c = box.querySelector('.hist-clear');
    c.onclick = async () => { if (!c.classList.contains('sure')) { c.classList.add('sure'); c.textContent = 'Bấm lần nữa để xóa hết'; return; }
      try { await histDelAll(); box.innerHTML = '<p class="muted small">Đã xóa hết.</p>'; } catch (e) { UI.toast('Không xóa được, thử lại.'); } };
  }
  async function histOne(lid) {
    let it; try { it = await histGet(lid); } catch (e) { UI.toast('Không mở được, thử lại.'); return; }
    UI.openSheet(`<button type="button" class="btn-ghost btn-sm hist-back">← Những lần đã hỏi</button>
      <p class="hist-k" style="margin:14px 0 2px">${esc(KIND[it.kind] || it.kind)}</p><h3 id="sheetTitle" style="margin:0 0 4px">${esc(it.q)}</h3>
      <p class="small muted" style="margin:0 0 12px">${esc(sub(it))}</p><div class="ai-out hist-a">${UI.md(it.a || '')}</div>
      <button type="button" class="btn-ghost btn-sm hist-del" style="margin-top:14px">Xóa mục này</button>`);
    $('#sheet .hist-back').onclick = () => histSheet();
    const d = $('#sheet .hist-del');
    d.onclick = async () => { if (!d.classList.contains('sure')) { d.classList.add('sure'); d.textContent = 'Bấm lần nữa để xóa'; return; }
      try { await histDel([lid]); histSheet(); } catch (e) { UI.toast('Không xóa được, thử lại.'); } };
  }

  /* ---------- Đồng bộ lời kể (chỉ khi người dùng bật) ---------- */
  const keLid = (id, ymd, t) => `ke|${id}|${ymd}|${t}`;
  async function keUpDay(id, ymd, list) {
    if (!sb || !user || !kePref()) return;
    const pre = `ke|${id}|${ymd}|`;
    const { error: e1 } = await sb.from('readings').delete().eq('kind', 'ke').like('lid', pre + '%'); if (e1) { console.error(e1.message); return; }
    if (!list.length) return;
    const { error } = await sb.from('readings').insert(list.map(e => ({ user_id: user.id, lid: keLid(id, ymd, e.t), ckey: id, chart_name: id.split('|')[0], kind: 'ke', question: e.q, answer: e.a, meta: { id, ymd, t: e.t }, created_at: new Date(e.t).toISOString() })));
    if (error) console.error('Đồng bộ lời kể lỗi:', error.message);
  }
  async function keUpAll() { const all = jget('tuchieu:ke', {}); for (const id in all) for (const ymd in all[id]) await keUpDay(id, ymd, all[id][ymd]); }
  async function kePull() {
    if (!sb || !user || !kePref()) return;
    const { data, error } = await sb.from('readings').select('question,answer,meta').eq('kind', 'ke').limit(1000);
    if (error || !data) return;
    const all = jget('tuchieu:ke', {});
    data.forEach(r => { const m = r.meta || {}; if (!m.id || !m.ymd) return; const day = ((all[m.id] = all[m.id] || {})[m.ymd] = all[m.id][m.ymd] || []);
      if (!day.some(x => x.t === m.t)) day.push({ q: r.question, a: r.answer, t: m.t }); day.sort((a, b) => a.t - b.t); });
    jset('tuchieu:ke', all); document.dispatchEvent(new Event('tc:ke-refresh'));
  }
  async function keSetPref(on) {
    const at = new Date().toISOString(); jset(KE_SYNC, { v: on ? 'yes' : 'no', at }); profileSet({ sync_ke: on, sync_ke_at: at });
    if (on) { await keUpAll(); await kePull(); }
    else if (sb && user) { const { error } = await sb.from('readings').delete().eq('kind', 'ke').eq('user_id', user.id); if (error) UI.toast('Chưa xóa được lời kể trên tài khoản, thử lại.'); }
  }
  // vừa đăng nhập: lấy lựa chọn đã lưu trong tài khoản (khi máy này chưa chọn), đưa lịch sử trên máy lên
  async function syncOnLogin() {
    const { data } = await sb.from('profiles').select('save_readings,save_readings_at,sync_ke,sync_ke_at').eq('id', user.id).maybeSingle();
    if (data) {
      if (!histPref() && data.save_readings != null) jset(HIST_OK, { v: data.save_readings ? 'yes' : 'no', at: data.save_readings_at });
      if (!jget(KE_SYNC, null) && data.sync_ke != null) jset(KE_SYNC, { v: data.sync_ke ? 'yes' : 'no', at: data.sync_ke_at });
    }
    const hp = jget(HIST_OK, null), kp = jget(KE_SYNC, null), f = {};
    if (hp) Object.assign(f, { save_readings: hp.v === 'yes', save_readings_at: hp.at });
    if (kp) Object.assign(f, { sync_ke: kp.v === 'yes', sync_ke_at: kp.at });
    if (Object.keys(f).length) await profileSet(f);
    if (histPref() === 'yes') await histUpload(histAll().filter(x => !x.up));
    if (kePref()) { await keUpAll(); await kePull(); }
    paintHistLink();
  }

  async function init() {
    let cfg = null; try { cfg = await (await fetch('/api/config')).json(); } catch (e) {}
    paintHistLink();
    if (!cfg || !cfg.supabaseUrl) { btn.onclick = () => UI.toast('Đăng nhập sắp mở.'); return; }
    try { await loadScript('lib/supabase.min.js'); } catch (e) { btn.onclick = () => UI.toast('Không tải được phần đăng nhập, thử tải lại trang.'); return; }
    sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnon, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' } });
    const { data } = await sb.auth.getSession(); user = data.session ? data.session.user : null; paint();
    sb.auth.onAuthStateChange((ev, ses) => {
      const was = user; user = ses ? ses.user : null; paint(); paintHistLink();
      if (ev === 'SIGNED_IN' && !was) setTimeout(() => { afterLogin(); UI.toast('Đã đăng nhập. Lá số sẽ tự lưu vào tài khoản.'); $('#sheet:not([hidden]) [data-close]')?.click(); }, 0);
    });
    // link đăng nhập trả về ?code=… : dọn khỏi thanh địa chỉ cho gọn
    const err = new URLSearchParams(location.search).get('error_description');
    if (err) UI.toast('Đăng nhập chưa thành công: ' + err);
    if (/[?&](code|error_description)=/.test(location.search)) history.replaceState(null, '', location.pathname + location.hash);
    btn.onclick = () => user ? accountSheet() : loginSheet();
    document.addEventListener('tc:saved', e => saveChart(e.detail));
    document.addEventListener('tc:ke', e => keUpDay(e.detail.id, e.detail.ymd, e.detail.list));
    paintHistLink();
  }
  init();
})();
