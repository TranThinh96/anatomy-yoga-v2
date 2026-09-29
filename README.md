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

### Xương thật (BodyParts3D) — thử nghiệm vùng chậu – đùi
Xương chậu, xương cùng, xương đùi và xương bánh chè được thay bằng mô hình từ **BodyParts3D**
(dữ liệu chụp cơ thể người thật). Công cụ `tools/bp3d-import.mjs`:
- fit **mặt cầu bình phương tối thiểu** vào chỏm xương đùi → tâm khớp háng (bán kính 23 mm,
  sai số RMS 0,7 mm); kiểm chứng bằng mặt cầu ổ cối trên xương chậu (lệch 1,2–1,5 mm);
- fit mặt cầu vào hai lồi cầu sau → trục gập gối;
- co giãn đồng dạng + đặt khớp vào khung xương, giảm đa giác (4,5 MB → 280 KB), lượng tử hoá 16 bit.

Bật/tắt ở mục **Lớp hiển thị → Xương thật vùng chậu – đùi**.

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
npm run import-bp3d -- <thư mục STL BodyParts3D>   # tạo lại public/models/bp3d/
```

## Cấu trúc

```
src/
  anatomy/rig.js            Khung xương khớp (FK), quy ước góc khớp, tiếp đất
  anatomy/skeleton.js       Mô hình xương dựng bằng hình học thủ tục
  anatomy/muscleGeometry.js Đường đi của từng cơ (nguyên uỷ → điểm vòng → bám tận)
  anatomy/muscles.js        Cơ dạng ống bám theo xương: tự dài/ngắn/phình theo tư thế
  anatomy/animator.js       Nội suy tư thế (quaternion), neo tay/chân trên sàn
  anatomy/physics.js        Trọng tâm, chân đế, lực sàn (có ma sát), mô-men khớp, tự cân bằng
  anatomy/bp3d.js           Nạp xương BodyParts3D
  data/anthropometry.js     Khối lượng / trọng tâm đoạn cơ thể (de Leva 1996)
tools/                      fit-poses, check-physics, bp3d-import
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
- Mô hình xương trong `public/models/bp3d/`: **BodyParts3D, © The Database Center for Life Science,
  licensed under CC Attribution-Share Alike 2.1 Japan** (qua bản STL của
  [Kevin-Mattheus-Moerman/BodyParts3D](https://github.com/Kevin-Mattheus-Moerman/BodyParts3D)).
  Các mesh đã chỉnh sửa được phân phối theo cùng giấy phép CC BY-SA 2.1 JP — xem `public/models/bp3d/LICENSE.txt`.

> Mô hình là mô hình giáo dục đã được đơn giản hoá (cơ biểu diễn bằng các bó sợi),
> không thay thế tài liệu giải phẫu chuyên sâu hay tư vấn y khoa.
