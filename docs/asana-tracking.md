# Theo dõi tiến độ: thư viện asana đầy đủ

File này theo dõi việc bổ sung toàn bộ tư thế asana vào ứng dụng. Mỗi tư thế mới làm theo skill
`add-asana` (`.claude/skills/add-asana/SKILL.md`): pose trong `src/data/poses.js` → fit tiếp xúc sàn
(`POSE_FIT`, `npm run fit-poses -- <pose>`) → mục asana trong `src/data/asanas.js` → kiểm tra & chụp ảnh.

Cập nhật cột **Trạng thái** mỗi khi bắt đầu / xong một tư thế, và bảng **Tổng quan** ở dưới.

**Trạng thái:** ✅ xong · 🟨 đang làm · ⬜ chưa làm · ⛔ bị chặn (cần tính năng mới, xem mục "Tính năng cần bổ sung")
**Ưu tiên:** P1 = phổ biến, dạy nhiều trong lớp cân bằng / phục hồi · P2 = trung bình · P3 = nâng cao / cần tính năng mới
**Mức:** giữ theo `level` trong app (`Cơ bản` / `Trung bình`; tư thế nâng cao cần thêm mức `Nâng cao`).

## Tổng quan

| Nhóm | Đã có | Cần làm | Tổng |
|---|---:|---:|---:|
| Đứng | 26 | 0 | 26 |
| Gập người | 7 | 1 | 8 |
| Ngửa sau | 16 | 1 | 17 |
| Chống tay & thăng bằng tay | 16 | 2 | 18 |
| Đảo ngược | 6 | 0 | 6 |
| Ngồi (gồm Balasana) | 22 | 0 | 22 |
| Nằm (ngửa / sấp) | 14 | 0 | 14 |
| Chuỗi động tác | 7 | 0 | 7 |
| **Tổng** | **114** | **4** | **118** |

(`Đã có` = 29 mục ban đầu + 13 mục Đợt 1 + 15 mục Đợt 2 + 5 tư thế dùng dây + 20 mục Đợt 4 + 7 mục P1 còn lại + 4 mục P2 cần tiếp xúc thân – thân (đặt sát, không truyền lực) + 13 mục P3. `Cần làm` có 3 mục là biến thể của asana sẵn có (`ustrasana_block`, `viparita_karani_block`, `viparita_karani_chair`); các biến thể khác ghi trong cột Ghi chú không được đếm riêng.)

---

## 1. Đã có trong app (29 mục)

| ✓ | id | Sanskrit | Tiếng Việt | Nhóm (app) | Mức | Biến thể đã có |
|---|---|---|---|---|---|---|
| ✅ | `tadasana` | Tadasana | Tư thế Núi | Đứng | Cơ bản | – |
| ✅ | `urdhva_hastasana` | Urdhva Hastasana | Vươn tay lên cao | Đứng | Cơ bản | – |
| ✅ | `uttanasana` | Uttanasana | Gập người đứng | Gập người | Cơ bản | Chùng gối |
| ✅ | `ardha_uttanasana` | Ardha Uttanasana | Gập nửa người | Gập người | Cơ bản | – |
| ✅ | `utkatasana` | Utkatasana | Cái ghế | Đứng | Cơ bản | Ngồi nông · Tựa lưng vào tường |
| ✅ | `vrksasana` | Vrksasana | Cái cây | Đứng | Cơ bản | – |
| ✅ | `virabhadrasana_1` | Virabhadrasana I | Chiến binh I | Đứng | Cơ bản | – |
| ✅ | `virabhadrasana_2` | Virabhadrasana II | Chiến binh II | Đứng | Cơ bản | – |
| ✅ | `utthita_parsvakonasana` | Utthita Parsvakonasana | Góc nghiêng mở rộng | Đứng | Cơ bản | Tay đặt gạch |
| ✅ | `trikonasana` | Utthita Trikonasana | Tam giác | Đứng | Cơ bản | Tay đặt gạch |
| ✅ | `marjaryasana_bitilasana` | Marjaryasana – Bitilasana | Mèo – Bò | Chuỗi động tác | Cơ bản | – |
| ✅ | `marjaryasana` | Marjaryasana | Con mèo | Chống tay | Cơ bản | – |
| ✅ | `bitilasana` | Bitilasana | Con bò | Chống tay | Cơ bản | – |
| ✅ | `adho_mukha_svanasana` | Adho Mukha Svanasana | Chó úp mặt | Chống tay | Cơ bản | Chùng gối |
| ✅ | `phalakasana` | Phalakasana | Tấm ván | Chống tay | Cơ bản | Hạ gối |
| ✅ | `chaturanga` | Chaturanga Dandasana | Chống đẩy bốn điểm | Chống tay | Trung bình | Hạ gối |
| ✅ | `urdhva_mukha_svanasana` | Urdhva Mukha Svanasana | Chó ngửa mặt | Ngửa sau | Trung bình | – |
| ✅ | `bhujangasana` | Bhujangasana | Rắn hổ mang | Ngửa sau | Cơ bản | – |
| ✅ | `balasana` | Balasana | Em bé | Ngồi & nằm | Cơ bản | Tựa gối ôm |
| ✅ | `ustrasana` | Ustrasana | Lạc đà | Ngửa sau | Trung bình | – |
| ✅ | `setu_bandha` | Setu Bandha Sarvangasana | Cây cầu | Ngửa sau | Cơ bản | Kê gạch dưới xương cùng |
| ✅ | `dandasana` | Dandasana | Cây gậy | Ngồi & nằm | Cơ bản | – |
| ✅ | `paschimottanasana` | Paschimottanasana | Gập người ngồi | Gập người | Cơ bản | Ngồi trên chăn gấp |
| ✅ | `ardha_matsyendrasana` | Ardha Matsyendrasana | Vặn mình ngồi (Nửa vua cá) | Ngồi & nằm | Cơ bản | – |
| ✅ | `navasana` | Paripurna Navasana | Con thuyền | Ngồi & nằm | Trung bình | Gập gối (Ardha) |
| ✅ | `supta_baddha_konasana` | Supta Baddha Konasana | Góc cố định nằm ngửa | Ngồi & nằm | Cơ bản | Kê gạch dưới đùi |
| ✅ | `viparita_karani` | Viparita Karani | Gác chân lên tường | Ngồi & nằm | Cơ bản | – |
| ✅ | `savasana` | Savasana | Xác chết (thư giãn) | Ngồi & nằm | Cơ bản | Kê gối ôm dưới gối |
| ✅ | `surya_namaskar_a` | Surya Namaskar A | Chào mặt trời A | Chuỗi động tác | Trung bình | – |

---

## 2. Cần làm

