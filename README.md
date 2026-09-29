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
npm run dev      # http://localhost:5173
npm run build    # xuất bản tĩnh vào dist/ (dùng được trên GitHub Pages / Netlify / Vercel)
```

## Cấu trúc

```
src/
  anatomy/rig.js            Khung xương khớp (FK), quy ước góc khớp, tiếp đất
  anatomy/skeleton.js       Mô hình xương dựng bằng hình học thủ tục
  anatomy/muscleGeometry.js Đường đi của từng cơ (nguyên uỷ → điểm vòng → bám tận)
  anatomy/muscles.js        Cơ dạng ống bám theo xương: tự dài/ngắn/phình theo tư thế
  anatomy/animator.js       Nội suy tư thế (quaternion), neo tay/chân trên sàn
  data/poses.js             Góc khớp của từng tư thế
  data/asanas.js            Asana: chuỗi chuyển động, vai trò cơ, cue, lưu ý
  data/{bones,muscles,joints}.js  Nội dung giải phẫu tiếng Việt
```

### Thêm một asana mới
1. Khai báo góc khớp trong `src/data/poses.js` (độ; xem chú thích `semanticToQuat` trong `rig.js`
   về dấu của từng góc – vd. `hip: { flex, abd, rot }`, `knee: { flex }`).
2. Thêm mục trong `src/data/asanas.js` với `steps` (tư thế bắt đầu → tư thế đích, `anchor` là khớp
   giữ cố định trên sàn) và `roles` (`contract` / `stretch` / `stabilize`; thêm hậu tố `_L`/`_R`
   cho cơ một bên).

> Mô hình là mô hình giáo dục đã được đơn giản hoá (cơ biểu diễn bằng các bó sợi),
> không thay thế tài liệu giải phẫu chuyên sâu hay tư vấn y khoa.
