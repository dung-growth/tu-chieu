// Vercel Serverless Function: POST /api/luangiai
// Nhận dữ liệu lá số từ trang, gọi AI bằng khóa của chủ trang, trả bài luận về dần dần.
// Gọi lần lượt từng nguồn AI; nguồn trước hết lượt, lỗi hoặc quá lâu chưa trả lời thì tự chuyển sang nguồn sau.
//
// Biến môi trường trên Vercel (Settings → Environment Variables):
//   GEMINI_API_KEY      khóa tạo ở aistudio.google.com (cần ít nhất một trong hai khóa)
//   GEMINI_MODEL        (tùy chọn) mặc định gemini-3-flash-preview
//   OPENROUTER_API_KEY  khóa tạo ở openrouter.ai → Keys; dùng các model miễn phí làm dự phòng
//   OPENROUTER_MODELS   (tùy chọn) danh sách model, cách nhau bằng dấu phẩy, theo thứ tự ưu tiên.
//                       Mặc định: google/gemma-4-31b-it:free,nvidia/nemotron-3-super-120b-a12b:free
//   AI_ORDER            (tùy chọn) "gemini" (mặc định: Gemini trước) hoặc "openrouter" (OpenRouter trước)
//   ACCESS_CODE         (tùy chọn) mã truy cập; nếu đặt thì chỉ ai nhập đúng mã mới dùng được AI
//   RATE_LIMIT_PER_HOUR (tùy chọn) số lượt tối đa mỗi IP mỗi giờ, mặc định 8
//   OWNER_CODE          (tùy chọn) mã của chủ trang; nhập mã này vào ô "Mã truy cập" thì không bị giới hạn lượt

import { rules, askRules, FOCUS } from '../prompt.js';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
const OR_MODELS = (process.env.OPENROUTER_MODELS || 'google/gemma-4-31b-it:free,nvidia/nemotron-3-super-120b-a12b:free')
  .split(',').map(s => s.trim()).filter(Boolean);
const FIRST_TEXT_TIMEOUT = Number(process.env.AI_FIRST_TIMEOUT_MS || 25000); // chờ chữ đầu tiên tối đa 25 giây rồi chuyển nguồn khác
const LIMIT = Number(process.env.RATE_LIMIT_PER_HOUR || 8);
const hits = new Map(); // đếm lượt theo IP (tương đối: máy chủ khởi động lại là đếm lại)
const clip = (s, n) => String(s || '').slice(0, n);

// Tên dễ đọc để hiện dưới câu trả lời
const prettyName = id => /gemini/i.test(id) ? 'Gemini' : /gemma-4-31b/i.test(id) ? 'Gemma 4 31B' : /gemma/i.test(id) ? 'Gemma'
  : /nemotron-3-super/i.test(id) ? 'Nemotron 3 Super' : /nemotron/i.test(id) ? 'Nemotron' : id.split('/').pop().replace(/:free$/, '');

// Danh sách nguồn theo thứ tự thử
function providers() {
  const g = process.env.GEMINI_API_KEY ? [{ kind: 'gemini', model: GEMINI_MODEL }] : [];
  const o = process.env.OPENROUTER_API_KEY ? OR_MODELS.map(m => ({ kind: 'openrouter', model: m })) : [];
  return process.env.AI_ORDER === 'openrouter' ? [...o, ...g] : [...g, ...o];
}

// Đọc luồng SSE, trả về từng mẩu chữ
async function* sse(body) {
  const reader = body.getReader(), dec = new TextDecoder(); let buf = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true }).replace(/\r\n/g, '\n');
    let i;
    while ((i = buf.indexOf('\n\n')) >= 0) {
      const chunk = buf.slice(0, i); buf = buf.slice(i + 2);
      for (const line of chunk.split('\n')) if (line.startsWith('data:')) yield line.slice(5).trim();
    }
  }
}

// Bỏ phần "suy nghĩ" mà một số model in ra giữa <think> … </think>
function thinkFilter() {
  let inThink = false, pending = '';
  return piece => {
    let s = pending + piece, out = ''; pending = '';
    for (;;) {
      if (inThink) { const e = s.indexOf('</think>'); if (e < 0) { pending = s.slice(-8); return out; } s = s.slice(e + 8); inThink = false; }
      const b = s.indexOf('<think>');
      if (b < 0) { const keep = s.lastIndexOf('<'); if (keep >= 0 && s.length - keep < 8) { pending = s.slice(keep); s = s.slice(0, keep); } return out + s; }
      out += s.slice(0, b); s = s.slice(b + 7); inThink = true;
    }
  };
}

