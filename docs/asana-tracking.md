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
| Đứng | 8 | 18 | 26 |
| Gập người | 3 | 5 | 8 |
| Ngửa sau | 4 | 13 | 17 |
| Chống tay & thăng bằng tay | 5 | 14 | 19 |
| Đảo ngược | 0 | 6 | 6 |
| Ngồi (gồm Balasana) | 4 | 17 | 21 |
| Nằm (ngửa / sấp) | 3 | 11 | 14 |
| Chuỗi động tác | 2 | 5 | 7 |
| **Tổng** | **29** | **89** | **118** |

(`Đã có` = 29 mục trong `ASANAS`, gồm 2 chuỗi. `Cần làm` có 4 mục là biến thể của asana sẵn có: `ustrasana_block`, `viparita_karani_block`, `viparita_karani_chair` và các biến thể ghi trong cột Ghi chú không được đếm riêng.)

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
| ⬜ | `anjaneyasana` | Anjaneyasana | Lunge thấp (hạ gối sau) | Low Lunge | Cơ bản | P1 | `tadasana` → `ashwa_sanchalanasana` | 🔁 · biến thể tay trên đùi / gạch dưới tay |
| ⬜ | `ashwa_sanchalanasana` | Ashwa Sanchalanasana | Lunge cao (tay chống sàn) | High Lunge, hands down | Cơ bản | P1 | `uttanasana` | 🔁 · pose đã có trong Chào mặt trời, chỉ cần mục asana |
| ⬜ | `crescent_lunge` | Ashta Chandrasana | Lunge cao tay vươn (Trăng lưỡi liềm) | Crescent Lunge | Cơ bản | P1 | `ashwa_sanchalanasana` | 🔁 |
| ⬜ | `viparita_virabhadrasana` | Viparita Virabhadrasana | Chiến binh đảo ngược | Reverse Warrior | Cơ bản | P1 | `virabhadrasana_2` | 🔁 · nghiêng thân về chân sau |
| ⬜ | `virabhadrasana_3` | Virabhadrasana III | Chiến binh III | Warrior III | Trung bình | P1 | `tadasana` / `crescent_lunge` | 🔁 ⚖ · biến thể tay chống gạch / tay chạm tường 🧱 |
| ⬜ | `parsvottanasana` | Parsvottanasana | Kéo giãn một bên (Kim tự tháp) | Pyramid / Intense Side Stretch | Cơ bản | P1 | `tadasana` | 🔁 · biến thể tay trên gạch 🧱 |
| ⬜ | `prasarita_padottanasana` | Prasarita Padottanasana | Gập người dang chân | Wide-Legged Forward Fold | Cơ bản | P1 | `tadasana` (bước chân rộng) | nhóm Gập người · biến thể đầu/tay trên gạch 🧱 |
| ⬜ | `malasana` | Malasana | Ngồi xổm (Vòng hoa) | Garland / Yogi Squat | Cơ bản | P1 | `tadasana` | 🤝 khuỷu đẩy gối → biến thể ngồi trên gạch / chăn dưới gót 🧱 |
| ⬜ | `utkata_konasana` | Utkata Konasana | Nữ thần | Goddess Pose | Cơ bản | P1 | `tadasana` | đối xứng, dang chân rộng |
| ⬜ | `parsva_tadasana` | Parsva Urdhva Hastasana | Nghiêng người đứng | Standing Side Bend | Cơ bản | P1 | `urdhva_hastasana` | 🔁 |
| ⬜ | `ardha_chandrasana` | Ardha Chandrasana | Nửa vầng trăng | Half Moon | Trung bình | P2 | `trikonasana` | 🔁 ⚖ · biến thể tay trên gạch / lưng tựa tường 🧱 |
| ⬜ | `parivrtta_trikonasana` | Parivrtta Trikonasana | Tam giác vặn xoắn | Revolved Triangle | Trung bình | P2 | `parsvottanasana` | 🔁 · biến thể gạch 🧱 |
| ⬜ | `parivrtta_parsvakonasana` | Parivrtta Parsvakonasana | Góc nghiêng vặn xoắn | Revolved Side Angle | Trung bình | P2 | `crescent_lunge` | 🔁 🤝 khuỷu móc đùi → biến thể tay chống gạch / hạ gối |
| ⬜ | `parivrtta_utkatasana` | Parivrtta Utkatasana | Cái ghế vặn xoắn | Revolved Chair | Trung bình | P2 | `utkatasana` | 🔁 🤝 khuỷu móc đùi → biến thể tay chắp, không móc |
| ⬜ | `skandasana` | Skandasana | Lunge ngang | Side Lunge | Trung bình | P2 | `utkata_konasana` | 🔁 |
| ⬜ | `utthita_hasta_padangusthasana` | Utthita Hasta Padangusthasana | Tay nắm ngón chân cái | Extended Hand-to-Big-Toe | Trung bình | P2 | `tadasana` | 🔁 ⚖ 🤝 → biến thể 🪢 dây / chân gác ghế hoặc tường 🧱 |
| ⬜ | `garudasana` | Garudasana | Đại bàng | Eagle Pose | Trung bình | P3 | `utkatasana` | 🔁 ⚖ 🤝 tay quấn tay, chân quấn chân |
| ⬜ | `natarajasana` | Natarajasana | Vũ công | Dancer Pose | Trung bình | P3 | `tadasana` | 🔁 ⚖ 🤝 tay nắm bàn chân → biến thể 🪢 dây |

