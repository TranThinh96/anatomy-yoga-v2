# Yoga Anatomy 3D

Ứng dụng web 3D dành cho **giáo viên yoga**: khám phá xương, cơ, khớp và xem các asana
chuyển động với các cơ được tác động được tô sáng theo thời gian thực.

## Tính năng

### Giải phẫu
- **17 nhóm xương, 33 cơ/nhóm cơ, 14 khớp** – nhấp trên mô hình hoặc chọn trong danh sách.
- Cơ sâu bị che (cơ trên gai dưới cơ thang, cơ hình lê dưới cơ mông lớn, cơ vuông thắt lưng…): **nhấp lại
  đúng điểm đó** để chọn lần lượt các lớp nằm bên dưới (cơ nông → cơ sâu → xương → khớp).
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

### Chủ đề workshop
- Tab **Chủ đề**: mỗi chủ đề so sánh một tư thế lệch với tư thế trung tính trên mô hình 3D, để giáo viên
  giảng giải phẫu của một vấn đề cơ thể trong workshop / khoá học. Chủ đề đầu tiên: **Đổ chậu trước**.
- Chọn "trung tính", "tư thế lệch" hoặc "chuyển qua lại" (phím ← → / Space); cơ được tô màu theo độ dài
  so với tư thế trung tính (đỏ = ngắn lại, xanh = dài ra), xương liên quan được tô vàng.
- Danh sách cơ ngắn lại / dài ra được tính trực tiếp từ mô hình; `npm run check` kiểm tra các cơ mà
  nội dung chủ đề ghi là ngắn lại / dài ra thật sự thay đổi như vậy (≥ 1,5 %).
- Nội dung: giải thích, "cần hiểu đúng", quan sát trên lớp, hướng tiếp cận yoga cân bằng – phục hồi,
  asana liên quan (nhấp để mở), lưu ý & khi nào cần giới thiệu đi khám, giới hạn của mô hình.
- Đường link chia sẻ: `#topic/anterior_pelvic_tilt`.

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
3. Lực đỡ từ sàn (đứng + ma sát): trong mọi nghiệm cân bằng ΣF = 0, ΣM = 0, chọn nghiệm có tổng bình
   phương mô-men khớp (chuẩn hoá theo sức mạnh từng khớp) nhỏ nhất — người tập "thả" trọng lượng vào
   điểm tựa, nên tư thế nằm gần như không cần cơ. Điểm tựa chỉ được đẩy (tập hoạt động), lực ngang trong
   nón ma sát μ = 0,8 — bình phương tối thiểu có ràng buộc, giải bằng hệ KKT.
5. Mô-men khớp: tĩnh học ngược trên phần cơ thể phía xa khớp (trọng lực + lực sàn).

### Mức hoạt động cơ & kiểu co (mô hình · thử nghiệm)
> **Thử nghiệm:** đây là ước lượng của mô hình, **chưa đối chiếu với đo EMG thật**. Dùng để minh hoạ xu hướng,
> không trích dẫn như số đo. Vai trò cơ theo tài liệu giải phẫu / EMG nằm ở chế độ tô màu mặc định **"Vai trò"**.

Chế độ tô màu **"Hoạt động"** và mục *Mức hoạt động cơ* trong thẻ cơ sinh học ước lượng **từng cơ làm việc
bao nhiêu % sức tối đa** và **kiểu co**: đồng tâm (ngắn lại khi làm việc), ly tâm (dài ra khi làm việc),
đẳng trường (giữ yên) — theo chiều thay đổi độ dài cơ khi tư thế chuyển động.
1. **Cánh tay đòn cơ** (moment arm) của 136 bó cơ ở mọi khớp chúng bắc qua, tính **giải tích** bằng công ảo
   trên đường đi của cơ: r = −dL/dθ = Σ (wᵢ₋₁·rᵢ₋₁ − wᵢ·rᵢ) × uᵢ (khớp với sai phân hữu hạn < 1 mm).
2. **Mặt bao quanh khớp** (wrapping, kiểu OpenSim): trụ quanh trục gối / khuỷu, cầu quanh chỏm xương cánh tay /
   chỏm xương đùi, để cơ tứ đầu, gân kheo, cơ tam đầu, cơ delta, cơ thắt lưng–chậu không "cắt" qua xương khi
   khớp gập sâu — cánh tay đòn giữ đúng dấu trên toàn tầm vận động dùng trong các tư thế.
   **Nhịp vai–cánh tay**: khung xương chưa có động tác xoay lên của xương bả vai, nên điểm đi qua của cơ lưng rộng
   (trên góc dưới xương bả vai) và nguyên uỷ đầu dài cơ tam đầu xoay theo 1/3 chuyển động của khớp vai (tỷ lệ 2:1,
   Inman et al. 1944). Nhờ vậy khi giơ tay qua đầu hai cơ này vẫn duỗi vai và cơ lưng rộng dài ra tới cuối tầm.
