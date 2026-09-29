# Yoga Anatomy 3D

Ứng dụng web 3D dành cho **giáo viên yoga**: khám phá xương, cơ, khớp và xem các asana
chuyển động với các cơ được tác động được tô sáng theo thời gian thực.

## Tính năng

### Giải phẫu
- **17 nhóm xương, 33 cơ/nhóm cơ, 14 khớp** – nhấp trên mô hình hoặc chọn trong danh sách.
- Bật/tắt từng lớp (xương, cơ, khớp), chỉnh độ trong suốt của cơ.
- Mỗi mục có: nguyên uỷ – bám tận – chức năng (cơ), mốc giải phẫu (xương),
  loại khớp & biên độ vận động (khớp) và phần **Ứng dụng trong yoga**.
- Cơ hiển thị danh sách các asana nơi cơ đó co, được kéo giãn hoặc ổn định.
- Tìm kiếm không dấu (vd: `gan kheo`, `hang`).

### Asana 3D
- 22 asana + 2 chuỗi động tác (**Mèo – Bò**, **Chào mặt trời A**), mỗi tư thế có chuyển động
  đi vào – giữ – trở ra.
- Cơ được tô màu theo vai trò: **co cơ** (đỏ, nhấp nháy), **kéo giãn** (xanh), **ổn định** (vàng).
- Chế độ **"Theo độ dài"**: màu tính trực tiếp từ độ dài cơ so với Tadasana – cơ ngắn lại chuyển đỏ,
  cơ dài ra chuyển xanh. Mỗi cơ hiển thị % thay đổi độ dài trực tiếp.
- Khớp chính của tư thế được làm nổi bật; cue hướng dẫn, lợi ích, lưu ý & chống chỉ định.
- Trình phát: phát/dừng, tua, tốc độ, "Giữ tư thế"; chế độ **Trình chiếu** để chiếu cho lớp.

### Cơ sinh học (tải trọng tĩnh)
Trong chế độ Asana, mỗi tư thế được phân tích cân bằng tĩnh trực tiếp trên mô hình:
- **Trọng tâm & chân đế**: trọng tâm cơ thể (chấm tím, dây dọi xuống sàn) và đa giác chân đế;
  **biên ổn định** = khoảng cách từ hình chiếu trọng tâm tới mép chân đế.
- **Phân bố trọng lượng** lên từng bàn tay / bàn chân / gối… và mũi tên **lực đỡ từ sàn** (3 chiều).
- **Tải khớp**: mô-men mà nhóm cơ phải tạo ra ở mỗi khớp (N·m) và nhóm cơ đó
  (vd. "Khớp gối trái 79 N·m → cơ duỗi gối (tứ đầu)" trong Chiến binh II).
  Rê chuột lên một dòng để tô các cơ tương ứng; chế độ tô màu **"Theo tải"** tô cả cơ thể.
- **Biến thể & so sánh**: Plank / Chaturanga hạ gối, Chó úp mặt chùng gối, Cái ghế nông, … với bảng
  so sánh tải giữa các biến thể.
- Nhập **cân nặng** và **tỷ lệ cơ thể nam/nữ**; bật/tắt **ma sát với thảm**.

Phương pháp:
1. Khối lượng & trọng tâm 14 đoạn cơ thể theo de Leva (1996), *J Biomech* 29(9):1223–1230.
2. Mỗi tư thế được **cân bằng tự động** (chiến lược cổ chân): nếu trọng tâm nằm ngoài bàn chân,
   cả cơ thể được nghiêng quanh bàn chân (giữ bàn chân áp sàn) cho tới khi trọng tâm nằm trên chân đế.
3. Lực đỡ thẳng đứng: nghiệm cân bằng ΣF = 0, ΣM = 0 (chuẩn cực tiểu có trọng số khi có nhiều điểm tựa,
   không cho điểm tựa "kéo" sàn).
4. Lực ma sát: chọn sao cho tổng bình phương mô-men khớp (chuẩn hoá theo sức mạnh từng khớp) nhỏ nhất,
   trong nón ma sát μ = 0,8 — bài toán bình phương tối thiểu có ràng buộc, giải bằng hệ KKT.
5. Mô-men khớp: tĩnh học ngược trên phần cơ thể phía xa khớp (trọng lực + lực sàn).

Giới hạn: chỉ tính tư thế giữ yên (không tính lực quán tính khi chuyển động); chưa tính dây chằng, mô mềm
và tiếp xúc giữa các phần cơ thể (vd. đùi tựa lên bắp chân trong Balasana); tải hiển thị là mức tối thiểu
khi người tập đẩy sàn khéo léo. Dùng để **so sánh xu hướng**, không phải số đo lâm sàng.

