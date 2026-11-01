# Tứ Chiếu

Lập cùng lúc Bát tự, Bản đồ sao, Tử vi, Thần số học từ ngày giờ sinh, rồi để AI (Gemini, gói miễn phí) viết bài luận đối chiếu các trường phái.

## Cấu trúc

```
index.html          giao diện + code trang
compute.js          tính toán 4 trường phái (chạy trên trình duyệt người dùng)
nghia.js            từ điển nghĩa ngắn cho khung "bấm vào xem nghĩa" (sao, cung, thập thần, hành tinh, con số)
tuvi-cach.js        dò cách Tử vi (Thân cư, Tuần Triệt, Cơ Lương, Sát Phá Tham, Nhật Nguyệt…), đường đi đại hạn kèm tứ hóa, 3 năm tới
iching.js           gieo quẻ Kinh Dịch theo Mai Hoa Dịch Số (năm, tháng, ngày, giờ âm lịch)
prompt.js           bộ hướng dẫn luận giải, dùng chung cho máy chủ và nút "Sao chép lời nhắc"
lib/                thư viện: lunar-javascript, astronomy-engine, iztro, marked, DOMPurify, tz-lookup (tz.js, chỉ tải khi cần)
api/luangiai.js     hàm máy chủ trên Vercel: giữ API key, gọi Gemini (dự phòng: model miễn phí trên OpenRouter), trả bài luận về
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
| `OWNER_CODE` | một mã riêng của chủ trang | nhập vào ô Mã truy cập thì không bị giới hạn lượt; đừng đưa mã này cho ai |
| `OPENROUTER_API_KEY` | khóa tạo ở openrouter.ai → Keys | dự phòng miễn phí khi Gemini hết lượt hoặc lỗi |
| `OPENROUTER_MODELS` | `google/gemma-4-31b-it:free,nvidia/nemotron-3-super-120b-a12b:free` | không cần đặt; thứ tự model dự phòng, model nào bị gỡ thì sửa ở đây |
| `AI_ORDER` | `gemini` | đặt `openrouter` nếu muốn dùng OpenRouter trước Gemini |

5. **Deploy lại:** vào **Deployments** và bấm **Redeploy**.

Mỗi lần đẩy code mới lên GitHub, Vercel tự deploy lại.

## Giới hạn gói miễn phí

- Thứ tự gọi AI: Gemini → Gemma 4 31B → Nemotron 3 Super. Nguồn trước hết lượt, lỗi hoặc 25 giây chưa có chữ thì tự chuyển. Câu trả lời từ model dự phòng có dòng nhỏ "Trả lời bởi …". Danh sách model miễn phí trên OpenRouter thay đổi thường xuyên.

- Gemini 3 Flash khoảng 10 lượt/phút, 1.500 lượt/ngày (tháng 9/2026, Google có thể đổi).
- Ở gói miễn phí, Google có thể dùng nội dung gửi lên để cải thiện model. Trang đã ghi rõ điều này cho người dùng và không gửi họ tên.
- Hết lượt thì người dùng vẫn bấm được **Sao chép lời nhắc** rồi dán vào ChatGPT, Gemini hoặc Claude của họ.
- Sau này muốn chuyển sang trả phí hoặc sang Claude: chỉ cần sửa `api/luangiai.js` và biến môi trường, giao diện giữ nguyên.

## Lưu ý

- Gieo quẻ: nút **☯ Gieo quẻ cho câu này** trong khung hỏi thêm. Quẻ lập theo thời điểm bấm (Mai Hoa: quẻ trên = (năm+tháng+ngày) chia 8 lấy dư; quẻ dưới = cộng thêm giờ, chia 8; hào động = chia 6). Mỗi câu hỏi chỉ gieo một lần mỗi ngày trên một trình duyệt; hỏi lại thì hiện quẻ và bài luận cũ, không tốn lượt AI.

- Không rõ giờ sinh: tick **Không rõ giờ sinh**. Biết canh giờ thì chọn thêm canh giờ, khi đó Bát tự và Tử vi tính đủ, còn cung Mọc chỉ là ước lượng. Không biết gì thì chỉ còn Thần số học, Bát tự 3 trụ và vị trí các sao (tính theo 12 giờ trưa).

- Bộ đếm lượt theo IP chỉ tương đối, máy chủ khởi động lại là đếm lại. Chỉ câu AI trả lời được mới bị tính lượt; câu bị từ chối được gỡ khỏi khung chat và trả lại ô nhập. Mở rộng thì nên chuyển sang Upstash Redis.
- Tử vi an sao theo âm lịch Trung Quốc (thư viện iztro). Vài ngày giáp ranh tháng âm có thể lệch với lịch Việt Nam.
- Người sinh ở miền Nam trước 13/6/1975 được tự tính theo GMT+8.
- Nơi sinh: ô tìm kiếm khớp sẵn 63 tỉnh, thành (tên cũ, trước sáp nhập 7/2025) và vài thành phố nước ngoài. Không có trong danh sách thì bấm "Tìm … trên bản đồ": trang hỏi OpenStreetMap (Nominatim, miễn phí, chỉ gọi khi người dùng bấm, tối đa 1 lượt/giây, có ghi nguồn). Nơi ở nước ngoài được tự tính múi giờ đúng ngày giờ sinh, gồm cả giờ mùa hè (tz-lookup + lịch múi giờ của trình duyệt). Nơi ở Việt Nam vẫn theo quy tắc GMT+7 / GMT+8 hai miền.
- Chạy thử trên máy: `npx vercel dev`, với file `.env` chứa `GEMINI_API_KEY=...`. File `.env` đã nằm trong `.gitignore`.
