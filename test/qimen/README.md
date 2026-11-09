# Kiểm thử engine Kỳ Môn (`qimen.js`)

Chạy tất cả: `npm run test:qimen`. Lệnh này không cần mạng và không cần Python, vì kết quả tham chiếu đã lưu sẵn trong `kinqimen-out.json`.

## Phương pháp của engine

Thời gia Kỳ Môn, định cục **Sách bổ (拆補)**, **chuyển bàn**, **Thiên Cầm ký Khôn**, giờ **Việt Nam UTC+7**. Mười hai quy tắc được ghi ở đầu `qimen.js`. Những điểm dễ sai:

- Trụ ngày đổi lúc **23:00**: giờ Tý sớm tính vào ngày hôm sau. Trụ giờ suy theo can ngày đó (Ngũ Thử Độn).
- Tiết khí so theo **thời điểm tuyệt đối**. Giờ giao tiết khí lấy từ lunar-javascript (tính theo giờ Bắc Kinh), rồi đổi sang múi giờ của bàn.
- Phù đầu là ngày Giáp hoặc Kỷ gần nhất. Không xét siêu thần, tiếp khí, vì đó là phương pháp Trí nhuận, không thuộc Sách bổ.
- Cung 5 không có sao, cửa, thần riêng:
  - Trực phù hoặc Trực sử rơi vào cung 5 thì gửi sang Khôn 2.
  - Tuần thủ ở cung 5 thì Trực phù là Thiên Cầm (đi cùng Thiên Nhuế), Trực sử là Tử môn.
  - Can địa bàn cung 5 gửi ở Khôn và đi theo Thiên Nhuế trên thiên bàn.

## Ba lớp kiểm thử

| File | Nội dung | Kết quả |
|---|---|---|
| `hand.cjs` + `hand-cases.json` | 10 bàn tính tay theo quy tắc, giờ Việt Nam, phủ các trường hợp đặc biệt: tuần thủ ở cung giữa, can giờ ở cung giữa, Trực sử đếm tới cung giữa, giờ Giáp, Âm/Dương độn, 23:10 cuối tháng, 00:30, 7 phút trước và 13 phút sau giờ giao Lập xuân theo giờ Việt Nam | **10/10 khớp toàn bộ** |
| `invariants.cjs` | 2.000 thời điểm ngẫu nhiên. Kiểm: đủ 8 sao, 8 cửa, 8 thần, 9 can; can thiên bàn đi theo sao; Trực phù, Trực sử đúng cung; vòng sao và cửa giữ thứ tự; bát thần đúng chiều; Mậu ở cung số cục; cùng giờ đồng hồ ở UTC+7 và UTC+8 cho cùng bàn khi không có giờ giao tiết khí xen giữa; đổi ngày lúc 23:00 | **0 lỗi** |
| `compare.cjs` | So với **kinqimen 0.0.6.6** (Python, MIT, Ken Tang; chạy với đúng `sxtwl 2.0.6`, `ephem 4.1.3` mà gói yêu cầu) trên **496 thời điểm**: 320 ngẫu nhiên 1950–2049, 116 thời điểm cách giờ giao tiết khí 7 phút (trước và sau), 60 thời điểm giờ Tý (23h, 0h, ngày cuối tháng). So 15 thành phần: trụ ngày, trụ giờ, độn, nguyên, cục, tiết khí, Trực phù, Trực sử, địa bàn, thiên bàn, cửu tinh, bát môn, bát thần, không vong, dịch mã | **491/496 khớp toàn bộ**, 5 ca lệch đều đã giải thích (bên dưới) |

Do kinqimen tính theo giờ Bắc Kinh, `compare.cjs` gọi engine với `tz = 8` để hai bên so đúng cùng một thời điểm. Bản chạy trên trang dùng `tz = 7`.

## Các ca lệch và nguyên nhân

1. **80 ca chỉ khác cách ghi, không khác bàn**: khi can giờ nằm ở cung giữa, kinqimen ghi cung Trực phù là "中" nhưng vẫn đặt sao ở Khôn. Engine ghi luôn là cung 2. Bộ so sánh đã quy đổi nên các ca này tính là khớp.
2. **4 ca: lỗi phía kinqimen.** Thiên bàn của kinqimen không khớp với vị trí sao của chính nó: can ở mỗi cung không phải can địa bàn của cung gốc của sao đang đứng đó. Lỗi nằm trong nhánh xử lý riêng của `pan_sky` khi can giờ ở cung giữa. Cả 4 ca có cửu tinh, bát môn, bát thần, Trực phù, Trực sử khớp hoàn toàn với engine. Engine giữ quy tắc chuyển bàn (can đi theo sao), và `invariants.cjs` kiểm quy tắc này trên 2.000 bàn.
   Các ca: 1966-09-01 16:04, 2025-06-21 10:35, 2026-09-01 16:40, 2041-11-22 06:56 (giờ UTC+8).
3. **1 ca: sát giờ giao tiết khí, cách dưới 1 phút.** Lúc 2026-05-21 08:36 (UTC+8), kinqimen cho là đã sang Tiểu mãn; engine cho là còn Lập hạ. Giờ giao Tiểu mãn theo lunar-javascript là 08:36:45, theo astronomy-engine là 08:37:17. Cả hai đều sau 08:36, nên engine đúng. kinqimen tính giờ giao sớm hơn vài chục giây.

**Giới hạn đã biết**: giờ giao tiết khí chính xác trong khoảng ±1 phút. Ai sinh hoặc hỏi đúng trong phút giao tiết khí thì cục có thể khác so với app khác.

## Tạo lại dữ liệu tham chiếu (khi cần)

```bash
python3.11 -m venv kq && kq/bin/pip install ephem==4.1.3 sxtwl==2.0.6 && kq/bin/pip install --no-deps kinqimen==0.0.6.6
node test/qimen/gen-times.cjs lib/lunar.js   # in ra {times, tags}, tách thành times.json và tags.json
kq/bin/python test/qimen/kinqimen_ref.py test/qimen/times.json test/qimen/kinqimen-out.json   # khoảng 15 phút
```

kinqimen chỉ dùng trong kiểm thử, **không** có trong bản chạy trên trang.