Cột **Bắt đầu từ** gợi ý pose có sẵn để chuyển động vào (hoặc pose cùng nhóm vừa làm).
Ký hiệu trong **Ghi chú**:
- 🤝 cần tiếp xúc **thân – thân** (tay nắm chân, gối tựa cánh tay, chân quấn chân…): vật lý hiện chưa có → ⛔ hoặc làm biến thể không bám (dây, gạch).
- 🧱 cần đạo cụ đã có (tường, gạch, gối ôm, chăn gấp). 🪢 cần đạo cụ **mới**: dây (strap), ghế.
- ⚖ một chân / thăng bằng khó: cần `balance: true`, kiểm tra biên ổn định.
- 🔁 một bên (làm bên TRÁI trước), thêm id vào regex ASYMMETRIC trong `tools/check-physics.mjs`.

### 2.1 Đứng

| ✓ | id dự kiến | Sanskrit | Tiếng Việt | English | Mức | Ưu tiên | Bắt đầu từ | Ghi chú |
|---|---|---|---|---|---|---|---|---|
| ✅ | `anjaneyasana` | Anjaneyasana | Lunge thấp (hạ gối sau) | Low Lunge | Cơ bản | P1 | `tadasana` → `ashwa_sanchalanasana` | 🔁 · biến thể tay trên đùi / gạch dưới tay |
| ✅ | `ashwa_sanchalanasana` | Ashwa Sanchalanasana | Lunge cao (tay chống sàn) | High Lunge, hands down | Cơ bản | P1 | `uttanasana` | 🔁 · pose đã có trong Chào mặt trời, chỉ cần mục asana |
| ✅ | `crescent_lunge` | Ashta Chandrasana | Lunge cao tay vươn (Trăng lưỡi liềm) | Crescent Lunge | Cơ bản | P1 | `ashwa_sanchalanasana` | 🔁 |
| ✅ | `viparita_virabhadrasana` | Viparita Virabhadrasana | Chiến binh đảo ngược | Reverse Warrior | Cơ bản | P1 | `virabhadrasana_2` | 🔁 · nghiêng thân về chân sau |
| ✅ | `virabhadrasana_3` | Virabhadrasana III | Chiến binh III | Warrior III | Trung bình | P1 | `tadasana` / `crescent_lunge` | 🔁 ⚖ · biến thể tay chống gạch / tay chạm tường 🧱 |
| ✅ | `parsvottanasana` | Parsvottanasana | Kéo giãn một bên (Kim tự tháp) | Pyramid / Intense Side Stretch | Cơ bản | P1 | `tadasana` | 🔁 · biến thể tay trên gạch 🧱 |
| ✅ | `prasarita_padottanasana` | Prasarita Padottanasana | Gập người dang chân | Wide-Legged Forward Fold | Cơ bản | P1 | `tadasana` (bước chân rộng) | nhóm Gập người · biến thể đầu/tay trên gạch 🧱 |
| ✅ | `malasana` | Malasana | Ngồi xổm (Vòng hoa) | Garland / Yogi Squat | Cơ bản | P1 | `tadasana` | 🤝 khuỷu đẩy gối → biến thể ngồi trên gạch / chăn dưới gót 🧱 |
| ✅ | `utkata_konasana` | Utkata Konasana | Nữ thần | Goddess Pose | Cơ bản | P1 | `tadasana` | đối xứng, dang chân rộng |
| ✅ | `parsva_tadasana` | Parsva Urdhva Hastasana | Nghiêng người đứng | Standing Side Bend | Cơ bản | P1 | `urdhva_hastasana` | 🔁 |
| ✅ | `ardha_chandrasana` | Ardha Chandrasana | Nửa vầng trăng | Half Moon | Trung bình | P2 | `trikonasana` | 🔁 ⚖ · biến thể tay trên gạch / lưng tựa tường 🧱 |
| ✅ | `parivrtta_trikonasana` | Parivrtta Trikonasana | Tam giác vặn xoắn | Revolved Triangle | Trung bình | P2 | `parsvottanasana` | 🔁 · biến thể gạch 🧱 |
| ✅ | `parivrtta_parsvakonasana` | Parivrtta Parsvakonasana | Góc nghiêng vặn xoắn | Revolved Side Angle | Trung bình | P2 | `crescent_lunge` | 🔁 🤝 khuỷu móc đùi → biến thể tay chống gạch / hạ gối |
| ✅ | `parivrtta_utkatasana` | Parivrtta Utkatasana | Cái ghế vặn xoắn | Revolved Chair | Trung bình | P2 | `utkatasana` | 🔁 🤝 khuỷu móc đùi → biến thể tay chắp, không móc |
| ✅ | `skandasana` | Skandasana | Lunge ngang | Side Lunge | Trung bình | P2 | `utkata_konasana` | 🔁 |
| ✅ | `utthita_hasta_padangusthasana` | Utthita Hasta Padangusthasana | Tay nắm ngón chân cái | Extended Hand-to-Big-Toe | Trung bình | P2 | `tadasana` | 🔁 ⚖ 🤝 → biến thể 🪢 dây / chân gác ghế hoặc tường 🧱 |
| ✅ | `garudasana` | Garudasana | Đại bàng | Eagle Pose | Trung bình | P3 | `utkatasana` | 🔁 ⚖ 🤝 tay quấn tay, chân quấn chân |
| ✅ | `natarajasana` | Natarajasana | Vũ công | Dancer Pose | Trung bình | P3 | `tadasana` | 🔁 ⚖ 🤝 tay nắm bàn chân → biến thể 🪢 dây |

### 2.2 Gập người

| ✓ | id dự kiến | Sanskrit | Tiếng Việt | English | Mức | Ưu tiên | Bắt đầu từ | Ghi chú |
|---|---|---|---|---|---|---|---|---|
| ✅ | `janu_sirsasana` | Janu Sirsasana | Gập người chạm gối | Head-to-Knee | Cơ bản | P1 | `dandasana` | 🔁 · bàn chân gập áp đùi trong 🤝 (đặt sát, không đỡ) · biến thể chăn gấp 🧱 / dây 🪢 |
| ✅ | `upavistha_konasana` | Upavistha Konasana | Gập người dang chân ngồi | Wide-Angle Seated Fold | Cơ bản | P1 | `dandasana` | biến thể tựa gối ôm / chăn gấp 🧱 |
| ✅ | `padangusthasana` | Padangusthasana | Gập đứng nắm ngón chân cái | Big Toe Pose | Trung bình | P3 | `uttanasana` | 🤝 ngón tay móc ngón chân |
| ✅ | `parivrtta_janu_sirsasana` | Parivrtta Janu Sirsasana | Gập chạm gối vặn mình | Revolved Head-to-Knee | Trung bình | P3 | `janu_sirsasana` | 🔁 nghiêng bên + vặn |
| ⬜ | `kurmasana` | Kurmasana | Con rùa | Tortoise | Trung bình | P3 | `upavistha_konasana` | 🤝 cánh tay dưới đùi |

### 2.3 Ngửa sau