### 2.2 Gập người

| ✓ | id dự kiến | Sanskrit | Tiếng Việt | English | Mức | Ưu tiên | Bắt đầu từ | Ghi chú |
|---|---|---|---|---|---|---|---|---|
| ⬜ | `janu_sirsasana` | Janu Sirsasana | Gập người chạm gối | Head-to-Knee | Cơ bản | P1 | `dandasana` | 🔁 · bàn chân gập áp đùi trong 🤝 (đặt sát, không đỡ) · biến thể chăn gấp 🧱 / dây 🪢 |
| ⬜ | `upavistha_konasana` | Upavistha Konasana | Gập người dang chân ngồi | Wide-Angle Seated Fold | Cơ bản | P1 | `dandasana` | biến thể tựa gối ôm / chăn gấp 🧱 |
| ⬜ | `padangusthasana` | Padangusthasana | Gập đứng nắm ngón chân cái | Big Toe Pose | Trung bình | P3 | `uttanasana` | 🤝 ngón tay móc ngón chân |
| ⬜ | `parivrtta_janu_sirsasana` | Parivrtta Janu Sirsasana | Gập chạm gối vặn mình | Revolved Head-to-Knee | Trung bình | P3 | `janu_sirsasana` | 🔁 nghiêng bên + vặn |
| ⬜ | `kurmasana` | Kurmasana | Con rùa | Tortoise | Trung bình | P3 | `upavistha_konasana` | 🤝 cánh tay dưới đùi |

### 2.3 Ngửa sau

| ✓ | id dự kiến | Sanskrit | Tiếng Việt | English | Mức | Ưu tiên | Bắt đầu từ | Ghi chú |
|---|---|---|---|---|---|---|---|---|
| ⬜ | `salamba_bhujangasana` | Salamba Bhujangasana | Nhân sư | Sphinx | Cơ bản | P1 | `prone` | cẳng tay trên sàn |
| ⬜ | `salabhasana` | Salabhasana | Châu chấu | Locust | Cơ bản | P1 | `prone` | biến thể nâng một chân / chỉ ngực |
| ⬜ | `anahatasana` | Anahatasana | Chó con (mở tim) | Puppy Pose | Cơ bản | P1 | `tabletop` | biến thể trán trên gạch / tay trên tường 🧱 |
| ⬜ | `matsyasana_supported` | Salamba Matsyasana | Con cá có hỗ trợ | Supported Fish | Cơ bản | P1 | `supine` | 🧱 gối ôm / gạch dưới lưng (phục hồi) |
| ⬜ | `ardha_purvottanasana` | Ardha Purvottanasana | Bàn ngửa | Reverse Tabletop | Cơ bản | P2 | `dandasana` (gối gập) | |
| ⬜ | `purvottanasana` | Purvottanasana | Tấm ván ngửa | Upward Plank | Trung bình | P2 | `dandasana` | |
| ⬜ | `matsyasana` | Matsyasana | Con cá | Fish Pose | Trung bình | P2 | `supine` | đỉnh đầu chạm sàn, cẳng tay đỡ |
| ⬜ | `dhanurasana` | Dhanurasana | Cánh cung | Bow Pose | Trung bình | P2 | `prone` | 🤝 tay nắm cổ chân → biến thể 🪢 dây |
| ⬜ | `eka_pada_rajakapotasana` | Eka Pada Rajakapotasana (dạng chuẩn bị) | Bồ câu | Pigeon (prep) | Trung bình | P2 | `adho_mukha_svanasana` | 🔁 · biến thể gối ôm / chăn dưới hông 🧱 · có thể xếp nhóm Ngồi |
| ⬜ | `ustrasana_block` (biến thể) | Ustrasana | Lạc đà tay trên gạch / tay chống hông | Camel, supported | Cơ bản | P1 | `kneeling` | biến thể của `ustrasana` 🧱 |
| ⬜ | `urdhva_dhanurasana` | Urdhva Dhanurasana | Bánh xe | Wheel | Nâng cao | P3 | `supine_knees` | đầu chạm sàn giữa chừng · tải cổ tay / vai lớn |
| ⬜ | `camatkarasana` | Camatkarasana | Wild Thing | Wild Thing | Nâng cao | P3 | `adho_mukha_svanasana` | 🔁 |
| ⬜ | `supta_virasana` | Supta Virasana | Anh hùng nằm | Reclining Hero | Nâng cao | P3 | `virasana` | gối gập tối đa · biến thể gối ôm dưới lưng 🧱 |

