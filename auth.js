/* Tứ Chiếu — đăng nhập (Supabase): Google hoặc link qua email, lưu lá số theo tài khoản.
   Cấu hình lấy từ /api/config (biến môi trường trên Vercel). Chưa cấu hình thì nút chỉ báo "sắp mở".
   Chỉ lưu thông tin để lập lại lá số; lời kể trong "Kể nghe" và bài AI không đưa lên tài khoản. */
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
    const cur = UI.saved();
    if (cur && cur.date) { await saveChart(cur); return; }
    try { const [last] = await listCharts(); if (last) UI.load(last.data); } catch (e) { console.error(e); }
  }

  const G = '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
  function loginSheet() {
    UI.openSheet(`<h3 id="sheetTitle" style="margin:0 0 6px">Đăng nhập Tứ Chiếu</h3>
      <p class="muted" style="margin:0 0 16px">Lá số được lưu vào tài khoản. Đổi máy hay xóa trình duyệt vẫn mở lại được.</p>
      <label class="auth-ok"><input type="checkbox" id="authOk"><span>Tôi đồng ý để Tứ Chiếu lưu email và các lá số tôi lập (tên, ngày giờ, nơi sinh) vào tài khoản, theo <a href="/chinh-sach-bao-mat.html" target="_blank" rel="noopener">Chính sách bảo mật</a>.</span></label>
      <button type="button" class="btn-ghost auth-google">${G}<span>Tiếp tục với Google</span></button>
      <div class="auth-or"><span>hoặc nhận link qua email</span></div>
      <form class="auth-mail"><input type="email" required autocomplete="email" placeholder="email của bạn" aria-label="Email"><button type="submit" class="btn-primary">Gửi link</button></form>
      <p class="auth-st small" aria-live="polite"></p>
      <p class="small muted" style="margin-top:14px">Không cần mật khẩu: bấm link trong email là vào. Lời kể trong "Kể nghe" vẫn chỉ nằm trên máy này. Dùng Tứ Chiếu là bạn đồng ý với <a href="/dieu-khoan.html" target="_blank" rel="noopener">Điều khoản sử dụng</a>.</p>`);
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
      <button type="button" class="btn-ghost auth-out" style="margin-top:16px">Đăng xuất</button>
      <div class="auth-danger"><h4>Xóa dữ liệu</h4>
        <p class="small muted" style="margin:0">Xóa tài khoản sẽ xóa hẳn email và mọi lá số đã lưu trên máy chủ, không khôi phục được. Dữ liệu trên máy này (lá số đang mở, lời kể) xóa riêng.</p>
        <button type="button" class="btn-ghost btn-sm auth-del">Xóa tài khoản</button><button type="button" class="btn-ghost btn-sm auth-wipe">Xóa dữ liệu trên máy này</button></div>`);
    $('#sheet .auth-out').onclick = async () => { await sb.auth.signOut(); UI.toast('Đã đăng xuất. Lá số đang mở vẫn còn trên máy này.'); $('#sheet [data-close]').click(); };
    const twice = (b, label, run) => b.onclick = async () => { if (!b.classList.contains('sure')) { b.classList.add('sure'); b.textContent = label; return; } b.disabled = true; await run(); };
    twice($('#sheet .auth-del'), 'Bấm lần nữa để xóa hẳn', async () => {
      const { error } = await sb.rpc('delete_me');
      if (error) { UI.toast('Không xóa được tài khoản, thử lại hoặc viết email cho Tứ Chiếu.'); console.error(error.message); return; }
      try { localStorage.removeItem(CONSENT_KEY); } catch (e) {}
      await sb.auth.signOut(); $('#sheet [data-close]').click(); UI.toast('Đã xóa tài khoản và các lá số đã lưu.');
    });
    twice($('#sheet .auth-wipe'), 'Bấm lần nữa để xóa', async () => {
      try { Object.keys(localStorage).filter(k => k.startsWith('tuchieu:') && k !== 'tuchieu:theme').forEach(k => localStorage.removeItem(k)); } catch (e) {}
      location.reload();
    });
    const box = $('#sheet .auth-list');
    try {
      const list = await listCharts();
      if (!list.length) { box.innerHTML = '<p class="muted small">Chưa có lá số nào. Lập một lá số là tự lưu vào đây.</p>'; return; }
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

  async function init() {
    let cfg = null; try { cfg = await (await fetch('/api/config')).json(); } catch (e) {}
    if (!cfg || !cfg.supabaseUrl) { btn.onclick = () => UI.toast('Đăng nhập sắp mở.'); return; }
    try { await loadScript('lib/supabase.min.js'); } catch (e) { btn.onclick = () => UI.toast('Không tải được phần đăng nhập, thử tải lại trang.'); return; }
    sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnon, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' } });
    const { data } = await sb.auth.getSession(); user = data.session ? data.session.user : null; paint();
    sb.auth.onAuthStateChange((ev, ses) => {
      const was = user; user = ses ? ses.user : null; paint();
      if (ev === 'SIGNED_IN' && !was) setTimeout(() => { afterLogin(); UI.toast('Đã đăng nhập. Lá số sẽ tự lưu vào tài khoản.'); $('#sheet:not([hidden]) [data-close]')?.click(); }, 0);
    });
    // link đăng nhập trả về ?code=… : dọn khỏi thanh địa chỉ cho gọn
    const err = new URLSearchParams(location.search).get('error_description');
    if (err) UI.toast('Đăng nhập chưa thành công: ' + err);
    if (/[?&](code|error_description)=/.test(location.search)) history.replaceState(null, '', location.pathname + location.hash);
    btn.onclick = () => user ? accountSheet() : loginSheet();
    document.addEventListener('tc:saved', e => saveChart(e.detail));
  }
  init();
})();