| ✓ | id dự kiến | Sanskrit | Tiếng Việt | English | Mức | Ưu tiên | Bắt đầu từ | Ghi chú |
|---|---|---|---|---|---|---|---|---|
| ✅ | `salamba_bhujangasana` | Salamba Bhujangasana | Nhân sư | Sphinx | Cơ bản | P1 | `prone` | cẳng tay trên sàn |
| ✅ | `salabhasana` | Salabhasana | Châu chấu | Locust | Cơ bản | P1 | `prone` | biến thể nâng một chân / chỉ ngực |
| ✅ | `anahatasana` | Anahatasana | Chó con (mở tim) | Puppy Pose | Cơ bản | P1 | `tabletop` | biến thể trán trên gạch / tay trên tường 🧱 |
| ✅ | `matsyasana_supported` | Salamba Matsyasana | Con cá có hỗ trợ | Supported Fish | Cơ bản | P1 | `supine` | 🧱 gối ôm / gạch dưới lưng (phục hồi) |
| ✅ | `ardha_purvottanasana` | Ardha Purvottanasana | Bàn ngửa | Reverse Tabletop | Cơ bản | P2 | `dandasana` (gối gập) | |
| ✅ | `purvottanasana` | Purvottanasana | Tấm ván ngửa | Upward Plank | Trung bình | P2 | `dandasana` | |
| ✅ | `matsyasana` | Matsyasana | Con cá | Fish Pose | Trung bình | P2 | `supine` | đỉnh đầu chạm sàn, cẳng tay đỡ |
| ✅ | `dhanurasana` | Dhanurasana | Cánh cung | Bow Pose | Trung bình | P2 | `prone` | 🤝 tay nắm cổ chân → biến thể 🪢 dây |
| ✅ | `eka_pada_rajakapotasana` | Eka Pada Rajakapotasana (dạng chuẩn bị) | Bồ câu | Pigeon (prep) | Trung bình | P2 | `adho_mukha_svanasana` | 🔁 · biến thể gối ôm / chăn dưới hông 🧱 · có thể xếp nhóm Ngồi |
| ✅ | `ustrasana_block` (biến thể) | Ustrasana | Lạc đà tay trên gạch / tay chống hông | Camel, supported | Cơ bản | P1 | `kneeling` | biến thể của `ustrasana` 🧱 |
| ⛔ | `urdhva_dhanurasana` | Urdhva Dhanurasana | Bánh xe | Wheel | Nâng cao | P3 | `supine_knees` | đầu chạm sàn giữa chừng · tải cổ tay / vai lớn |
| ✅ | `camatkarasana` | Camatkarasana | Wild Thing | Wild Thing | Nâng cao | P3 | `adho_mukha_svanasana` | 🔁 |
| ✅ | `supta_virasana` | Supta Virasana | Anh hùng nằm | Reclining Hero | Nâng cao | P3 | `virasana` | gối gập tối đa · biến thể gối ôm dưới lưng 🧱 |

### 2.4 Chống tay & thăng bằng tay

| ✓ | id dự kiến | Sanskrit | Tiếng Việt | English | Mức | Ưu tiên | Bắt đầu từ | Ghi chú |
|---|---|---|---|---|---|---|---|---|
| ✅ | `eka_pada_adho_mukha_svanasana` | Eka Pada Adho Mukha Svanasana | Chó úp mặt ba chân | Three-Legged Dog | Cơ bản | P1 | `adho_mukha_svanasana` | 🔁 |
| ✅ | `dandayamana_bharmanasana` | Dandayamana Bharmanasana | Chim – chó (duỗi tay chân đối) | Bird Dog | Cơ bản | P1 | `tabletop` | 🔁 ⚖ |
| ✅ | `forearm_plank` | Makara Adho Mukha Svanasana / Forearm plank | Tấm ván cẳng tay | Forearm Plank | Cơ bản | P1 | `phalakasana` | biến thể hạ gối |
| ✅ | `vasisthasana` | Vasisthasana | Tấm ván nghiêng | Side Plank | Trung bình | P1 | `phalakasana` | 🔁 ⚖ · biến thể hạ gối dưới / cẳng tay |
| ✅ | `parighasana` | Parighasana | Cánh cổng (nghiêng quỳ) | Gate Pose | Cơ bản | P1 | `kneeling` | 🔁 · có thể xếp nhóm Ngồi |
| ✅ | `parsva_balasana` | Parsva Balasana | Luồn kim | Thread the Needle | Cơ bản | P2 | `tabletop` | 🔁 vai & thái dương trên sàn |
| ✅ | `ardha_pincha_mayurasana` | Ardha Pincha Mayurasana | Cá heo | Dolphin | Trung bình | P2 | `forearm_plank` | |
| ✅ | `bakasana` | Bakasana | Con quạ | Crow | Nâng cao | P3 | `malasana` | ⚖ 🤝 gối tựa cánh tay trên |
| ⬜ | `parsva_bakasana` | Parsva Bakasana | Con quạ nghiêng | Side Crow | Nâng cao | P3 | `parivrtta_utkatasana` | 🔁 ⚖ 🤝 |
| ✅ | `tolasana` | Tolasana | Cái cân | Scale | Nâng cao | P3 | `padmasana` | 🤝 chân kiết già |
| ✅ | `lolasana` | Lolasana | Mặt dây chuyền | Pendant | Nâng cao | P3 | `vajrasana` | ⚖ |
| ⬜ | `astavakrasana` | Astavakrasana | Tám góc | Eight-Angle | Nâng cao | P3 | `dandasana` | 🔁 ⚖ 🤝 |
| ✅ | `pincha_mayurasana` | Pincha Mayurasana | Đứng cẳng tay (Lông công) | Forearm Stand | Nâng cao | P3 | `ardha_pincha_mayurasana` | ⚖ · biến thể tựa tường 🧱 · cũng là đảo ngược |
| ✅ | `adho_mukha_vrksasana` | Adho Mukha Vrksasana | Trồng chuối | Handstand | Nâng cao | P3 | `adho_mukha_svanasana` | ⚖ · biến thể tựa tường 🧱 · cũng là đảo ngược |

### 2.5 Đảo ngược (nhóm mới)

| ✓ | id dự kiến | Sanskrit | Tiếng Việt | English | Mức | Ưu tiên | Bắt đầu từ | Ghi chú |
|---|---|---|---|---|---|---|---|---|
| ✅ | `viparita_karani_block` (biến thể) | Viparita Karani | Gác chân, gạch dưới xương cùng | Supported Inversion | Cơ bản | P1 | `setu_bandha_block` | biến thể của `viparita_karani` (không tường) 🧱 |
| ✅ | `salamba_sarvangasana` | Salamba Sarvangasana | Trồng cây chuối vai | Shoulder Stand | Trung bình | P2 | `supine` | 🧱 chăn gấp dưới vai · gập cổ lớn → cảnh báo cổ · kiểm tra có contact vai/lưng trên |
| ✅ | `halasana` | Halasana | Cái cày | Plow | Trung bình | P2 | `salamba_sarvangasana` | 🧱 chăn / ghế dưới chân 🪢 |
| ✅ | `karnapidasana` | Karnapidasana | Ép tai | Ear Pressure | Nâng cao | P3 | `halasana` | 🤝 gối cạnh tai |
| ✅ | `salamba_sirsasana` | Salamba Sirsasana | Trồng chuối đầu | Headstand | Nâng cao | P3 | `ardha_pincha_mayurasana` | ⚖ tải lên đầu/cổ – cần ghi rõ giới hạn · biến thể tựa tường 🧱 |
| ✅ | `sirsasana_prep` | – | Chuẩn bị trồng chuối đầu | Headstand Prep | Trung bình | P2 | `ardha_pincha_mayurasana` | đỉnh đầu chạm sàn, chân còn dưới |