### 2.4 Chống tay & thăng bằng tay

| ✓ | id dự kiến | Sanskrit | Tiếng Việt | English | Mức | Ưu tiên | Bắt đầu từ | Ghi chú |
|---|---|---|---|---|---|---|---|---|
| ⬜ | `eka_pada_adho_mukha_svanasana` | Eka Pada Adho Mukha Svanasana | Chó úp mặt ba chân | Three-Legged Dog | Cơ bản | P1 | `adho_mukha_svanasana` | 🔁 |
| ⬜ | `dandayamana_bharmanasana` | Dandayamana Bharmanasana | Chim – chó (duỗi tay chân đối) | Bird Dog | Cơ bản | P1 | `tabletop` | 🔁 ⚖ |
| ⬜ | `forearm_plank` | Makara Adho Mukha Svanasana / Forearm plank | Tấm ván cẳng tay | Forearm Plank | Cơ bản | P1 | `phalakasana` | biến thể hạ gối |
| ⬜ | `vasisthasana` | Vasisthasana | Tấm ván nghiêng | Side Plank | Trung bình | P1 | `phalakasana` | 🔁 ⚖ · biến thể hạ gối dưới / cẳng tay |
| ⬜ | `parighasana` | Parighasana | Cánh cổng (nghiêng quỳ) | Gate Pose | Cơ bản | P1 | `kneeling` | 🔁 · có thể xếp nhóm Ngồi |
| ⬜ | `parsva_balasana` | Parsva Balasana | Luồn kim | Thread the Needle | Cơ bản | P2 | `tabletop` | 🔁 vai & thái dương trên sàn |
| ⬜ | `ardha_pincha_mayurasana` | Ardha Pincha Mayurasana | Cá heo | Dolphin | Trung bình | P2 | `forearm_plank` | |
| ⬜ | `bakasana` | Bakasana | Con quạ | Crow | Nâng cao | P3 | `malasana` | ⚖ 🤝 gối tựa cánh tay trên |
| ⬜ | `parsva_bakasana` | Parsva Bakasana | Con quạ nghiêng | Side Crow | Nâng cao | P3 | `parivrtta_utkatasana` | 🔁 ⚖ 🤝 |
| ⬜ | `tolasana` | Tolasana | Cái cân | Scale | Nâng cao | P3 | `padmasana` | 🤝 chân kiết già |
| ⬜ | `lolasana` | Lolasana | Mặt dây chuyền | Pendant | Nâng cao | P3 | `vajrasana` | ⚖ |
| ⬜ | `astavakrasana` | Astavakrasana | Tám góc | Eight-Angle | Nâng cao | P3 | `dandasana` | 🔁 ⚖ 🤝 |
| ⬜ | `pincha_mayurasana` | Pincha Mayurasana | Đứng cẳng tay (Lông công) | Forearm Stand | Nâng cao | P3 | `ardha_pincha_mayurasana` | ⚖ · biến thể tựa tường 🧱 · cũng là đảo ngược |
| ⬜ | `adho_mukha_vrksasana` | Adho Mukha Vrksasana | Trồng chuối | Handstand | Nâng cao | P3 | `adho_mukha_svanasana` | ⚖ · biến thể tựa tường 🧱 · cũng là đảo ngược |

### 2.5 Đảo ngược (nhóm mới)

