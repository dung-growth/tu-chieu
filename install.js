/* Tứ Chiếu: mời cài web lên màn hình điện thoại (PWA).
   - Đã cài (mở dạng app) thì không mời.
   - Mời ngay sau khi đọc xong một chương luận giải, hoặc từ ngày ghé thứ 2. Chỉ khi đã có lá số. "Để sau" thì 7 ngày sau mới mời lại.
   - Android/Chrome: một nút Cài. iPhone: hướng dẫn 3 bước trong Safari. Mở trong Facebook, Zalo: nhắc mở bằng trình duyệt trước. */
(() => {
  if ('serviceWorker' in navigator && location.protocol === 'https:') addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  const UI = window.TCUI; if (!UI) return;
  const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  const ua = navigator.userAgent;
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const inApp = /FBAN|FBAV|FB_IAB|Instagram|Zalo|Line\//i.test(ua);
  const mobile = ios || /Android/i.test(ua);
  let deferred = null;
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; paintFoot(); });
  addEventListener('appinstalled', () => { ls.set('tuchieu:installed', '1'); hideBar(); paintFoot(); UI.toast('Đã cài Tứ Chiếu lên màn hình.'); });

  // đếm số ngày ghé
  const today = new Date().toISOString().slice(0, 10);
  if (ls.get('tuchieu:visit-last') !== today) { ls.set('tuchieu:visit-last', today); ls.set('tuchieu:visit-days', String(+(ls.get('tuchieu:visit-days') || 0) + 1)); }

  const SHARE = '<svg viewBox="0 0 24 24" class="in-ic" aria-hidden="true"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M12 3v13"/><path d="m7 8 5-5 5 5"/></svg>';
  const PLUS = '<svg viewBox="0 0 24 24" class="in-ic" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/></svg>';
  function guide() {
    hideBar();
    if (deferred) { deferred.prompt(); deferred.userChoice.finally(() => { deferred = null; paintFoot(); }); return; }
    const html = inApp
      ? `<div class="sh-top"><div><h3 id="sheetTitle">Mở bằng trình duyệt trước</h3></div></div>
         <p>Bạn đang mở Tứ Chiếu trong ${/Zalo/i.test(ua) ? 'Zalo' : 'Facebook'}, ở đây không cài được. Bấm <b>⋯</b> ở góc trên rồi chọn <b>Mở bằng ${ios ? 'Safari' : 'trình duyệt'}</b>, sau đó cài như bình thường.</p>`
      : ios
      ? `<div class="sh-top"><div><h3 id="sheetTitle">Cài trên iPhone</h3><div class="small muted">Làm trong Safari, mất chừng 10 giây.</div></div></div>
         <ol class="in-steps"><li><span>1</span><div>Bấm nút <b>Chia sẻ</b> ${SHARE} ở thanh dưới cùng của Safari</div></li>
         <li><span>2</span><div>Kéo xuống, chọn <b>Thêm vào MH chính</b> ${PLUS}</div></li>
         <li><span>3</span><div>Bấm <b>Thêm</b> ở góc phải</div></li></ol>`
      : `<div class="sh-top"><div><h3 id="sheetTitle">Cài trên điện thoại</h3></div></div>
         <ol class="in-steps"><li><span>1</span><div>Bấm nút <b>⋮</b> ở góc trên của Chrome</div></li>
         <li><span>2</span><div>Chọn <b>Thêm vào màn hình chính</b> hoặc <b>Cài đặt ứng dụng</b></div></li></ol>`;
    UI.openSheet(html);
  }
  // khung mời ở đáy
  let bar = null;
  function hideBar() { if (bar) { bar.remove(); bar = null; } }
  function maybeAsk(now) {
    if (standalone || !mobile || bar || ls.get('tuchieu:installed')) return;
    if (!UI.R() || (now !== true && +(ls.get('tuchieu:visit-days') || 0) < 2)) return;
    if (Date.now() < +(ls.get('tuchieu:install-snooze') || 0)) return;
    bar = document.createElement('div'); bar.className = 'in-bar'; bar.setAttribute('role', 'dialog'); bar.setAttribute('aria-label', 'Cài Tứ Chiếu lên điện thoại');
    bar.innerHTML = `<img src="/assets/icons/icon-192.png" alt="" width="40" height="40"><div><b>Cài Tứ Chiếu lên điện thoại</b><p>Mở bằng một chạm như app, khỏi phải tìm lại trang.</p></div>
      <div class="in-act"><button type="button" class="btn-primary btn-sm" data-go>Cài</button><button type="button" class="btn-ghost btn-sm" data-later>Để sau</button></div>`;
    bar.querySelector('[data-go]').onclick = guide;
    bar.querySelector('[data-later]').onclick = () => { ls.set('tuchieu:install-snooze', String(Date.now() + 7 * 864e5)); hideBar(); };
    document.body.append(bar);
  }
  // dòng nhỏ ở chân trang, lúc nào cũng có (trừ khi đã cài)
  function paintFoot() {
    let a = document.getElementById('inFoot');
    if (standalone || ls.get('tuchieu:installed') || (!mobile && !deferred)) { if (a) a.remove(); return; }
    if (!a) { const host = document.querySelector('.foot-legal'); if (!host) return;
      a = document.createElement('button'); a.type = 'button'; a.id = 'inFoot'; a.className = 'in-foot'; a.textContent = 'Cài Tứ Chiếu lên điện thoại'; a.onclick = guide; host.after(a); }
  }
  paintFoot();
  setTimeout(maybeAsk, 4000);
  // vừa đọc xong một chương luận giải (đóng khung chương): lúc đang thấy hay thì mời luôn, không đợi ngày ghé thứ hai
  document.addEventListener('tc:chapter-read', () => setTimeout(() => { if (!document.body.classList.contains('asking') && !document.body.classList.contains('sheet-open')) maybeAsk(true); }, 500));
  document.getElementById('f') && document.getElementById('f').addEventListener('submit', () => setTimeout(maybeAsk, 6000));
})();