### 2.6 Ngồi

| ✓ | id dự kiến | Sanskrit | Tiếng Việt | English | Mức | Ưu tiên | Bắt đầu từ | Ghi chú |
|---|---|---|---|---|---|---|---|---|
| ✅ | `sukhasana` | Sukhasana | Ngồi xếp bằng | Easy Seat | Cơ bản | P1 | `dandasana` | 🤝 cẳng chân chéo nhau · biến thể ngồi chăn gấp 🧱 |
| ✅ | `vajrasana` | Vajrasana | Ngồi quỳ (Kim cương) | Thunderbolt | Cơ bản | P1 | `kneeling` | mông trên gót (giống `balasana` `at`) |
| ✅ | `virasana` | Virasana | Anh hùng | Hero Pose | Cơ bản | P1 | `kneeling` | biến thể ngồi gạch 🧱 |
| ✅ | `baddha_konasana` | Baddha Konasana | Góc cố định (Con bướm) | Bound Angle | Cơ bản | P1 | `dandasana` | 🤝 lòng bàn chân áp nhau · biến thể gạch dưới đùi / chăn 🧱 |
| ✅ | `parivrtta_sukhasana` | Parivrtta Sukhasana | Vặn mình ngồi xếp bằng | Easy Seated Twist | Cơ bản | P1 | `sukhasana` | 🔁 |
| ✅ | `parsva_sukhasana` | Parsva Sukhasana | Nghiêng người ngồi | Seated Side Bend | Cơ bản | P1 | `sukhasana` | 🔁 |
| ✅ | `gomukhasana` | Gomukhasana | Mặt bò | Cow Face | Trung bình | P2 | `dandasana` | 🔁 🤝 gối chồng gối, tay móc sau lưng → biến thể 🪢 dây |
| ✅ | `agnistambhasana` | Agnistambhasana | Khúc củi | Fire Log | Trung bình | P2 | `sukhasana` | 🔁 🤝 cẳng chân chồng lên nhau · biến thể chăn dưới gối 🧱 |
| ✅ | `bharadvajasana` | Bharadvajasana I | Vặn mình Bharadvaja | Bharadvaja's Twist | Trung bình | P2 | `dandasana` | 🔁 |
| ✅ | `marichyasana_1` | Marichyasana I | Marichi I (gập) | Marichi's Pose I | Trung bình | P2 | `dandasana` | 🔁 🤝 tay ôm gối |
| ✅ | `marichyasana_3` | Marichyasana III | Marichi III (vặn) | Marichi's Pose III | Trung bình | P2 | `dandasana` | 🔁 🤝 khuỷu móc gối → biến thể ôm gối |
| ✅ | `siddhasana` | Siddhasana | Ngồi thành tựu | Accomplished Pose | Trung bình | P2 | `sukhasana` | |
| ✅ | `ardha_padmasana` | Ardha Padmasana | Bán kiết già | Half Lotus | Trung bình | P3 | `sukhasana` | 🔁 🤝 bàn chân trên đùi · cảnh báo gối |
| ✅ | `padmasana` | Padmasana | Kiết già (Hoa sen) | Lotus | Nâng cao | P3 | `ardha_padmasana` | 🤝 · xoay háng ngoài lớn, cảnh báo gối |
| ✅ | `krounchasana` | Krounchasana | Con diệc | Heron | Nâng cao | P3 | `virasana` | 🔁 🤝 tay nắm chân → 🪢 dây |
| ✅ | `akarna_dhanurasana` | Akarna Dhanurasana | Cánh cung kéo tai | Archer Pose | Nâng cao | P3 | `dandasana` | 🔁 🤝 |
| ✅ | `hanumanasana` | Hanumanasana | Xoạc dọc | Splits | Nâng cao | P3 | `anjaneyasana` | 🔁 · biến thể gạch dưới hông 🧱 |

### 2.7 Nằm (ngửa / sấp)

| ✓ | id dự kiến | Sanskrit | Tiếng Việt | English | Mức | Ưu tiên | Bắt đầu từ | Ghi chú |
|---|---|---|---|---|---|---|---|---|
| ✅ | `constructive_rest` | – | Nằm co gối (nghỉ xây dựng) | Constructive Rest | Cơ bản | P1 | `supine` | pose `supine_knees` đã có, chỉ cần mục asana |
| ✅ | `makarasana` | Makarasana | Cá sấu (nằm sấp nghỉ) | Crocodile | Cơ bản | P1 | `prone` | |
| ✅ | `supta_matsyendrasana` | Supta Matsyendrasana | Vặn mình nằm ngửa | Supine Twist | Cơ bản | P1 | `supine_knees` | 🔁 · biến thể gối ôm dưới gối 🧱 |
| ✅ | `apanasana` | Apanasana | Ôm gối trước ngực | Knees-to-Chest | Cơ bản | P1 | `supine_knees` | 🤝 tay ôm gối → biến thể tay đặt hờ |
| ✅ | `supta_padangusthasana` | Supta Padangusthasana | Nằm ngửa kéo chân | Reclined Hand-to-Big-Toe | Cơ bản | P1 | `supine` | 🔁 🪢 dây (dạng phục hồi phổ biến nhất) |
| ✅ | `supta_kapotasana` | Supta Kapotasana | Bồ câu nằm ngửa (số 4) | Reclined Pigeon / Figure-4 | Cơ bản | P1 | `supine_knees` | 🔁 🤝 mắt cá đặt trên đùi |
| ✅ | `jathara_parivartanasana` | Jathara Parivartanasana | Vặn bụng | Revolved Abdomen | Trung bình | P2 | `supine` | 🔁 |
| ✅ | `ananda_balasana` | Ananda Balasana | Em bé hạnh phúc | Happy Baby | Cơ bản | P2 | `apanasana` | 🤝 tay nắm bàn chân → 🪢 dây |
| ✅ | `pavanamuktasana` | Eka Pada Pavanamuktasana | Ôm một gối | Wind-Relieving | Cơ bản | P2 | `supine` | 🔁 🤝 |
| ✅ | `supta_tadasana` | Supta Tadasana | Núi nằm ngửa (vươn tay) | Reclined Mountain | Cơ bản | P2 | `supine` | |
| ✅ | `viparita_karani_chair` (biến thể) | – | Gác cẳng chân lên ghế | Legs on a Chair | Cơ bản | P2 | `supine` | 🪢 ghế (đạo cụ mới) |

### 2.8 Chuỗi động tác