| ✓ | id dự kiến | Sanskrit | Tiếng Việt | English | Mức | Ưu tiên | Bắt đầu từ | Ghi chú |
|---|---|---|---|---|---|---|---|---|
| ⬜ | `viparita_karani_block` (biến thể) | Viparita Karani | Gác chân, gạch dưới xương cùng | Supported Inversion | Cơ bản | P1 | `setu_bandha_block` | biến thể của `viparita_karani` (không tường) 🧱 |
| ⬜ | `salamba_sarvangasana` | Salamba Sarvangasana | Trồng cây chuối vai | Shoulder Stand | Trung bình | P2 | `supine` | 🧱 chăn gấp dưới vai · gập cổ lớn → cảnh báo cổ · kiểm tra có contact vai/lưng trên |
| ⬜ | `halasana` | Halasana | Cái cày | Plow | Trung bình | P2 | `salamba_sarvangasana` | 🧱 chăn / ghế dưới chân 🪢 |
| ⬜ | `karnapidasana` | Karnapidasana | Ép tai | Ear Pressure | Nâng cao | P3 | `halasana` | 🤝 gối cạnh tai |
| ⬜ | `salamba_sirsasana` | Salamba Sirsasana | Trồng chuối đầu | Headstand | Nâng cao | P3 | `ardha_pincha_mayurasana` | ⚖ tải lên đầu/cổ – cần ghi rõ giới hạn · biến thể tựa tường 🧱 |
| ⬜ | `sirsasana_prep` | – | Chuẩn bị trồng chuối đầu | Headstand Prep | Trung bình | P2 | `ardha_pincha_mayurasana` | đỉnh đầu chạm sàn, chân còn dưới |

### 2.6 Ngồi

| ✓ | id dự kiến | Sanskrit | Tiếng Việt | English | Mức | Ưu tiên | Bắt đầu từ | Ghi chú |
|---|---|---|---|---|---|---|---|---|
| ⬜ | `sukhasana` | Sukhasana | Ngồi xếp bằng | Easy Seat | Cơ bản | P1 | `dandasana` | 🤝 cẳng chân chéo nhau · biến thể ngồi chăn gấp 🧱 |
| ⬜ | `vajrasana` | Vajrasana | Ngồi quỳ (Kim cương) | Thunderbolt | Cơ bản | P1 | `kneeling` | mông trên gót (giống `balasana` `at`) |
| ⬜ | `virasana` | Virasana | Anh hùng | Hero Pose | Cơ bản | P1 | `kneeling` | biến thể ngồi gạch 🧱 |
| ⬜ | `baddha_konasana` | Baddha Konasana | Góc cố định (Con bướm) | Bound Angle | Cơ bản | P1 | `dandasana` | 🤝 lòng bàn chân áp nhau · biến thể gạch dưới đùi / chăn 🧱 |
| ⬜ | `parivrtta_sukhasana` | Parivrtta Sukhasana | Vặn mình ngồi xếp bằng | Easy Seated Twist | Cơ bản | P1 | `sukhasana` | 🔁 |
| ⬜ | `parsva_sukhasana` | Parsva Sukhasana | Nghiêng người ngồi | Seated Side Bend | Cơ bản | P1 | `sukhasana` | 🔁 |
| ⬜ | `gomukhasana` | Gomukhasana | Mặt bò | Cow Face | Trung bình | P2 | `dandasana` | 🔁 🤝 gối chồng gối, tay móc sau lưng → biến thể 🪢 dây |
| ⬜ | `agnistambhasana` | Agnistambhasana | Khúc củi | Fire Log | Trung bình | P2 | `sukhasana` | 🔁 🤝 cẳng chân chồng lên nhau · biến thể chăn dưới gối 🧱 |
| ⬜ | `bharadvajasana` | Bharadvajasana I | Vặn mình Bharadvaja | Bharadvaja's Twist | Trung bình | P2 | `dandasana` | 🔁 |
| ⬜ | `marichyasana_1` | Marichyasana I | Marichi I (gập) | Marichi's Pose I | Trung bình | P2 | `dandasana` | 🔁 🤝 tay ôm gối |
| ⬜ | `marichyasana_3` | Marichyasana III | Marichi III (vặn) | Marichi's Pose III | Trung bình | P2 | `dandasana` | 🔁 🤝 khuỷu móc gối → biến thể ôm gối |
| ⬜ | `siddhasana` | Siddhasana | Ngồi thành tựu | Accomplished Pose | Trung bình | P2 | `sukhasana` | |
| ⬜ | `ardha_padmasana` | Ardha Padmasana | Bán kiết già | Half Lotus | Trung bình | P3 | `sukhasana` | 🔁 🤝 bàn chân trên đùi · cảnh báo gối |
| ⬜ | `padmasana` | Padmasana | Kiết già (Hoa sen) | Lotus | Nâng cao | P3 | `ardha_padmasana` | 🤝 · xoay háng ngoài lớn, cảnh báo gối |
| ⬜ | `krounchasana` | Krounchasana | Con diệc | Heron | Nâng cao | P3 | `virasana` | 🔁 🤝 tay nắm chân → 🪢 dây |
| ⬜ | `akarna_dhanurasana` | Akarna Dhanurasana | Cánh cung kéo tai | Archer Pose | Nâng cao | P3 | `dandasana` | 🔁 🤝 |
| ⬜ | `hanumanasana` | Hanumanasana | Xoạc dọc | Splits | Nâng cao | P3 | `anjaneyasana` | 🔁 · biến thể gạch dưới hông 🧱 |

