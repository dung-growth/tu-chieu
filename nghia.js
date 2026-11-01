/* Tứ Chiếu — từ điển nghĩa ngắn cho khung "bấm vào xem nghĩa".
   Viết theo cách hiểu phổ biến, giọng gợi mở; mỗi mục 1–2 câu. */
const NGHIA = {
  // Tử vi: 12 cung
  palace: {
    'Mệnh': 'Con người bạn: tính cách, năng lực, cách bạn đi qua cuộc đời. Cung quan trọng nhất, luôn đọc cùng ba cung tam hợp và cung xung chiếu.',
    'Huynh Đệ': 'Anh chị em, và rộng hơn là bạn bè ngang hàng, đồng nghiệp cùng cấp.',
    'Phu Thê': 'Vợ chồng, người yêu, và cả các mối quan hệ một-một như đối tác làm ăn.',
    'Tử Nữ': 'Con cái, học trò, cấp dưới; cũng là "đứa con tinh thần": sản phẩm, dự án bạn tạo ra.',
    'Tài Bạch': 'Tiền bạc: cách kiếm, cách tiêu, khả năng giữ tiền.',
    'Tật Ách': 'Sức khỏe, thể chất và những điều dồn nén bên trong.',
    'Thiên Di': 'Ra ngoài: đi xa, môi trường xã hội, cách người ngoài nhìn bạn, cơ hội đến từ bên ngoài. Chiếu thẳng vào Mệnh.',
    'Nô Bộc': 'Bạn bè, cộng sự, người giúp việc, khách hàng: những người đi cùng bạn nhưng không phải ruột thịt.',
    'Quan Lộc': 'Sự nghiệp, công việc, cách bạn làm việc và tiến thân.',
    'Điền Trạch': 'Nhà cửa, đất đai, tài sản cố định, nơi ở; cũng là "kho" giữ của.',
    'Phúc Đức': 'Phúc phần dòng họ, đời sống tinh thần, tuổi thọ, điều làm bạn thấy bình yên.',
    'Phụ Mẫu': 'Cha mẹ, cấp trên, người có quyền với bạn; cũng liên quan giấy tờ, học vấn.'
  },
  // Tử vi: phụ tinh và sao nhỏ (14 chính tinh lấy từ TVC.STAR)
  star: {
    'Tả Phù': 'Sao trợ lực: được người giúp, làm việc nhóm tốt.', 'Hữu Bật': 'Sao trợ lực: có người phò tá, giao thiệp rộng.',
    'Văn Xương': 'Sao văn chương: học hành, chữ nghĩa, giấy tờ, thi cử.', 'Văn Khúc': 'Sao văn nghệ: ăn nói, tài năng mềm, nghệ thuật.',
    'Thiên Khôi': 'Quý nhân ban ngày: được người trên nâng đỡ, thuận thi cử, thăng tiến.', 'Thiên Việt': 'Quý nhân ban đêm: người giúp âm thầm, cơ hội bất ngờ.',
    'Lộc Tồn': 'Sao lộc: có của ăn, biết giữ của, cẩn trọng.', 'Thiên Mã': 'Sao di chuyển: đi lại, thay đổi, năng động; gặp Lộc thì đi xa mà phát.',
    'Kình Dương': 'Sát tinh cương: quyết đoán, dám cắt; đắc địa thì dũng, không đắc thì nóng, dễ va chạm.', 'Đà La': 'Sát tinh âm: lì, dây dưa, nghĩ nhiều; được cái bền.',
    'Hỏa Tinh': 'Sát tinh nóng: bộc phát, nhanh, nóng nảy.', 'Linh Tinh': 'Sát tinh âm ỉ: lo âu ngầm, bực bội trong lòng.',
    'Địa Không': 'Sao "không": nghĩ khác người, lý tưởng; tiền dễ hao vì những thứ không thực.', 'Địa Kiếp': 'Sao "kiếp": biến động, mất mát bất ngờ; hợp nghề sáng tạo, rủi ro cao.',
    'Hóa Lộc': 'Hóa Lộc: lộc, tiền, cơ hội, được lòng người ở nơi nó đậu.', 'Hóa Quyền': 'Hóa Quyền: quyền lực, tiếng nói, sự chủ động.',
    'Hóa Khoa': 'Hóa Khoa: danh tiếng, học vấn, được giúp đỡ, giải nguy.', 'Hóa Kỵ': 'Hóa Kỵ: vướng mắc, ám ảnh, chuyện phải làm đi làm lại.',
    'Hồng Loan': 'Sao hỷ sự: duyên tình cảm, cưới hỏi.', 'Thiên Hỷ': 'Sao vui: tin vui, hỷ sự.', 'Thiên Diêu': 'Sao đào hoa: duyên, sức hút; cũng là mê đắm.',
    'Hàm Trì': 'Đào hoa: dễ được để ý, chuyện tình cảm.', 'Thiên Hình': 'Sao hình: kỷ luật, pháp luật, dao kéo; hợp nghề y, luật, quân đội.',
    'Thiên Khốc': 'Sao khóc: buồn phiền, lo âu; cũng là giọng nói vang.', 'Thiên Hư': 'Sao hư: hao, trống rỗng, lo lắng không rõ lý do.',
    'Cô Thần': 'Sao cô: tự lập, hay một mình.', 'Quả Tú': 'Sao quả: ít người chia sẻ, tự xoay xở.',
    'Long Trì': 'Sao tài hoa: thẩm mỹ, khéo tay.', 'Phụng Các': 'Sao tài hoa: duyên dáng, có gu.', 'Hoa Cái': 'Sao phong thái: thích riêng tư, hợp nghệ thuật, tôn giáo.',
    'Ân Quang': 'Sao ân: được ơn huệ, người giúp.', 'Thiên Quý': 'Sao quý: được trọng dụng, quý nhân.', 'Tam Thai': 'Sao địa vị: thăng tiến, chỗ đứng.',
    'Bát Tọa': 'Sao địa vị: có chỗ ngồi, được nể.', 'Thiên Quan': 'Sao quý nhân: gặp may về công danh.', 'Thiên Phúc': 'Sao phúc: hưởng phúc, gặp dữ hóa lành.',
    'Giải Thần': 'Sao giải: hóa giải khó khăn.', 'Niên Giải': 'Sao giải: gỡ rối, tháo vướng.', 'Thiên Giải': 'Sao giải: gỡ rối, tháo vướng.',
    'Thiên Không': 'Sao không: mất mát, hụt hẫng; cũng là tư tưởng siêu thoát.', 'Phá Toái': 'Sao phá: đổ vỡ nhỏ, hay sửa đi sửa lại.',
    'Thiên Đức': 'Sao đức: phúc đức, gặp dữ hóa lành.', 'Nguyệt Đức': 'Sao đức: hiền lành, được che chở.', 'Thiên Tài': 'Sao tài năng riêng.',
    'Thiên Thọ': 'Sao thọ: sống lâu, điềm đạm.', 'Thiên Thương': 'Sao thương: tổn thương, buồn phiền ở nơi nó đậu.', 'Thiên Sứ': 'Sao sứ: chuyện phiền, tin không vui.',
    'Âm Sát': 'Sao âm: tiểu nhân ngầm, lo âu.', 'Thiên Trù': 'Sao bếp: ăn uống, hưởng lộc ăn.', 'Phong Cáo': 'Sao danh: bằng cấp, giấy khen.',
    'Đài Phụ': 'Sao phò: người hỗ trợ, địa vị.', 'Thiên Nguyệt': 'Sao bệnh vặt: ốm đau nhẹ.', 'Thiên Vu': 'Sao huyền bí: trực giác, tâm linh.',
    'Không Vong': 'Sao trống: việc dễ dở dang, hụt hẫng.', 'Phi Liêm': 'Sao nhanh: tin đồn, thị phi đến nhanh.', 'Tuần Không': 'Tuần: chặn bớt tác dụng của các sao trong cung, cả tốt lẫn xấu.',
    'Triệt Lộ': 'Triệt: chặn đứng tác dụng các sao trong cung, nặng ở nửa đầu đời.', 'Đào Hoa': 'Đào hoa: duyên, sức hút.'
  },
  bright: { 'Miếu': 'rất sáng, phát huy tốt nhất', 'Vượng': 'sáng, phát huy tốt', 'Đắc': 'khá, phát huy được', 'Lợi': 'tạm ổn', 'Bình': 'trung bình', 'Hạn': 'tối (hãm): cái hay bị giảm, cái dở lộ ra', 'Hãm': 'tối (hãm): cái hay bị giảm, cái dở lộ ra' },
  // Bát tự: thập thần
  god: {
    'Nhật chủ': 'Chính bạn: thiên can trụ ngày, gốc để so mọi thứ khác.',
    'Tỷ Kiên': 'Người ngang hàng cùng cực: tự lập, tự tin, cạnh tranh; anh em, bạn bè.',
    'Kiếp Tài': 'Người ngang hàng khác cực: quyết liệt, dám chơi; dễ hao tiền vì bạn bè, hùn hạp.',
    'Thực Thần': 'Cái bạn tạo ra một cách thoải mái: tài năng, ăn uống, hưởng thụ, sáng tạo nhẹ nhàng.',
    'Thương Quan': 'Cái bạn tạo ra kiểu phá cách: thông minh, nổi loạn, thích thể hiện, dễ va với cấp trên.',
    'Thiên Tài': 'Tiền không đều: kinh doanh, đầu tư, tiền bất ngờ; hào phóng.',
    'Chính Tài': 'Tiền đều đặn: lương, tích lũy, chăm chỉ; với nam còn là vợ.',
    'Thất Sát': 'Áp lực mạnh: thử thách, đối thủ, quyền uy; ép bạn phải mạnh lên.',
    'Chính Quan': 'Khuôn phép: danh dự, chức vị, kỷ luật; với nữ còn là chồng.',
    'Thiên Ấn': 'Học kiểu riêng: trực giác, nghiên cứu, huyền học; hơi cô độc.',
    'Chính Ấn': 'Nguồn nuôi dưỡng: mẹ, thầy, học vấn, người đỡ đầu.'
  },
  truongSinh: {
    'Trường Sinh': 'Mới sinh ra: khởi đầu, có sức sống.', 'Mộc Dục': 'Tắm gội: non nớt, dễ đào hoa, chưa vững.', 'Quan Đới': 'Đội mũ: trưởng thành, chuẩn bị ra đời.',
    'Lâm Quan': 'Ra làm quan: vững vàng, tự lập.', 'Đế Vượng': 'Đỉnh cao: mạnh nhất.', 'Suy': 'Bắt đầu yếu.', 'Bệnh': 'Yếu.', 'Tử': 'Dừng lại.',
    'Mộ': 'Cất giữ: tích tụ, kho.', 'Tuyệt': 'Đứt: hết một vòng.', 'Thai': 'Thụ thai: mầm mới.', 'Dưỡng': 'Nuôi dưỡng: chuẩn bị sinh ra.'
  },
  // Chiêm tinh
  planet: {
    'Sun': 'Mặt Trời: bản ngã, mục đích sống, cách bạn muốn tỏa sáng.', 'Moon': 'Mặt Trăng: cảm xúc, nhu cầu an toàn, phản ứng bản năng.',
    'Mercury': 'Sao Thủy: cách nghĩ, nói, học, giao tiếp.', 'Venus': 'Sao Kim: yêu, gu thẩm mỹ, giá trị, tiền.', 'Mars': 'Sao Hỏa: hành động, ham muốn, cách bạn chiến đấu.',
    'Jupiter': 'Sao Mộc: mở rộng, may mắn, niềm tin, nơi bạn được rộng rãi.', 'Saturn': 'Sao Thổ: kỷ luật, giới hạn, trách nhiệm, bài học dài hạn.',
    'Uranus': 'Thiên Vương: đổi mới, tự do, bất ngờ.', 'Neptune': 'Hải Vương: mơ mộng, trực giác, lý tưởng; cũng là mơ hồ.',
    'Pluto': 'Diêm Vương: chiều sâu, quyền lực, biến đổi tận gốc.', 'Node': 'La Hầu (Bắc Giao): hướng đi đời này nên học và tiến tới.',
    'Lilith': 'Lilith: phần bản năng bị chối bỏ, chỗ bạn không chịu khuất phục.', 'PoF': 'Điểm may mắn: nơi bạn dễ thấy thuận lợi, đủ đầy.'
  },
  sign: {
    'Bạch Dương': 'Lửa, khởi phát: nhanh, thẳng, dám làm trước.', 'Kim Ngưu': 'Đất, kiên định: chắc, bền, trọng vật chất và cái đẹp.', 'Song Tử': 'Khí, linh hoạt: tò mò, nói nhiều, đổi nhanh.',
    'Cự Giải': 'Nước, khởi phát: chăm lo, nhạy cảm, gắn với nhà.', 'Sư Tử': 'Lửa, kiên định: ấm, hào phóng, muốn được ghi nhận.', 'Xử Nữ': 'Đất, linh hoạt: tỉ mỉ, phân tích, phục vụ.',
    'Thiên Bình': 'Khí, khởi phát: cân bằng, hòa nhã, thẩm mỹ.', 'Bọ Cạp': 'Nước, kiên định: sâu, mãnh liệt, kín.', 'Nhân Mã': 'Lửa, linh hoạt: tự do, triết lý, thích đi xa.',
    'Ma Kết': 'Đất, khởi phát: tham vọng, kỷ luật, đường dài.', 'Bảo Bình': 'Khí, kiên định: độc lập, khác người, vì cộng đồng.', 'Song Ngư': 'Nước, linh hoạt: mơ mộng, đồng cảm, dễ hòa tan.'
  },
  house: ['', 'Bản thân, ngoại hình, cách bắt đầu.', 'Tiền, tài sản, giá trị bản thân.', 'Giao tiếp, học, anh chị em, đi gần.', 'Nhà, gia đình, gốc rễ.', 'Sáng tạo, tình yêu, con cái, vui chơi.',
    'Công việc hằng ngày, sức khỏe, thói quen.', 'Hôn nhân, đối tác, người đối diện.', 'Tiền chung, chuyển hóa, tâm lý sâu.', 'Đi xa, học cao, niềm tin.',
    'Sự nghiệp, danh tiếng, vị trí xã hội.', 'Bạn bè, cộng đồng, ước mơ.', 'Thế giới bên trong, tâm linh, điều ẩn.'],
  num: { 1: 'Độc lập, khởi xướng, dẫn đầu.', 2: 'Hợp tác, tinh tế, hòa giải.', 3: 'Sáng tạo, biểu đạt, vui vẻ.', 4: 'Kỷ luật, xây nền, thực tế.', 5: 'Tự do, thay đổi, trải nghiệm.',
    6: 'Trách nhiệm, chăm lo, gia đình.', 7: 'Chiêm nghiệm, chiều sâu, tìm sự thật.', 8: 'Quản trị, vật chất, quyền lực.', 9: 'Nhân văn, bao dung, khép lại.',
    10: 'Tiên phong, tự lập (số 1 ở tầng cao hơn).', 11: 'Trực giác, truyền cảm hứng (số chủ đạo).', 22: 'Kiến tạo lớn (số chủ đạo).', 33: 'Chữa lành, cống hiến (số chủ đạo).', 0: 'Không có thử thách lớn ở chặng này.' }
};
if (typeof module !== 'undefined') module.exports = NGHIA;