### Mô hình từ xương & cơ thật (BodyParts3D)
Toàn bộ khung xương (117 bộ phận: sọ, từng đốt sống, 24 xương sườn, xương cổ tay, đốt ngón…)
và đường đi của 33 cơ được dựng từ **BodyParts3D** (dữ liệu chụp cơ thể người thật, nam, cao 1,64 m)
bằng `tools/bp3d-build.mjs`:
- **Tâm khớp tính từ bề mặt xương**: mặt cầu bình phương tối thiểu trên chỏm xương đùi (r 23 mm,
  sai số 0,7 mm; kiểm chứng với ổ cối: lệch 1,5 mm) và chỏm xương cánh tay (r 21,5 mm; lệch ổ chảo 2,9 mm);
  mặt cầu hai lồi cầu đùi → trục gối; trung điểm hai mắt cá / hai mỏm trên lồi cầu / hai mỏm trâm → cổ chân,
  khuỷu, cổ tay; tâm đĩa đệm L5/S1, T12/L1, C7/T1 → các khớp cột sống.
- **Điểm bám cơ** = nơi mesh cơ chạm mesh xương nguyên uỷ / bám tận; **đường đi** = trọng tâm các lát
  cắt ngang của mesh cơ; **độ dày bụng cơ** = bán kính trung bình các lát cắt. Cơ nhiều đầu / hình quạt
  (cơ delta, cơ ngực lớn, cơ thang, gân kheo, cơ khép, cơ lưng rộng…) được tách thành nhiều bó.
- **Điểm chạm sàn** (gót, ụ đốt bàn chân, ụ ngồi, mông, bụng, bả vai…) và **mốc nhân trắc** cho lớp
  cơ sinh học cũng lấy từ bề mặt xương / cơ.
- Cánh tay được xoay quanh tâm vai cho thẳng đứng (tư thế trung tính của khung xương); bên phải là ảnh
  gương của bên trái. Mesh xương giảm từ 1,13 triệu còn 124 nghìn tam giác (1,1 MB).

### Phím tắt
| Phím | Chức năng |
| --- | --- |
| `Space` | Phát / dừng chuyển động |
| `←` / `→` | Bước trước / sau |
| `P` | Chế độ trình chiếu |
| `Esc` | Bỏ chọn |

Liên kết có thể chia sẻ: `#asana/adho_mukha_svanasana`, `#muscle/hamstrings`, `#bone/pelvis`, `#joint/hip`.

## Chạy dự án

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # xuất bản tĩnh vào dist/ (dùng được trên GitHub Pages / Netlify / Vercel)
npm run check      # kiểm tra vật lý mọi tư thế (cân bằng lực, trọng tâm, tiếp đất, đối xứng)
npm run fit-poses  # tự chỉnh góc khớp để đúng bộ phận chạm sàn (ghi vào src/data/poses.js)
npm run build-model -- <thư mục BodyParts3D_data>  # dựng lại khung xương, cơ, mốc từ BodyParts3D
```

## Cấu trúc

```
src/
  anatomy/rig.js            Khung xương khớp (FK), quy ước góc khớp, tiếp đất
  anatomy/muscles.js        Cơ dạng ống bám theo xương: tự dài/ngắn/phình theo tư thế
  anatomy/animator.js       Nội suy tư thế (quaternion), neo tay/chân trên sàn
  anatomy/physics.js        Trọng tâm, chân đế, lực sàn (có ma sát), mô-men khớp, tự cân bằng
  anatomy/bp3d.js           Nạp mesh xương (public/models/bp3d/skeleton.bin)
  data/body-model.gen.js    Tâm khớp, điểm bám & đường đi cơ, điểm chạm sàn, mốc (sinh tự động)
  data/anthropometry.js     Khối lượng / trọng tâm đoạn cơ thể (de Leva 1996)
tools/                      bp3d-build, fit-poses, check-physics
  data/poses.js             Góc khớp của từng tư thế
  data/asanas.js            Asana: chuỗi chuyển động, vai trò cơ, cue, lưu ý
  data/{bones,muscles,joints}.js  Nội dung giải phẫu tiếng Việt
```

### Thêm một asana mới
1. Khai báo góc khớp trong `src/data/poses.js` (độ; xem chú thích `semanticToQuat` trong `rig.js`
   về dấu của từng góc – vd. `hip: { flex, abd, rot }`, `knee: { flex }`), thêm mục `POSE_FIT`
   (bộ phận phải chạm sàn + góc được phép chỉnh) rồi chạy `npm run fit-poses` và `npm run check`.
2. Thêm mục trong `src/data/asanas.js` với `steps` (tư thế bắt đầu → tư thế đích, `anchor` là khớp
   giữ cố định trên sàn) và `roles` (`contract` / `stretch` / `stabilize`; thêm hậu tố `_L`/`_R`
   cho cơ một bên).

## Giấy phép & ghi nguồn
- Mã nguồn của dự án này.
- Mô hình xương trong `public/models/bp3d/` và dữ liệu giải phẫu trong `src/data/body-model.gen.js`: **BodyParts3D, © The Database Center for Life Science,
  licensed under CC Attribution-Share Alike 2.1 Japan** (qua bản STL của
  [Kevin-Mattheus-Moerman/BodyParts3D](https://github.com/Kevin-Mattheus-Moerman/BodyParts3D)).
  Các dữ liệu dẫn xuất được phân phối theo cùng giấy phép CC BY-SA 2.1 JP — xem `public/models/bp3d/LICENSE.txt`.

> Mô hình là mô hình giáo dục đã được đơn giản hoá (cơ biểu diễn bằng các bó sợi),
> không thay thế tài liệu giải phẫu chuyên sâu hay tư vấn y khoa.