// Gọi một nguồn; trả về bộ sinh chữ, hoặc ném lỗi kèm mã HTTP
async function* callProvider(p, messages, maxTokens, signal) {
  if (p.kind === 'gemini') {
    const contents = messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(p.model)}:streamGenerateContent?alt=sse`, {
      method: 'POST', signal,
      headers: { 'content-type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 } })
    });
    if (!r.ok) { const t = await r.text().catch(() => ''); throw Object.assign(new Error('gemini ' + r.status + ' ' + t.slice(0, 300)), { status: r.status }); }
    for await (const d of sse(r.body)) {
      let ev; try { ev = JSON.parse(d); } catch { continue; }
      if (ev.error) throw Object.assign(new Error('gemini stream error'), { mid: true });
      for (const part of ev.candidates?.[0]?.content?.parts || []) if (part.text && !part.thought) yield part.text;
    }
    return;
  }
  // OpenRouter: kiểu kết nối giống OpenAI
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST', signal,
    headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + process.env.OPENROUTER_API_KEY,
      'HTTP-Referer': 'https://tu-chieu.vercel.app', 'X-Title': 'Tu Chieu' },
    body: JSON.stringify({ model: p.model, messages, stream: true, max_tokens: maxTokens, temperature: 0.7 })
  });
  if (!r.ok) { const t = await r.text().catch(() => ''); throw Object.assign(new Error('openrouter ' + p.model + ' ' + r.status + ' ' + t.slice(0, 300)), { status: r.status }); }
  const strip = thinkFilter();
  for await (const d of sse(r.body)) {
    if (d === '[DONE]') break;
    let ev; try { ev = JSON.parse(d); } catch { continue; }
    if (ev.error) throw Object.assign(new Error('openrouter stream error: ' + JSON.stringify(ev.error).slice(0, 200)), { mid: true });
    const c = ev.choices?.[0]?.delta?.content; // bỏ qua delta.reasoning (phần suy nghĩ)
    if (c) { const s = strip(c); if (s) yield s; }
  }
}

// Lấy mẩu chữ đầu tiên, có hạn giờ
function firstPiece(gen, ms) {
  let timer;
  return Promise.race([gen.next(), new Promise((_, no) => { timer = setTimeout(() => no(Object.assign(new Error('timeout'), { timeout: true })), ms); })])
    .finally(() => clearTimeout(timer));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Chỉ nhận POST.' });
  const list0 = providers();
  if (!list0.length) return res.status(500).json({ error: 'Chưa cài GEMINI_API_KEY hoặc OPENROUTER_API_KEY trên Vercel.' });

  const code = String(req.headers['x-access-code'] || '');
  const owner = !!process.env.OWNER_CODE && code === process.env.OWNER_CODE;
  if (!owner && process.env.ACCESS_CODE && code !== process.env.ACCESS_CODE)
    return res.status(401).json({ error: 'Sai hoặc thiếu mã truy cập.' });

  // Kiểm tra giới hạn trước, nhưng chỉ trừ lượt khi AI trả lời được (xem cuối hàm)
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '?').split(',')[0].trim();
  const now = Date.now();
  const list = (hits.get(ip) || []).filter(t => now - t < 3600e3);
  hits.set(ip, list);
  if (!owner && list.length >= LIMIT) {
    const mins = Math.max(1, Math.ceil((list[0] + 3600e3 - now) / 60e3));
    return res.status(429).json({ error: `Bạn đã dùng hết ${LIMIT} lượt trong giờ này, khoảng ${mins} phút nữa sẽ có lại. Trong lúc chờ, dùng nút "Sao chép lời nhắc" để luận giải bằng ChatGPT hoặc Gemini của bạn.` });
  }

  const b = req.body || {};
  const brief = clip(b.brief, 20000);
  if (brief.length < 200) return res.status(400).json({ error: 'Thiếu dữ liệu lá số.' });
  const focus = FOCUS.includes(b.focus) ? b.focus : 'tổng quát';
  const ctx = clip(b.ctx, 600);

  // Chưa có bài luận tổng mà hỏi thẳng: chỉ đưa dữ liệu lá số, không bắt viết bài luận
  const firstText = clip(b.first, 20000);
  const messages = b.question && !firstText
    ? [{ role: 'user', content: `Dưới đây là DỮ LIỆU ĐÃ TÍNH SẴN của người hỏi (Bát tự, chiêm tinh, Tử vi, thần số học). Chỉ dùng dữ liệu này, không tự tính lại. Người hỏi chưa đọc bài luận tổng.${ctx ? `\nBối cảnh của người hỏi: "${ctx}".` : ''}\n\nDỮ LIỆU:\n` + brief },
       { role: 'assistant', content: 'Tôi đã đọc xong dữ liệu lá số. Bạn muốn hỏi gì?' }]
    : [{ role: 'user', content: rules(focus, ctx) + '\n\nDỮ LIỆU:\n' + brief }];
  let maxTokens = 12288;
  if (b.question) {
    if (firstText) messages.push({ role: 'assistant', content: firstText });
    (Array.isArray(b.history) ? b.history.slice(-3) : []).forEach(h => {
      messages.push({ role: 'user', content: clip(h.q, 400) });
      messages.push({ role: 'assistant', content: clip(h.a, 6000) || '...' });
    });
    const que = clip(b.que, 2000);
    const qText = que
      ? `Câu hỏi: ${clip(b.question, 400)}\n\n[QUẺ VỪA GIEO]\n${que}\n\nHãy luận câu hỏi này bằng quẻ trên, kết hợp các lá số đã có. Dùng Markdown, ba phần ngắn:\n### Quẻ nói gì\nÝ của quẻ chủ, hào động, quẻ hỗ (diễn biến bên trong), quẻ biến (kết cục), quan hệ Thể và Dụng theo Mai Hoa, gắn vào đúng câu hỏi.\n### Kết hợp lá số\nĐối chiếu với vận hiện tại trong bát tự, tử vi, chiêm tinh, thần số. Nói rõ phần so Thể với Nhật chủ là cách ghép hiện đại, không có trong sách Mai Hoa gốc.\n### Gợi ý\n2–3 việc cụ thể nên cân nhắc.\nGiọng gợi mở, không phán chắc thành hay bại, không dọa. Không chép dài kinh văn. Không tâng bốc, không tự gán hoàn cảnh người hỏi chưa nói. Nếu câu hỏi thiếu bối cảnh, kết bằng đúng một câu hỏi lại. Khoảng 350–550 từ.`
      : `Câu hỏi: ${clip(b.question, 400)}\n\n${askRules()}`;
    messages.push({ role: 'user', content: qText });
    maxTokens = 6144;
  }

  // Thử lần lượt từng nguồn cho tới khi có chữ đầu tiên
  let gen = null, first = null, used = null, lastErr = null;
  for (const p of list0) {
    const ctl = new AbortController();
    const g = callProvider(p, messages, maxTokens, ctl.signal);
    try {
      const r = await firstPiece(g, FIRST_TEXT_TIMEOUT);
      if (r.done) throw new Error(p.model + ' trả về rỗng');
      gen = g; first = r.value; used = p; break;
    } catch (e) {
      ctl.abort(); lastErr = e;
      console.error('AI fallback:', p.kind, p.model, e.status || '', e.message);
    }
  }
  if (!gen) {
    const st = lastErr?.status;
    const msg = st === 429 ? 'Đã hết lượt AI miễn phí hôm nay. Dùng nút "Sao chép lời nhắc" để luận giải ở nơi khác.'
      : (st === 401 || st === 403) ? 'Khóa AI không hợp lệ hoặc chưa được bật, kiểm tra GEMINI_API_KEY / OPENROUTER_API_KEY.'
      : lastErr?.timeout ? 'AI đang quá tải, thử lại sau ít phút.'
      : 'AI đang bận hoặc lỗi, thử lại sau.';
    return res.status(502).json({ error: msg });
  }

  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no',
    'X-AI-Model': encodeURIComponent(prettyName(used.model)), 'Access-Control-Expose-Headers': 'X-AI-Model' });
  res.write(first);
  try {
    for (;;) { const r = await gen.next(); if (r.done) break; res.write(r.value); }
  } catch (e) {
    console.error('AI stream cut:', used.model, e.message);
    res.write('\u0000ERR:AI bị gián đoạn giữa chừng.');
  }
  if (!owner) list.push(now); // chỉ tính lượt khi đã có câu trả lời
  res.end();
}
