// Vercel Serverless Function: POST /api/luangiai
// Nhận dữ liệu lá số từ trang, gọi Gemini API (gói miễn phí) bằng khóa của chủ trang, trả bài luận về dần dần.
//
// Biến môi trường trên Vercel (Settings → Environment Variables):
//   GEMINI_API_KEY      (bắt buộc) khóa tạo ở aistudio.google.com
//   GEMINI_MODEL        (tùy chọn) mặc định gemini-3-flash-preview
//   ACCESS_CODE         (tùy chọn) mã truy cập; nếu đặt thì chỉ ai nhập đúng mã mới dùng được AI
//   RATE_LIMIT_PER_HOUR (tùy chọn) số lượt tối đa mỗi IP mỗi giờ, mặc định 8
//   OWNER_CODE          (tùy chọn) mã của chủ trang; nhập mã này vào ô "Mã truy cập" thì không bị giới hạn lượt

import { rules, askRules, FOCUS } from '../prompt.js';

const MODEL = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
const LIMIT = Number(process.env.RATE_LIMIT_PER_HOUR || 8);
const hits = new Map(); // đếm lượt theo IP (tương đối: máy chủ khởi động lại là đếm lại)
const clip = (s, n) => String(s || '').slice(0, n);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Chỉ nhận POST.' });
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Chưa cài GEMINI_API_KEY trên Vercel.' });

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
  const brief = clip(b.brief, 14000);
  if (brief.length < 200) return res.status(400).json({ error: 'Thiếu dữ liệu lá số.' });
  const focus = FOCUS.includes(b.focus) ? b.focus : 'tổng quát';
  const ctx = clip(b.ctx, 600);

  // Gemini dùng role "user" và "model"
  const contents = [{ role: 'user', parts: [{ text: rules(focus, ctx) + '\n\nDỮ LIỆU:\n' + brief }] }];
  let maxTokens = 12288;
  if (b.question) {
    contents.push({ role: 'model', parts: [{ text: clip(b.first, 20000) || '(đã luận giải)' }] });
    (Array.isArray(b.history) ? b.history.slice(-3) : []).forEach(h => {
      contents.push({ role: 'user', parts: [{ text: clip(h.q, 400) }] });
      contents.push({ role: 'model', parts: [{ text: clip(h.a, 6000) || '...' }] });
    });
    const que = clip(b.que, 2000);
    const qText = que
      ? `Câu hỏi: ${clip(b.question, 400)}\n\n[QUẺ VỪA GIEO]\n${que}\n\nHãy luận câu hỏi này bằng quẻ trên, kết hợp các lá số đã có. Dùng Markdown, ba phần ngắn:\n### Quẻ nói gì\nÝ của quẻ chủ, hào động, quẻ hỗ (diễn biến bên trong), quẻ biến (kết cục), quan hệ Thể và Dụng theo Mai Hoa, gắn vào đúng câu hỏi.\n### Kết hợp lá số\nĐối chiếu với vận hiện tại trong bát tự, tử vi, chiêm tinh, thần số. Nói rõ phần so Thể với Nhật chủ là cách ghép hiện đại, không có trong sách Mai Hoa gốc.\n### Gợi ý\n2–3 việc cụ thể nên cân nhắc.\nGiọng gợi mở, không phán chắc thành hay bại, không dọa. Không chép dài kinh văn. Không tâng bốc, không tự gán hoàn cảnh người hỏi chưa nói. Nếu câu hỏi thiếu bối cảnh, kết bằng đúng một câu hỏi lại. Khoảng 350–550 từ.`
      : `Câu hỏi: ${clip(b.question, 400)}\n\n${askRules()}`;
    contents.push({ role: 'user', parts: [{ text: qText }] });
    maxTokens = 6144;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:streamGenerateContent?alt=sse`;
  const upstream = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
    body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 } })
  });
  if (!upstream.ok) {
    const t = await upstream.text().catch(() => '');
    console.error('Gemini error', upstream.status, t);
    const msg = upstream.status === 429 ? 'Đã hết lượt miễn phí hôm nay. Dùng nút "Sao chép lời nhắc" để luận giải ở nơi khác.'
      : upstream.status === 404 ? 'Tên model không đúng, kiểm tra GEMINI_MODEL.'
      : (upstream.status === 400 || upstream.status === 403) ? 'API key không hợp lệ hoặc chưa được bật, kiểm tra GEMINI_API_KEY.'
      : 'AI đang bận hoặc lỗi, thử lại sau.';
    return res.status(502).json({ error: msg });
  }

  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no' });
  const reader = upstream.body.getReader();
  const dec = new TextDecoder();
  let buf = '', wrote = false;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true }).replace(/\r\n/g, '\n');
      let i;
      while ((i = buf.indexOf('\n\n')) >= 0) {
        const chunk = buf.slice(0, i); buf = buf.slice(i + 2);
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data:')) continue;
          let ev; try { ev = JSON.parse(line.slice(5)); } catch { continue; }
          const parts = ev.candidates?.[0]?.content?.parts || [];
          for (const p of parts) if (p.text && !p.thought) { res.write(p.text); wrote = true; }
          if (ev.error) res.write('\u0000ERR:AI bị gián đoạn, thử lại sau.');
        }
      }
    }
  } catch (e) {
    res.write('\u0000ERR:Kết nối tới AI bị ngắt.');
  }
  if (wrote && !owner) list.push(now); // chỉ tính lượt khi đã có câu trả lời
  res.end();
}