3. **Sức tối đa** mỗi bó cơ theo thiết diện sinh lý (PCSA) trong các mô hình đã công bố: chi dưới — Arnold et al.
   2010 (*Ann Biomed Eng* 38:269); chi trên — Holzbaur et al. 2005 (*Ann Biomed Eng* 33:829); cột sống thắt lưng —
   Christophy et al. 2012 (*Biomech Model Mechanobiol* 11:19); cơ vai–lồng ngực — Seth et al. 2016 (*PLoS ONE*
   11:e0141028); cổ — Vasavada et al. 1998 (*Spine* 23:412). (`src/data/muscle-strength.js`)
4. **Tối ưu tĩnh** (Crowninshield & Brand 1981, *J Biomech* 14:793): tìm mức hoạt động a ∈ [0, 1] của mọi bó cơ
   sao cho Σ a·Fmax·(cánh tay đòn) cân bằng mô-men khớp ở mọi trục, cực tiểu Σ a². Các cơ **chưa có trong mô hình**
   (cơ sâu cột sống & cổ, cơ dưới vai, cơ cánh tay, cơ gập ngón, cơ mác…) và mô mềm được thay bằng "cơ dự phòng"
   có sức giới hạn ở từng trục khớp; phần chúng gánh được hiển thị để thấy chỗ mô hình còn thiếu.
   Giải chính xác qua bài toán đối ngẫu (Newton + tìm theo tia), ~1 ms mỗi khung hình.
5. Chọn một cơ: thẻ cơ hiển thị mức hoạt động, lực (N), kiểu co và **cánh tay đòn ở tư thế hiện tại**; trong chế độ
   Giải phẫu hiển thị cánh tay đòn ở tư thế giải phẫu và sức tối đa. Bảng so sánh biến thể có thêm các cơ làm việc
   nhiều nhất.

Kiểm tra (`npm run check`): cánh tay đòn giải tích = sai phân hữu hạn; dấu tác dụng của 44 cặp cơ–khớp đúng sách
giải phẫu ở tư thế giải phẫu và giữ đúng trên tầm vận động; mô-men cơ + dự phòng tái tạo đúng mô-men khớp ở cả
33 tư thế; mức hoạt động trong [0, 1]. Mọi cơ vẫn nhấp chọn được sau khi đổi tư thế (tia chiếu vào bụng từng cơ ở mọi tư thế
phải trúng cơ đó).

Giới hạn: chỉ tính tư thế giữ yên (không tính lực quán tính khi chuyển động); chưa tính dây chằng, mô mềm
và tiếp xúc giữa các phần cơ thể (vd. đùi tựa lên bắp chân trong Balasana); tải hiển thị là mức tối thiểu
khi người tập đẩy sàn khéo léo. Mức hoạt động cơ chưa tính **sức căng thụ động** của cơ bị kéo giãn (ở tư thế
gập sâu, cơ bị kéo giãn gánh một phần tải — app cảnh báo khi gặp) và không mô tả đồng co (co chống nhau để giữ
vững khớp). Đai vai là một đoạn cứng quay quanh khớp ức–đòn, chưa tựa lên lồng ngực: cơ nào kéo xương bả vai
(như cơ lưng rộng) bị mô hình "ngại" dùng, nên ở tư thế tay qua đầu (Chó úp mặt) nhóm chóp xoay vẫn bị tính cao. Dùng để **so sánh xu hướng**, không thay thế đo EMG
hay số đo lâm sàng.

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
  Gân không có trong BodyParts3D được nối tới mốc xương: gân Achilles → củ xương gót (điểm sau nhất của
  1/3 giữa xương gót), gân nhị đầu → lồi củ xương quay.
- **Điểm chạm sàn** (gót, ụ đốt bàn chân, ụ ngồi, mông, bụng, bả vai…) và **mốc nhân trắc** cho lớp
  cơ sinh học cũng lấy từ bề mặt xương / cơ.
- Cánh tay được xoay quanh tâm vai cho thẳng đứng (tư thế trung tính của khung xương); bên phải là ảnh
  gương của bên trái. Mesh xương giảm từ 1,13 triệu còn 124 nghìn tam giác (1,1 MB).
- **Hình cơ thật (tab Giải phẫu)**: bề mặt 67 bộ phận cơ BodyParts3D thuộc 33 cơ/nhóm cơ (vd. nhóm
  cơ khép gồm cả cơ thon), giảm từ 4,18 triệu còn 110 nghìn tam giác mỗi bên (1,2 MB) bằng
  meshoptimizer. Mỗi đỉnh bám theo đoạn chi có xương gần nhất, trong vùng 4 cm giữa hai đoạn thì pha
  trộn hai đoạn (skinning), nên cơ vắt qua khớp (cơ ngực lớn: sườn → xương cánh tay) không bị rách.
  Nút **Cơ: hình thật / đường lực** chuyển giữa mesh thật và dạng ống. Ở tab Asana và Chủ đề cơ luôn là
  ống: mesh thật chưa biến dạng đúng khi khớp gập sâu. `npm run check` kiểm tra đường lực của mọi bó cơ
  nằm trong 4 cm quanh mesh cơ thật.

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
npm run check      # kiểm tra dữ liệu, vật lý mọi tư thế, mô hình cơ, nhấp chọn cơ trên mô hình
npm run fit-poses -- <tư thế…>  # tự chỉnh góc khớp để đúng bộ phận chạm sàn (ghi vào src/data/poses.js)
npm run build-model -- <thư mục BodyParts3D_data>  # dựng lại khung xương, cơ, mốc từ BodyParts3D
```

### CI & xuất bản
- `.github/workflows/ci.yml`: mỗi pull request (và mỗi lần push vào `main`) chạy `npm ci`, `npm run check`, `npm run build`.
- `.github/workflows/pages.yml`: push vào `main` → kiểm tra, build và đưa `dist/` lên **GitHub Pages**
  (địa chỉ dạng `https://<tài khoản>.github.io/<repo>/`). Cần bật một lần: *Settings → Pages → Source: GitHub Actions*.

