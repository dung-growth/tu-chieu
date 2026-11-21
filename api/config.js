// GET /api/config: cấu hình công khai cho trình duyệt.
// SUPABASE_URL và SUPABASE_ANON_KEY (khóa "anon"/"publishable") đặt trên Vercel → Environment Variables.
// Khóa anon được phép lộ ra trình duyệt; quyền đọc ghi đã khóa bằng Row Level Security trong supabase/schema.sql.
// TUYỆT ĐỐI không đặt khóa service_role vào đây.
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=300');
  const url = process.env.SUPABASE_URL || '', anon = process.env.SUPABASE_ANON_KEY || '';
  res.status(200).json(url && anon ? { supabaseUrl: url, supabaseAnon: anon } : {});
}