| ✓ | id dự kiến | Tên | Tiếng Việt | Mức | Ưu tiên | Gồm | Ghi chú |
|---|---|---|---|---|---|---|---|
| ✅ | `vinyasa_flow` | Vinyasa | Chuỗi chuyển tiếp | Trung bình | P2 | Plank → Chaturanga → Chó ngửa → Chó úp | các pose đã có |
| ✅ | `warrior_flow` | – | Chuỗi chiến binh | Cơ bản | P2 | Chiến binh II → Chiến binh đảo ngược → Góc nghiêng | cần `viparita_virabhadrasana` |
| ✅ | `surya_namaskar_b` | Surya Namaskar B | Chào mặt trời B | Trung bình | P2 | thêm Cái ghế + Chiến binh I hai bên | cần chuyển chân sau xoay gót |
| ✅ | `chandra_namaskar` | Chandra Namaskar | Chào mặt trăng | Trung bình | P3 | nghiêng đứng, Nữ thần, Lunge ngang… | cần các pose 2.1 |
| ✅ | `restorative_supine` | – | Chuỗi phục hồi | Cơ bản | P2 | Em bé có gối → Cầu kê gạch → Gác chân lên tường → Xác chết | pose đã có; chỉ ghép |

---

## 3. Tính năng cần bổ sung (chặn nhiều tư thế)

| ✓ | Việc | Mở khoá | Ghi chú |
|---|---|---|---|
| ✅ | Tiếp xúc thân – thân trong vật lý (tay–chân, gối–cánh tay, chân–đùi) | mọi tư thế 🤝 (≈ 30) | đã có: `{ type: 'touch', a, b, at? }` trong POSE_PROPS – lực ép không ma sát giữa hai đoạn (Con quạ, Em bé, Cái cây). Chưa dùng cho tay nắm chân (Paschimottanasana): cần lực kéo, không phải ép |
| ✅ | Đạo cụ **dây** (strap) | Supta Padangusthasana, Dhanurasana, Natarajasana, Gomukhasana… | thêm loại prop mới; lực kéo dây cần mô hình riêng |
| ✅ | Đạo cụ **ghế** | chân gác ghế, Halasana có ghế, tư thế ngồi ghế | chỉ mặt ghế là bề mặt đỡ; bắp chân chưa tựa được lên đạo cụ (điểm tiếp xúc bắp chân chỉ dùng cho tường) |
| ✅ | Nhóm mới trong `CATEGORIES`: `Thăng bằng tay`, `Đảo ngược` | lọc danh sách gọn hơn | Tấm ván nghiêng → Thăng bằng tay, Gác chân lên tường → Đảo ngược |
| ✅ | Mức `Nâng cao` trong `level` (`LEVELS`) | P3 | nhãn màu vàng trong danh sách; check-data kiểm tra mức hợp lệ |
| ✅ | Thêm contact vai trên / C7 / mặt sau cánh tay trên / thái dương | Trồng cây chuối vai, Cái cày, Luồn kim | đã kiểm tra: thiếu (chỉ có góc dưới xương bả vai, gáy, trán, đỉnh đầu) → đã thêm trong `tools/bp3d-build.mjs` và build lại (trừ C7: nằm ngay khớp cổ) |

## 4. Gợi ý thứ tự làm (theo đợt)

1. ✅ **Đợt 1 – nhanh, pose gần có sẵn (P1):** xong (xem ghi chú bên dưới). `ashwa_sanchalanasana`, `constructive_rest`, `anjaneyasana`, `crescent_lunge`,
   `viparita_virabhadrasana`, `vajrasana`, `salamba_bhujangasana`, `salabhasana`, `makarasana`, `eka_pada_adho_mukha_svanasana`,
   `dandayamana_bharmanasana`, `forearm_plank`, `restorative_supine`.
2. ✅ **Đợt 2 – P1 còn lại:** xong (xem ghi chú bên dưới). `parsvottanasana`, `prasarita_padottanasana`, `utkata_konasana`, `parsva_tadasana`, `virabhadrasana_3`,
   `vasisthasana`, `parighasana`, `anahatasana`, `matsyasana_supported`, `janu_sirsasana`, `upavistha_konasana`, `virasana`,
   `supta_matsyendrasana`, biến thể `ustrasana_block`, `viparita_karani_block`.
3. **Đợt 3 – cần quyết định / tính năng:** nhóm mới + mức Nâng cao, đạo cụ dây → `supta_padangusthasana`, `sukhasana`, `baddha_konasana`, `malasana`, `apanasana`, `supta_kapotasana`.
4. **Đợt 4 – P2:** ngửa sau trung bình, vặn xoắn đứng, đảo ngược có hỗ trợ, các chuỗi.
5. **Đợt 5 – P3:** sau khi có tiếp xúc thân – thân.

### Ghi chú Đợt 1

- `restorative_supine` (Chuỗi phục hồi nằm ngửa) chỉ gồm các tư thế nằm ngửa: Savasana → co gối → Cây cầu → Cầu kê gạch → Góc cố định nằm ngửa → Savasana. Em bé có gối ôm và Gác chân lên tường chưa ghép vào vì chưa có chuyển động lăn người / xoay vào tường.
- Lunge thấp và Lunge cao vào tư thế qua chuỗi bước chân của Chào mặt trời. Lunge thấp giữ ngón chân sau co (không duỗi mu bàn chân).
- Lunge cao: chân sau hơi chùng gối (~16°) vì chân trước giữ ~80° với cùng độ dài bước như Ashwa Sanchalanasana.
- Vajrasana: mô hình không có tiếp xúc mông – gót, nên khớp gối phải giữ lực lớn và cột "Hoạt động" (thử nghiệm) sai ở đây – cùng giới hạn như Balasana.
- Cá sấu: trán đặt gần tay nhưng không được tay đỡ trong vật lý (chưa có tiếp xúc thân – thân).
- Nằm ngửa, mô hình tựa trên bả vai, xương chậu cách sàn ~1 cm (hình dạng mô hình), nên các bước nằm ngửa neo theo bả vai.

### Ghi chú Đợt 2

- Virasana: mô hình không ngồi bệt được giữa hai gót (gối phải gập > 165° quanh bắp chân và đùi dày), nên dạng chuẩn trong app là ngồi trên gạch dựng cạnh.
- Vặn mình nằm ngửa: cột sống mô hình chỉ xoay được ~45°, nên gối tựa trên gối ôm và bả vai trái nhấc lên vài cm.
- Janu Sirsasana: tay đặt trên ống chân (tiếp xúc thân – thân, không tính lực); chân phải vào tư thế qua 3 bước trung gian, bàn chân trượt dọc thảm.
- Tấm ván nghiêng: hai bàn chân so le (chồng chân cần tiếp xúc chân – chân). Bộ giải lực dồn phần lớn trọng lượng lên bàn chân trên – một nghiệm "ít tốn sức khớp nhất", không phải phân bố thực tế.
- Cá có hỗ trợ: gạch nằm ngang dưới bả vai, đầu chạm sàn – cổ ngửa khá nhiều; cue nhắc kê đầu cao hơn.
- Upavistha Konasana: tay đặt trên đùi rồi mới vươn ra trước (tay quét qua sàn nếu đi thẳng từ cạnh hông).
- Ghi chú kỹ thuật: góc háng `abd` là góc ngoài cùng (Euler ZYX), nên tham số `root.pitch&hip.flex` của fitter không giữ nguyên chân đang dạng / xoay. Các tư thế gập với chân dạng (Kim tự tháp, Gập người dang chân, Janu Sirsasana, Upavistha) tính góc háng để giữ hướng chân trong không gian.

