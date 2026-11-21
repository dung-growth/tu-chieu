# Bật đăng nhập cho Tứ Chiếu

Làm một lần, khoảng 20–30 phút. Không dán khóa nào vào chat hay vào code: khóa chỉ nằm trong Supabase và Vercel.

## 1. Tạo dự án Supabase

1. Vào supabase.com, đăng nhập, bấm **New project**. Region chọn khu vực châu Á gần Việt Nam (Tứ Chiếu đang dùng **Southeast Asia (Singapore)**). Đổi region thì sửa lại dòng Supabase trong `chinh-sach-bao-mat.html`.
2. Mở **SQL Editor**, dán toàn bộ file `supabase/schema.sql`, bấm **Run**. Lệnh này tạo bảng lưu lá số, bảng lưu thời điểm đồng ý chính sách, hàm cho người dùng tự xóa tài khoản, và khóa quyền: mỗi người chỉ đọc, sửa được dữ liệu của chính mình. Chạy lại nhiều lần cũng không sao.
3. Mở **Project Settings → API** (hoặc **API Keys**), chép hai thứ:
   - **Project URL** (dạng `https://xxxx.supabase.co`)
   - Khóa **anon** hoặc **publishable**. KHÔNG lấy khóa `service_role` hay `secret`.

## 2. Dán vào Vercel

Vercel → dự án tu-chieu → **Settings → Environment Variables**, thêm:

| Tên | Giá trị |
|---|---|
| `SUPABASE_URL` | Project URL ở trên |
| `SUPABASE_ANON_KEY` | khóa anon/publishable ở trên |

Lưu xong bấm **Redeploy** để web nhận biến mới.

## 3. Cho phép quay về web sau khi đăng nhập

Supabase → **Authentication → URL Configuration**:

- **Site URL**: `https://tu-chieu.vercel.app`
- **Redirect URLs**: thêm `https://tu-chieu.vercel.app/**`

## 4. Đăng nhập bằng Google

1. Supabase → **Authentication → Sign In / Providers → Google**. Chép dòng **Callback URL** (dạng `https://xxxx.supabase.co/auth/v1/callback`).
2. Vào console.cloud.google.com, tạo một project mới tên Tứ Chiếu.
3. **Google Auth Platform** (hoặc **APIs & Services → OAuth consent screen**): chọn **External**, tên ứng dụng "Tứ Chiếu", email hỗ trợ là tuchieusupport@gmail.com. Điền thêm:
   - Trang chủ: `https://tu-chieu.vercel.app`
   - Chính sách bảo mật: `https://tu-chieu.vercel.app/chinh-sach-bao-mat.html`
   - Điều khoản: `https://tu-chieu.vercel.app/dieu-khoan.html`
4. **Clients → Create client** (hoặc **Credentials → Create OAuth client ID**): loại **Web application**.
   - Authorized JavaScript origins: `https://tu-chieu.vercel.app`
   - Authorized redirect URIs: dán Callback URL ở bước 1.
5. Google đưa **Client ID** và **Client secret**. Dán cả hai vào trang Google provider trong Supabase, bật **Enable**, Save.
6. Nếu Google để app ở chế độ **Testing**, chỉ email được thêm vào danh sách test mới đăng nhập được. Khi muốn mở cho mọi người thì bấm **Publish app**.

## 5. Email nhận link

- Supabase có sẵn dịch vụ gửi mail nhưng giới hạn rất thấp, chỉ đủ để thử. Khi mở cho người dùng thật, vào **Authentication → Emails → SMTP Settings** để nối một dịch vụ gửi mail (ví dụ Resend, Brevo).
- Đổi mẫu email sang tiếng Việt: **Authentication → Emails → Templates → Magic Link**:
  - Subject: `Link đăng nhập Tứ Chiếu`
  - Body:
    ```html
    <p>Chào bạn,</p>
    <p>Bấm vào link dưới đây để đăng nhập Tứ Chiếu. Link chỉ dùng được một lần.</p>
    <p><a href="{{ .ConfirmationURL }}">Đăng nhập Tứ Chiếu</a></p>
    <p>Nếu bạn không yêu cầu, cứ bỏ qua email này.</p>
    ```

## Thử

Mở web, bấm **Đăng nhập**, chọn Google. Vào được thì lập một lá số, bấm vào ảnh đại diện góc trên: lá số phải nằm trong "Lá số đã lưu". Mở web trên điện thoại, đăng nhập cùng tài khoản: lá số gần nhất tự mở ra.

Chưa làm các bước trên thì web vẫn chạy bình thường, nút Đăng nhập chỉ báo "Đăng nhập sắp mở".
