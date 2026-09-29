# Tứ Chiếu

Lập cùng lúc Bát tự, Bản đồ sao, Tử vi, Thần số học từ ngày giờ sinh, rồi để AI (Gemini, gói miễn phí) viết bài luận đối chiếu các trường phái.

## Cấu trúc

```
index.html          giao diện + code trang
compute.js          tính toán 4 trường phái (chạy trên trình duyệt người dùng)
prompt.js           bộ hướng dẫn luận giải, dùng chung cho máy chủ và nút "Sao chép lời nhắc"
lib/                thư viện: lunar-javascript, astronomy-engine, iztro, marked, DOMPurify
api/luangiai.js     hàm máy chủ trên Vercel: giữ API key, gọi Gemini, trả bài luận về
package.json
```

Phần lập lá số chạy hoàn toàn trên trình duyệt. Chỉ phần AI đi qua `api/luangiai.js`. Họ tên không bao giờ được gửi đi.

## Đưa lên mạng (miễn phí)

1. **API key Gemini:** vào https://aistudio.google.com, đăng nhập Google, bấm **Get API key**. Không cần thẻ.
2. **GitHub:** tạo repo (nên để Private) rồi đẩy cả thư mục lên.
   ```bash
   git init && git add . && git commit -m "Tứ Chiếu v1"
   git remote add origin https://github.com/<tên-bạn>/tuchieu.git
   git branch -M main && git push -u origin main
   ```
3. **Vercel:** vào https://vercel.com (gói Hobby miễn phí), bấm **Add New → Project**, chọn repo `tuchieu`. Framework chọn **Other**, không cần lệnh build.
4. **Biến môi trường:** vào **Settings → Environment Variables**. **Chỉ dán API key ở đây, không dán vào code hay gửi cho ai.**

   | Tên | Giá trị | Ghi chú |
   |---|---|---|
   | `GEMINI_API_KEY` | khóa ở bước 1 | bắt buộc |
   | `GEMINI_MODEL` | `gemini-3-flash-preview` | không cần đặt; đổi được nếu Google đổi tên model |
   | `ACCESS_CODE` | một mã tự đặt | nên đặt khi mới thử, để chỉ bạn bè có mã mới dùng AI |
   | `RATE_LIMIT_PER_HOUR` | `8` | số lượt mỗi IP mỗi giờ |

5. **Deploy lại:** vào **Deployments** và bấm **Redeploy**.

Mỗi lần đẩy code mới lên GitHub, Vercel tự deploy lại.

## Giới hạn gói miễn phí

- Gemini 3 Flash khoảng 10 lượt/phút, 1.500 lượt/ngày (tháng 9/2026, Google có thể đổi).
- Ở gói miễn phí, Google có thể dùng nội dung gửi lên để cải thiện model. Trang đã ghi rõ điều này cho người dùng và không gửi họ tên.
- Hết lượt thì người dùng vẫn bấm được **Sao chép lời nhắc** rồi dán vào ChatGPT, Gemini hoặc Claude của họ.
- Sau này muốn chuyển sang trả phí hoặc sang Claude: chỉ cần sửa `api/luangiai.js` và biến môi trường, giao diện giữ nguyên.

## Lưu ý

- Bộ đếm lượt theo IP chỉ tương đối, máy chủ khởi động lại là đếm lại. Mở rộng thì nên chuyển sang Upstash Redis.
- Tử vi an sao theo âm lịch Trung Quốc (thư viện iztro). Vài ngày giáp ranh tháng âm có thể lệch với lịch Việt Nam.
- Người sinh ở miền Nam trước 13/6/1975 được tự tính theo GMT+8.
- Chạy thử trên máy: `npx vercel dev`, với file `.env` chứa `GEMINI_API_KEY=...`. File `.env` đã nằm trong `.gitignore`.