### Ghi chú Đợt 3 (tính năng)

- Dây tập: lực kéo giữa lòng bàn tay và ức bàn chân, chỉ kéo, không giãn; giải cùng lực sàn (ít tốn sức khớp nhất). Hiện là dải xanh trong cảnh và dòng "Dây tập" trong bảng lực. Dùng cho: Supta Padangusthasana, Em bé hạnh phúc, Cánh cung, Vũ công, Tay nắm ngón chân cái, biến thể "Dùng dây" của Gập người ngồi.
- Với Supta Padangusthasana chân gần thẳng đứng, mô-men chân nhỏ nên dây chỉ gánh vài N (háng 12 → 9 N·m). Dây sẽ có tác dụng rõ hơn khi chân hạ thấp hoặc ở tư thế đứng.

- Lực dây theo mô hình (chia tải theo sức của từng khớp, chọn cách ít tốn sức nhất):
  - Cánh cung: dây kéo ~18 N, mô-men thắt lưng giảm khoảng một nửa (36 → 19 N·m) – dây làm đúng việc của tay nắm cổ chân.
  - Vũ công: ~6 N. Nằm ngửa kéo chân: ~5 N.
  - Em bé hạnh phúc, Tay nắm ngón chân cái, Gập người ngồi dùng dây: 0 N – kéo dây chỉ làm sâu tư thế (một cố gắng chủ động) hoặc tốn sức vai hơn sức háng; mô hình không có lực kéo chủ động, nên ghi rõ trong phần lưu ý.

### Ghi chú Đợt 4 (P2)