## Cấu trúc

```
src/
  anatomy/rig.js            Khung xương khớp (FK), quy ước góc khớp, tiếp đất
  anatomy/muscles.js        Cơ dạng ống bám theo xương, bao quanh khớp: tự dài/ngắn/phình theo tư thế
  anatomy/muscleForces.js   Cánh tay đòn cơ, tối ưu tĩnh (mức hoạt động), kiểu co
  anatomy/animator.js       Nội suy tư thế (quaternion), neo tay/chân trên sàn
  anatomy/physics.js        Trọng tâm, chân đế, lực sàn ít tốn sức nhất (có ma sát), mô-men khớp, tự cân bằng
  anatomy/bp3d.js           Nạp mesh xương (public/models/bp3d/skeleton.bin)
  anatomy/realMuscles.js    Nạp + skinning mesh cơ thật (public/models/bp3d/muscles.bin, tab Giải phẫu)
  data/body-model.gen.js    Tâm khớp, điểm bám & đường đi cơ, điểm chạm sàn, mốc (sinh tự động)
  data/anthropometry.js     Khối lượng / trọng tâm đoạn cơ thể (de Leva 1996)
  data/muscle-strength.js   Sức tối đa từng bó cơ (PCSA, có nguồn)
  data/poses.js             Góc khớp của từng tư thế
  data/asanas.js            Asana: chuỗi chuyển động, vai trò cơ, cue, lưu ý
  data/topics.js            Chủ đề workshop: cặp tư thế so sánh, cơ ngắn lại / dài ra, nội dung giảng dạy
  data/{bones,muscles,joints}.js  Nội dung giải phẫu tiếng Việt
tools/                      bp3d-build, fit-poses, check-*, shot (chụp màn hình)
```

### Thêm một asana mới
1. Khai báo góc khớp trong `src/data/poses.js` (độ; xem chú thích `semanticToQuat` trong `rig.js`
   về dấu của từng góc – vd. `hip: { flex, abd, rot }`, `knee: { flex }`), thêm mục `POSE_FIT`
   (bộ phận phải chạm sàn + góc được phép chỉnh) rồi chạy `npm run fit-poses -- <tên tư thế>` và `npm run check`.
2. Thêm mục trong `src/data/asanas.js` với `steps` (tư thế bắt đầu → tư thế đích, `anchor` là khớp
   giữ cố định trên sàn) và `roles` (`contract` / `stretch` / `stabilize`; thêm hậu tố `_L`/`_R`
   cho cơ một bên).
3. Xem thử: `node tools/shot.mjs asana/<id> anh.png --hold`, hoặc rà soát hàng loạt từ nhiều góc:
   `node tools/review-poses.mjs <thư-mục> [asana…] --views front,left,top`.
   `npm run check` còn kiểm tra cơ ghi "kéo giãn" phải thật sự dài ra (≥ 2,5 %) trong tư thế đó.

Quy trình đầy đủ (kèm các lỗi hay gặp) nằm trong skill `.claude/skills/add-asana/SKILL.md`;
với Claude Code chỉ cần gõ `/add-asana <tên tư thế>`. `CLAUDE.md` tóm tắt kiến trúc và quy ước cho các phiên làm việc với Claude.

## Giấy phép & ghi nguồn
- Mã nguồn của dự án này.
- Mô hình xương trong `public/models/bp3d/` và dữ liệu giải phẫu trong `src/data/body-model.gen.js`: **BodyParts3D, © The Database Center for Life Science,
  licensed under CC Attribution-Share Alike 2.1 Japan** (qua bản STL của
  [Kevin-Mattheus-Moerman/BodyParts3D](https://github.com/Kevin-Mattheus-Moerman/BodyParts3D)).
  Các dữ liệu dẫn xuất được phân phối theo cùng giấy phép CC BY-SA 2.1 JP — xem `public/models/bp3d/LICENSE.txt`.

> Mô hình là mô hình giáo dục đã được đơn giản hoá (cơ biểu diễn bằng các bó sợi),
> không thay thế tài liệu giải phẫu chuyên sâu hay tư vấn y khoa.