### 2.7 Nằm (ngửa / sấp)

| ✓ | id dự kiến | Sanskrit | Tiếng Việt | English | Mức | Ưu tiên | Bắt đầu từ | Ghi chú |
|---|---|---|---|---|---|---|---|---|
| ⬜ | `constructive_rest` | – | Nằm co gối (nghỉ xây dựng) | Constructive Rest | Cơ bản | P1 | `supine` | pose `supine_knees` đã có, chỉ cần mục asana |
| ⬜ | `makarasana` | Makarasana | Cá sấu (nằm sấp nghỉ) | Crocodile | Cơ bản | P1 | `prone` | |
| ⬜ | `supta_matsyendrasana` | Supta Matsyendrasana | Vặn mình nằm ngửa | Supine Twist | Cơ bản | P1 | `supine_knees` | 🔁 · biến thể gối ôm dưới gối 🧱 |
| ⬜ | `apanasana` | Apanasana | Ôm gối trước ngực | Knees-to-Chest | Cơ bản | P1 | `supine_knees` | 🤝 tay ôm gối → biến thể tay đặt hờ |
| ⬜ | `supta_padangusthasana` | Supta Padangusthasana | Nằm ngửa kéo chân | Reclined Hand-to-Big-Toe | Cơ bản | P1 | `supine` | 🔁 🪢 dây (dạng phục hồi phổ biến nhất) |
| ⬜ | `supta_kapotasana` | Supta Kapotasana | Bồ câu nằm ngửa (số 4) | Reclined Pigeon / Figure-4 | Cơ bản | P1 | `supine_knees` | 🔁 🤝 mắt cá đặt trên đùi |
| ⬜ | `jathara_parivartanasana` | Jathara Parivartanasana | Vặn bụng | Revolved Abdomen | Trung bình | P2 | `supine` | 🔁 |
| ⬜ | `ananda_balasana` | Ananda Balasana | Em bé hạnh phúc | Happy Baby | Cơ bản | P2 | `apanasana` | 🤝 tay nắm bàn chân → 🪢 dây |
| ⬜ | `pavanamuktasana` | Eka Pada Pavanamuktasana | Ôm một gối | Wind-Relieving | Cơ bản | P2 | `supine` | 🔁 🤝 |
| ⬜ | `supta_tadasana` | Supta Tadasana | Núi nằm ngửa (vươn tay) | Reclined Mountain | Cơ bản | P2 | `supine` | |
| ⬜ | `viparita_karani_chair` (biến thể) | – | Gác cẳng chân lên ghế | Legs on a Chair | Cơ bản | P2 | `supine` | 🪢 ghế (đạo cụ mới) |

### 2.8 Chuỗi động tác

| ✓ | id dự kiến | Tên | Tiếng Việt | Mức | Ưu tiên | Gồm | Ghi chú |
|---|---|---|---|---|---|---|---|
| ⬜ | `vinyasa_flow` | Vinyasa | Chuỗi chuyển tiếp | Trung bình | P2 | Plank → Chaturanga → Chó ngửa → Chó úp | các pose đã có |
| ⬜ | `warrior_flow` | – | Chuỗi chiến binh | Cơ bản | P2 | Chiến binh II → Chiến binh đảo ngược → Góc nghiêng | cần `viparita_virabhadrasana` |
| ⬜ | `surya_namaskar_b` | Surya Namaskar B | Chào mặt trời B | Trung bình | P2 | thêm Cái ghế + Chiến binh I hai bên | cần chuyển chân sau xoay gót |
| ⬜ | `chandra_namaskar` | Chandra Namaskar | Chào mặt trăng | Trung bình | P3 | nghiêng đứng, Nữ thần, Lunge ngang… | cần các pose 2.1 |
| ⬜ | `restorative_sequence` | – | Chuỗi phục hồi | Cơ bản | P2 | Em bé có gối → Cầu kê gạch → Gác chân lên tường → Xác chết | pose đã có; chỉ ghép |