- Đợt 4a: Núi nằm ngửa, Ôm một gối, Vặn bụng (+ co gối), Bàn ngửa, Tấm ván ngửa, chuỗi Vinyasa, chuỗi Chiến binh.
- Vặn bụng: cột sống mô hình xoay ~45° nên giữ hai bả vai trên sàn thì chân dừng ở nửa đường, lơ lửng – đúng dạng chủ động (cơ chéo bụng giữ chân). Dạng thả chân xuống sàn là Vặn mình nằm ngửa.
- Ôm một gối: tay ôm cẳng chân là tiếp xúc tay – chân, chưa tính lực; chân được giữ bởi cơ gập háng trong mô hình.
- Bàn ngửa / Tấm ván ngửa: bắt đầu từ tư thế ngồi đã đặt tay sau mông (khoảng cách tay – chân bằng lúc nâng hông) nên tay và chân không trượt.
- Đợt 4b: Cá heo, Lunge ngang, Nửa vầng trăng.
- Cá heo: thân dốc nên cổ hơi ngửa để đầu không chạm sàn (cổ trung tính thì đỉnh đầu chạm thảm và gánh ~25 % trọng lượng – thành tư thế chuẩn bị trồng chuối đầu).
- Lunge ngang: với khoảng cách chân như Gập người dang chân (1,1 m), giữ chân phải thẳng thì hông chỉ hạ được ~50 cm; tay chắp trước ngực.
- Nửa vầng trăng: tay trái trên gạch dựng đứng (23 cm). Tạm để dạng tĩnh: lối vào từ Chiến binh III (neo tay trên gạch, xoay chậu) làm tay và chân trụ thay nhau đỡ thân giữa chừng – giật 5–7 cm. Lối vào qua lunge sâu từ Chiến binh II thì gối trước gần chạm sàn.
- Con cá: chậu nằm sàn, ngực ngửa, đỉnh đầu chạm nhẹ; bộ giải lực vẫn dồn ~17 % trọng lượng lên đầu (ghi trong lưu ý). Biến thể phục hồi = Cá có hỗ trợ.
- Bồ câu (chuẩn bị): góc háng dựng từ hướng đùi và ống chân. Tạm để dạng tĩnh (đổi vị trí chân từ Chó úp / tư thế bàn cần nhiều bước trung gian). Biến thể chăn gấp dưới hông chưa khớp (hông vẫn hở 3 cm) – để sau.
- Bharadvaja, Ngồi thành tựu: dạng tĩnh, góc háng dựng từ hướng đùi / ống chân (gối mở rộng, gập > 120° nên góc Euler có dạng ~−90° – vẫn đúng hình học). Chân tì lên chân chưa có lực; gối Ngồi thành tựu cách sàn ~5 cm.
- Luồn kim: dạng tĩnh; dùng điểm tiếp xúc vai / cánh tay / thái dương mới và xương bả vai phải đưa ra trước ~40° (rig đã có nâng / đưa ra trước xương bả vai quanh khớp ức – đòn, trước đây chưa dùng) – ngực chỉ xoay ~40°. Vai – cánh tay phải gánh ~27 %, đầu ~12 %.
- Chuẩn bị trồng chuối đầu: dạng tĩnh, cẳng tay tam giác, tay đan. Bộ giải lực dồn ~35 % trọng lượng lên đỉnh đầu (ít tốn sức khớp nhất) – ngược với mục tiêu tập; ghi trong lưu ý.
- Cái ghế vặn xoắn: dạng tay chắp, khuỷu đặt cạnh gối (chưa móc – chưa có tiếp xúc tay – chân); có chuyển động Núi → Cái ghế tay chắp → xoay.
- Tam giác vặn xoắn: dạng tĩnh, tay phải trên gạch nằm nghiêng (15 cm) phía trong bàn chân trái. Chuyển động vào tư thế bị giật như Nửa vầng trăng (tay đáp lên gạch làm điểm đỡ đổi đột ngột). Bộ giải lực dồn 54 % lên tay – ghi trong lưu ý.
- Góc nghiêng vặn xoắn: dạng hạ gối sau, tay chắp, có chuyển động (qua chuỗi bước chân vào Lunge thấp). Chậu nghiêng trước 50° nên cơ thắt lưng – chậu chân sau không dài ra trong mô hình (chỉ cơ thẳng đùi); vai trò kéo giãn ghi theo đó.
- Chào mặt trời B: như A, thêm Cái ghế và Chiến binh I (bên trái) giữa hai lần vinyasa; Chiến binh I dùng thế chân dài của lunge (`virabhadrasana_1_long`, ~0,95 m) để bàn chân không trượt khi hạ gót sau.
- Đạo cụ mới: ghế (chỉ mặt ghế là bề mặt đỡ, cao 45 cm). Biến thể Gác cẳng chân lên ghế (của Gác chân lên tường) – dạng tĩnh; gót chân tựa mặt ghế vì điểm tiếp xúc bắp chân chỉ tựa được vào tường.
- Ngồi xếp bằng (+ nghiêng, vặn): cẳng chân bắt chéo đặt sát nhau (không truyền lực chân – chân), tay trên gối không truyền lực. Ngồi xếp bằng và Nghiêng người dạng tĩnh (tay chống sàn rồi rời sàn đẩy thân lên 4–8 cm giữa chừng); Vặn mình có chuyển động.
- Ôm hai gối, Bồ câu nằm ngửa (số 4): có chuyển động; tay ôm cẳng chân / đan sau đùi và cổ chân gác trên đùi đặt sát nhưng không truyền lực.
- Con bướm: bắt đầu từ ngồi co gối (bàn chân đặt sàn), gối mở dần. Cổ chân mô hình không lật trong nên hai lòng bàn chân chỉ áp một phần.
- Ngồi xổm: dạng tĩnh, tay chắp, khuỷu trong gối (không truyền lực); cổ chân gập mu ~45° để gót chạm sàn – lưu ý nhắc kê chăn dưới gót.
- Marichi III: khuỷu tay trái đặt sát mặt ngoài gối phải, cẳng tay hướng lên (không truyền lực tay – gối); tay trái nhấc khỏi sàn trước khi với tới gối (như Vặn mình ngồi). Neo chậu + bàn chân (đùi trái hơi hở sàn ~1,5 cm).
- Marichi I: dạng chuẩn bị – hai tay ôm cẳng chân phải dưới gối, lưng dài, thân nghiêng ra trước ~10–15°. Nghiêng sâu hơn thì bàn chân phải phải trượt xa ra trước (đùi phải không thể dựng cao hơn) nên không còn đúng dáng; bản khóa tay sau lưng cần tiếp xúc tay – tay.
- Khúc củi: dạng tĩnh; cẳng chân chồng song song mép thảm (dưới đặt sàn, trên đặt sát – không truyền lực). Mô hình không có điểm tiếp xúc mặt ngoài cẳng chân nên chân dưới tựa trên mặt ngoài đùi và bàn chân. Chưa có biến thể chăn dưới gối.
- Mặt bò: dạng tĩnh; gối chồng gối, hai bàn chân cạnh hông. Tay: tay trên khuỷu hướng lên, bàn tay sau gáy; tay dưới vòng sau lưng ngang eo – hai tay cách nhau ~25 cm (dạng dùng dây, nhưng dây trong mô hình chỉ nối tay – bàn chân nên chưa vẽ). Đai vai cứng nên tay dưới cần xoay trong lớn hơn thực tế ở khớp vai – cánh tay.
- Gập chạm gối vặn mình (P3): dạng tĩnh, bản dễ – tay trái trên ống chân trái, tay phải vươn qua tai; chân trái dạng ~35° (với háng gập 90°, góc dạng nằm trong `rot` vì khóa gimbal).
- Wild Thing (P3): dạng tĩnh, tay phải trụ, bàn chân trái đặt sau chân phải. Bàn chân phải duỗi mũi (mô hình không có điểm tiếp xúc mép ngoài bàn chân) và cách sàn ~1,7 cm – vẫn trong ngưỡng tiếp xúc 2 cm, gánh ~8 % trọng lượng. Chưa có chuyển động lật từ Chó ba chân.
- Gập đứng nắm ngón chân cái (P3): có chuyển động từ Núi; ngón tay đặt sát ngón chân cái, khuỷu mở sang hai bên – lực kéo tay – chân chưa tính.
- Con diệc (P3): dạng tĩnh, dùng dây (lực dây tay – bàn chân có tính). Chân dưới gập kiểu Janu Sirsasana vì mô hình không gập gối đủ cho chân Anh hùng; bàn chân dưới chạm sàn làm rộng chân đế (không có thì trọng tâm rơi ra trước ụ ngồi).
- Bán kiết già (P3): dạng tĩnh; bàn chân trái đặt sát trên đùi phải (không truyền lực), gối trái cách sàn ~12 cm. Chậu hơi nghiêng (roll 8°) để đùi và bàn chân phải cùng chạm sàn, thắt lưng nghiêng bù cho thân thẳng.
- Chào mặt trăng (P3): bản rút gọn – Núi → tay lên → nghiêng trái / phải → Nữ thần → Lunge ngang trái / phải → Núi (thêm `parsva_tadasana_R`, `skandasana_R` đối xứng). Chưa có Tam giác, Gập người chân trước, Lunge thấp vì dùng thế chân khác (đổi thế chân giữa chừng cần nhiều bước). Khi bước rộng chân, trọng tâm không dồn sang chân trụ (như các mục bước chân khác của app).
- Trồng chuối, Đứng cẳng tay (P3): dạng tĩnh, bản mặt hướng vào tường (đi bộ chân lên tường từ Plank), mũi chân tựa tường gánh 2–4 % trọng lượng; app xếp ở nhóm Đảo ngược. Bản lưng hướng tường (đá chân lên) và bản tự do chưa có. Đứng cẳng tay: cổ ngửa ~45° để đầu không chạm sàn.
- Đại bàng (P3): dạng tĩnh; đùi trái bắt chéo trên đùi phải, bàn chân trái móc sau bắp chân phải, khuỷu phải trên khuỷu trái – đặt sát, không truyền lực. Cơ trám / cơ thang không dài ra vì xương bả vai không dang.
- Con quạ (P3): dạng tĩnh; gối đặt sát mặt sau cánh tay trên (không truyền lực – chân được giữ bằng cơ gập háng), trọng tâm chỉ trong chân đế ~0,5 cm. Cách tìm: cố định thân và chân (chậu nghiêng 85° để bàn chân rời sàn), chỉ fit vai / khuỷu / cổ tay với ràng buộc thăng bằng.
- Xoạc dọc (P3): dạng tĩnh, bản kê gạch dựng cạnh dài (15 cm) dưới ụ ngồi chân trước, gối sau gập ~35° (gối và mu bàn chân chạm thảm). Bản xoạc sát sàn chưa có.
- Kiết già (P3): dạng tĩnh; góc háng dựng từ hướng đùi / ống chân (gối gần sàn), bàn chân đặt sát trên đùi đối diện, không truyền lực.
- Trồng chuối đầu (P3): dạng tĩnh, tay đan tam giác như bản chuẩn bị, đỉnh đầu chạm sàn. Bộ giải lực chia ~25 % trọng lượng lên đầu, ~52 % lên cẳng tay (cách ít tốn sức khớp nhất, không phải mục tiêu tập) – lưu ý ghi rõ. Cổ gập ~29° để đỉnh đầu (không phải trán) chạm sàn với hình học đầu của mô hình. Chưa có bản tựa tường.
- Cái cân (P3): bản kê hai viên gạch nằm sát ngoài hông. Duỗi thẳng tay trên sàn chỉ nhấc mông ~3 cm (tay mô hình ngắn so với thân khi ngồi); trên gạch mông cách sàn ~12 cm, biên thăng bằng ~3 cm, hai tay chịu 50/50. Có bước ngồi ấn tay → nhấc.
- Mặt dây chuyền (P3): bản kê hai viên gạch nằm cạnh gối, dạng tĩnh, cẳng chân song song (không bắt chéo). Bộ fit có thêm mục tiêu `lift` (giữ bộ phận cách sàn ≥ 4 cm) – không có nó bộ fit luôn hạ bàn chân xuống để đạt thăng bằng. Trên sàn: chỉ thăng bằng được khi chúi đầu thấp hơn hông → dùng gạch. Biên thăng bằng ~3 cm, bàn chân cách sàn ~4 cm.
- Cánh cung kéo tai (P3): dạng tĩnh, bản tay trái giữ gối. Chân phải dựng từ hình học (cổ chân cạnh tai phải, gối mở ra ngoài – lên trên), bộ fit chỉ đặt tay. Bản nắm ngón chân cái: thân phải cúi ~40°, trọng tâm rơi ra trước – phải ngoài đường ụ ngồi phải – bàn chân trái; bộ fit chỉ thăng bằng được khi tay trái chống sàn (~20 % trọng lượng) – bỏ. Ngực nghiêng trái ~6° để trọng tâm nằm trên chân đế (biên ~1 cm); chân trái hơi khép vào giữa.
- Anh hùng nằm (P3): dạng tĩnh, ngồi gạch dựng cạnh + gối ôm dọc thảm kê dốc 21° (đầu xa trên gạch dựng đứng; đạo cụ gối ôm có thêm `tilt`). Góc háng dựng lại bằng leg2 từ hướng đùi / ống chân của Anh hùng ngồi gạch cho từng độ ngả của chậu – đổi `root.pitch&hip.flex` không giữ được đùi vì háng có dạng / xoay (thứ tự Euler). Lần trước (gối ôm nằm phẳng) gối nhấc 8–9 cm: thân ngả ~30° nhưng gối ôm phẳng nên cả người xoay quanh điểm tựa lưng. Chậu −74°, thắt lưng gập 20°, ngực ngửa 20°, háng duỗi ~10°: mông, gối, bàn chân, lưng, bả vai, đầu đều chạm. Bản nằm hẳn xuống sàn không làm được (gối mô hình gập tối đa ~157°).
- Đã thử, chưa đạt: Quạ nghiêng (cần xoay chậu ~90° so với ngực quanh trục cột sống – bộ fit chưa làm được).
- Mô hình có thêm điểm tiếp xúc (build lại từ BodyParts3D 3.0): đỉnh vai (mỏm cùng vai), mỏm gai T2, mặt sau và mặt ngoài cánh tay trên, thái dương. Không thêm điểm ở C7 (nằm ngay khớp cổ – sẽ gánh lực mỗi khi lưng trên gánh). Cây cầu được fit lại (giờ tựa lưng trên + mặt sau cánh tay).
- Trồng cây chuối vai, Cái cày: dạng tĩnh, kê chăn gấp dưới vai và cánh tay trên, đầu trên sàn ngoài mép chăn; đầu không chịu lực. Trồng cây chuối vai thân nghiêng ~25°.
- Ép tai (P3): dạng tĩnh, kê chăn như Cái cày; thắt lưng gập ~55°, gối cách sàn ~3 cm, mu bàn chân chạm sàn; gối – đầu không truyền lực.
- ⛔ Bánh xe (`urdhva_dhanurasana`): không có nghiên cứu đo góc khớp tư thế này (đã tìm PubMed / Europe PMC và nhờ Gemini Deep Research). Giới hạn gần nhất có số đo: cú chạm tay khi lộn sau của 50 VĐV thể dục dụng cụ nữ 8–15 tuổi – vai gập 154° (126–174°), cổ tay ngửa 95° (77–119°) (McLaren và cs. 2015, Int J Sports Phys Ther 10(3):341, PMC4458921). Fit lại với vai ≤ 174°, cổ tay ≤ 119°, bàn tay/chân áp sàn, vai trên cổ tay: đạt được (vai 170°, cổ tay 109°) nhưng cột sống phải ngửa ~119° (thắt lưng 59° + ngực 60°), gần gấp đôi giới hạn của mô hình (35° + 30°). Giữ cột sống trong giới hạn thì bàn tay chỉ chạm sàn bằng đầu ngón hoặc cổ tay phải ngửa 120–140°. Cần số đo độ ngửa cột sống (thắt lưng / ngực) ở tư thế Bánh xe của người tập yoga – chưa tìm thấy. Lần 2 – số đo cột sống ở tư thế cầu ngửa (IMU, 38 VĐV thể dục dụng cụ 12 tuổi không đau lưng; Kinoshita và cs. 2025, J Hum Kinet 99:19, PMC12612811, Bảng 3 & 5): ngực–thắt lưng duỗi 74,1 ± 14,4°, thắt lưng–cùng 37,7 ± 13,6°, háng duỗi 10,7 ± 7,1°, gối gập 74,0 ± 9,9°, vai 127,8 ± 10,0° (cánh tay – thân). Đặt đúng các góc này lên mô hình (bàn chân áp sàn) thì bàn tay rơi cách dưới vai ~38 cm (tay nghiêng ~40°, cổ tay phải ngửa ~130°); muốn bàn tay áp sàn với cổ tay ≤ 119° thì cánh tay – thân phải ~173° (lệch ~4,5 SD). Chưa rõ do cách chia đoạn của bộ IMU khác rig (khớp ngực của rig là một khớp, lồng ngực cứng), do tỉ lệ cơ thể trẻ 12 tuổi (cao 139 cm) so với mô hình người lớn 1,64 m, hay do rig thiếu xoay lên của xương bả vai. Cần số đo trên người lớn tập yoga, hoặc toàn văn Barker và cs. 2021 (Vicon, cầu ngửa thể dục dụng cụ – chưa có PDF).
- ✅ (đã gỡ chặn) Trồng cây chuối vai, Cái cày: trước đây mô hình chỉ có điểm tiếp xúc ở góc dưới xương bả vai và sau đầu – không có ở đỉnh vai / C7 / mặt sau cánh tay trên, nên thân không đỡ được trên vai và đầu sẽ gánh phần lớn trọng lượng (dạy sai đúng điều an toàn quan trọng nhất). Cần thêm contact trong `tools/bp3d-build.mjs` và build lại mô hình (cùng việc với Luồn kim).

## 5. Checklist cho mỗi tư thế (Definition of done)

- [ ] Pose + `POSE_FIT`, fit chỉ các pose mới (`npm run fit-poses -- <pose>`), khe hở ~0 cm ở mọi support
- [ ] Via pose cho chuyển động thật (nhấc chân trước khi mở, bước từng chân), đã fit
- [ ] Mục asana: roles (theo tài liệu, không theo mô hình), joints, cues / benefits / cautions tiếng Việt, biến thể dễ hơn cho lớp phục hồi
- [ ] `npm run check` và `npm run build` xanh
- [ ] `review-poses` (front, left, top) + khung giữa chuyển động (`--at`) đạt checklist "workshop quality" trong skill
- [ ] Cập nhật bảng này (trạng thái + Tổng quan)
