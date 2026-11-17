/* Tứ Chiếu — ảnh dọc 1080×1920 để đăng story, vẽ hoàn toàn trên trình duyệt (không gửi dữ liệu đi đâu).
   Dùng lại nội dung của thẻ đầu Tổng quan (CARD.build) và màu, hướng hợp (CARD.luck). */
const SHARE = (() => {
  const W = 1080, H = 1920;
  // số giả ngẫu nhiên theo ngày sinh, để mỗi người một bầu sao nhưng mở lại vẫn y nguyên
  const rng = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  function markSvg(K) {
    const by = Object.fromEntries(K.votes.map(v => [v.k, v]));
    const ray = (v, d) => v ? `<path d="${d}" fill="${K.RAY[v.el]}" opacity="${v.agree || !K.main ? 1 : .42}"/>` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 200 200"><defs><radialGradient id="h"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
      <circle cx="100" cy="100" r="62" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width=".6"/><circle cx="100" cy="100" r="30" fill="url(#h)"/>
      ${ray(by.bz, 'M100 10 102.5 92 100 100 97.5 92Z')}${ray(by.as, 'M190 100 108 102.5 100 100 108 97.5Z')}${ray(by.tv, 'M100 190 97.5 108 100 100 102.5 108Z')}
      <path d="M10 100 92 97.5 100 100 92 102.5Z" fill="#f1dca8" opacity=".55"/><circle cx="100" cy="100" r="3.5" fill="#fff"/></svg>`;
  }
  const img = svg => new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); });

  // xuống dòng theo bề rộng
  function wrap(c, text, maxW) {
    const out = []; let line = '';
    text.split(' ').forEach(w => { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; });
    if (line) out.push(line); return out;
  }
  function spaced(c, text, x, y, sp) { // chữ giãn cách (cho dòng nhãn nhỏ)
    for (const ch of text) { c.fillText(ch, x, y); x += c.measureText(ch).width + sp; }
  }

  async function make(R) {
    const K = CARD.build(R), L = CARD.luck(R), i = R.input, [y, mo, d] = i.date.split('-');
    if (document.fonts) await Promise.all(['500 96px Lora', '400 40px Inter', '600 40px Inter'].map(f => document.fonts.load(f).catch(() => {})));
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
    const [g0, g1, g2] = K.sky.g, tint = K.main ? K.INK[K.main] : '#5a6aa0';
    // trời
    let g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, g0); g.addColorStop(.55, g1); g.addColorStop(1, g2); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const glow = (x, yy, r, a) => { const q = c.createRadialGradient(x, yy, 0, x, yy, r); q.addColorStop(0, tint + a); q.addColorStop(1, tint + '00'); c.fillStyle = q; c.fillRect(0, 0, W, H); };
    glow(W * .3, H, 900, '88'); glow(W * .9, H * .95, 700, '55');
    // sao
    const r = rng(+(y + mo + d) % 2147483646 + 1);
    for (let k = 0; k < 70; k++) { const sy = r() * H * .62; c.globalAlpha = .2 + r() * .6; c.fillStyle = '#fff'; c.beginPath(); c.arc(r() * W, sy, .8 + r() * 2.2, 0, 7); c.fill(); }
    c.globalAlpha = 1;
    // dòng trên: giờ, ngày, trăng
    const sans = (wt, px) => `${wt} ${px}px Inter, system-ui, sans-serif`;
    c.fillStyle = 'rgba(255,255,255,.75)'; c.font = sans(500, 30); c.textBaseline = 'alphabetic';
    spaced(c, `${K.timeKnown ? i.time + ' · ' : ''}${d}.${mo}.${y}`, 80, 150, 5);
    if (K.moon) c.drawImage(await img(`<svg xmlns="http://www.w3.org/2000/svg" width="84" height="84" viewBox="-23 -23 46 46"><circle r="18" fill="#fff" opacity=".1"/>${K.moon.dark ? '' : `<path d="${K.moon.path}" fill="#F6EEDC"/>`}</svg>`), W - 164, 98);
    // dấu bốn tia
    c.drawImage(await img(markSvg(K)), (W - 560) / 2, 230, 560, 560);
    // tên, tiêu đề (ưu tiên ngắt sau dấu phẩy), câu tả
    let yy = 900;
    c.fillStyle = 'rgba(255,255,255,.78)'; c.font = sans(500, 30); spaced(c, i.name.toUpperCase(), 80, yy, 6);
    c.fillStyle = '#fff'; c.font = '500 92px Lora, Georgia, serif';
    const parts = /^Pha trộn /.test(K.title) ? ['Pha trộn', K.title.slice(9)] : K.title.split(/(?<=,) /), tl = c.measureText(K.title).width <= W - 160 ? [K.title]
      : parts.length > 1 && parts.every(t => c.measureText(t).width <= W - 160) && parts.length <= 2 ? parts : wrap(c, K.title, W - 160);
    tl.forEach(t => { yy += 108; c.fillText(t, 80, yy); });
    yy += 30; c.font = sans(400, 38); c.fillStyle = 'rgba(255,255,255,.9)';
    wrap(c, K.body, W - 160).forEach(t => { yy += 56; c.fillText(t, 80, yy); });
    // ba môn trên một dòng
    yy += 80; let x = 80; c.font = sans(500, 32);
    K.votes.forEach(v => { c.globalAlpha = v.agree || !K.main ? 1 : .55; c.fillStyle = K.RAY[v.el]; c.fillRect(x, yy - 13, 34, 5); c.globalAlpha = 1;
      const t = `${v.sys} ${v.el}`; c.fillStyle = 'rgba(255,255,255,.92)'; c.fillText(t, x + 46, yy); x += 46 + c.measureText(t).width + 40; });
    // màu và hướng hợp, hai cột
    yy += 50; c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(80, yy, W - 160, 2); yy += 70;
    c.fillStyle = 'rgba(255,255,255,.7)'; c.font = sans(500, 28); spaced(c, 'MÀU HỢP', 80, yy, 5); spaced(c, 'HƯỚNG HỢP', 640, yy, 5);
    yy += 64; x = 80; c.font = sans(500, 36);
    L.colors.forEach(([nm, hex]) => { c.fillStyle = hex; c.beginPath(); c.arc(x + 18, yy - 13, 18, 0, 7); c.fill(); c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 2; c.stroke();
      c.fillStyle = '#fff'; c.fillText(nm, x + 48, yy); x += 48 + c.measureText(nm).width + 36; });
    c.fillStyle = '#fff'; c.fillText(L.dirs, 640, yy);
    c.fillStyle = 'rgba(255,255,255,.62)'; c.font = sans(400, 27); c.fillText(L.why + '.', 80, yy + 56);
    // chân
    c.fillStyle = 'rgba(255,255,255,.7)'; c.font = sans(600, 30); c.textAlign = 'center'; c.fillText('Tứ Chiếu · tu-chieu.vercel.app', W / 2, H - 150);
    return new Promise(ok => cv.toBlob(ok, 'image/png'));
  }

  // tạo ảnh rồi hiện xem trước; nút tải là một thẻ <a download> nên trình duyệt nào cũng cho tải
  let url;
  async function share(R, openSheet) {
    const blob = await make(R), name = `tu-chieu-${(R.input.name || 'la-so').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}.png`;
    if (url) URL.revokeObjectURL(url); url = URL.createObjectURL(blob);
    const file = new File([blob], name, { type: 'image/png' }), canShare = !!(navigator.canShare && navigator.canShare({ files: [file] }));
    openSheet(`<h3 id="sheetTitle" style="margin:0 0 10px">Ảnh để đăng story</h3>
      <img src="${url}" alt="Ảnh story của ${R.input.name}" style="display:block;width:100%;max-width:320px;margin:0 auto 14px;border-radius:14px;box-shadow:0 6px 24px rgba(0,0,0,.18)">
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><a class="btn-primary" href="${url}" download="${name}">Tải ảnh về</a>${canShare ? '<button type="button" class="btn-ghost" id="shShare">Chia sẻ</button>' : ''}</div>
      <p class="small muted" style="text-align:center;margin-top:10px">Trên điện thoại cũng có thể nhấn giữ vào ảnh để lưu.</p>`);
    const sb = document.getElementById('shShare');
    if (sb) sb.onclick = () => navigator.share({ files: [file] }).catch(() => {});
  }
  return { make, share };
})();
if (typeof module !== 'undefined') module.exports = SHARE;