---

## 3. Tính năng cần bổ sung (chặn nhiều tư thế)

| ✓ | Việc | Mở khoá | Ghi chú |
|---|---|---|---|
| ⬜ | Tiếp xúc thân – thân trong vật lý (tay–chân, gối–cánh tay, chân–đùi) | mọi tư thế 🤝 (≈ 30) | CLAUDE.md: thiếu tiếp xúc này cũng là nguồn sai số chính ở Balasana, Vrksasana, Paschimottanasana. Trước khi có: làm biến thể không bám hoặc đặt sát nhưng không truyền lực, ghi rõ giới hạn trong UI |
| ⬜ | Đạo cụ **dây** (strap) | Supta Padangusthasana, Dhanurasana, Natarajasana, Gomukhasana… | thêm loại prop mới; lực kéo dây cần mô hình riêng |
| ⬜ | Đạo cụ **ghế** | chân gác ghế, Halasana có ghế, tư thế ngồi ghế | |
| ⬜ | Nhóm mới trong `CATEGORIES`: `Đảo ngược`, `Thăng bằng tay`, `Vặn xoắn`? | lọc danh sách gọn hơn | quyết định trước khi thêm nhiều tư thế |
| ⬜ | Mức `Nâng cao` trong `level` | P3 | kiểm tra UI hiển thị nhãn mới |
| ⬜ | Kiểm tra contact vai / lưng trên / đỉnh đầu đủ cho đảo ngược | 2.5 | thiếu contact → thêm trong `tools/bp3d-build.mjs` rồi rebuild, không sửa `body-model.gen.js` |

## 4. Gợi ý thứ tự làm (theo đợt)

1. **Đợt 1 – nhanh, pose gần có sẵn (P1):** `ashwa_sanchalanasana`, `constructive_rest`, `anjaneyasana`, `crescent_lunge`,
   `viparita_virabhadrasana`, `vajrasana`, `salamba_bhujangasana`, `salabhasana`, `makarasana`, `eka_pada_adho_mukha_svanasana`,
   `dandayamana_bharmanasana`, `forearm_plank`, `restorative_sequence`.
2. **Đợt 2 – P1 còn lại:** `parsvottanasana`, `prasarita_padottanasana`, `utkata_konasana`, `parsva_tadasana`, `virabhadrasana_3`,
   `vasisthasana`, `parighasana`, `anahatasana`, `matsyasana_supported`, `janu_sirsasana`, `upavistha_konasana`, `virasana`,
   `supta_matsyendrasana`, biến thể `ustrasana_block`, `viparita_karani_block`.
3. **Đợt 3 – cần quyết định / tính năng:** nhóm mới + mức Nâng cao, đạo cụ dây → `supta_padangusthasana`, `sukhasana`, `baddha_konasana`, `malasana`, `apanasana`, `supta_kapotasana`.
4. **Đợt 4 – P2:** ngửa sau trung bình, vặn xoắn đứng, đảo ngược có hỗ trợ, các chuỗi.
5. **Đợt 5 – P3:** sau khi có tiếp xúc thân – thân.

## 5. Checklist cho mỗi tư thế (Definition of done)

- [ ] Pose + `POSE_FIT`, fit chỉ các pose mới (`npm run fit-poses -- <pose>`), khe hở ~0 cm ở mọi support
- [ ] Via pose cho chuyển động thật (nhấc chân trước khi mở, bước từng chân), đã fit
- [ ] Mục asana: roles (theo tài liệu, không theo mô hình), joints, cues / benefits / cautions tiếng Việt, biến thể dễ hơn cho lớp phục hồi
- [ ] `npm run check` và `npm run build` xanh
- [ ] `review-poses` (front, left, top) + khung giữa chuyển động (`--at`) đạt checklist "workshop quality" trong skill
- [ ] Cập nhật bảng này (trạng thái + Tổng quan)
