// Workshop topics: a body condition taught by comparing two poses on the 3D model.
// compare: [reference pose, condition pose] (pose ids from poses.js); the muscles are coloured by
// their length in the condition pose relative to the reference pose.
// shorter / longer: muscles the text says shorten / lengthen – `npm run check` fails when the
// model does not agree (tools/check-muscles.mjs).
// joints / bones: ids from joints.js / bones.js that are highlighted on the model.
// asanas: related asanas (ids from asanas.js) with a note on why they belong to the topic.

export const TOPICS = [
  {
    id: 'anterior_pelvic_tilt',
    title: 'Đổ chậu trước',
    en: 'Anterior pelvic tilt',
    area: 'Tư thế · Khung chậu & thắt lưng',
    compare: [
      { pose: 'tadasana', label: 'Khung chậu trung tính' },
      { pose: 'anterior_pelvic_tilt', label: 'Đổ chậu trước' },
    ],
    view: [1, 0.1, 0.25],
    joints: ['hip', 'lumbar_spine_joint', 'sacroiliac'],
    bones: ['pelvis', 'sacrum', 'lumbar_spine'],
    shorter: ['iliopsoas', 'erector_spinae', 'quadratus_lumborum'],
    longer: ['rectus_abdominis', 'external_oblique', 'gluteus_maximus', 'hamstrings'],
    intro:
      'Khung chậu xoay ra trước quanh trục ngang qua hai khớp háng: phía trước khung chậu (gai chậu trước trên) hạ xuống và ra trước, xương cùng ngả lên – ra sau. Để thân trên vẫn thẳng, cột sống thắt lưng phải duỗi thêm, nên đổ chậu trước luôn đi kèm thắt lưng ưỡn nhiều hơn.',
    sections: [
      {
        title: 'Mô hình 3D cho thấy gì',
        items: [
          'Khung chậu ở đây nghiêng thêm 10° so với tư thế đứng của mô hình – con số chỉ để minh hoạ, không phải ngưỡng "bình thường" hay "bệnh lý".',
          'Khớp háng ở tư thế gập nhẹ dù đùi vẫn thẳng đứng; cột sống thắt lưng duỗi thêm.',
          'Ngắn lại: cơ thắt lưng chậu (bắc qua mặt trước khớp háng), cơ dựng sống và cơ vuông thắt lưng.',
          'Dài ra: cơ thẳng bụng, cơ chéo bụng ngoài, cơ mông lớn và nhóm cơ đùi sau.',
          'Đây là thay đổi hình học của đường đi của cơ. Mô hình không đo được cơ nào yếu, cơ nào căng cứng.',
        ],
      },
      {
        title: 'Cần hiểu đúng',
        items: [
          'Khi đứng, khung chậu của phần lớn mọi người đều nghiêng ra trước một chút; mức độ khác nhau nhiều giữa các cá nhân, và hình dạng xương chậu cũng làm thay đổi vẻ bề ngoài.',
          'Mô hình "hội chứng chéo dưới" (Janda) – gập háng và dựng sống căng, cơ bụng và cơ mông yếu – được dùng rộng rãi khi giảng dạy, nhưng là một mô hình lâm sàng, không phải quy luật đã được đo đạc chắc chắn.',
          'Mối liên hệ giữa độ nghiêng khung chậu và đau thắt lưng chưa rõ ràng. Tránh "chẩn đoán" học viên bằng mắt và tránh gieo nỗi sợ về tư thế.',
        ],
      },
      {
        title: 'Quan sát trên lớp',
        items: [
          'Nhìn nghiêng khi học viên đứng tự nhiên: vị trí gai chậu trước trên so với xương mu, độ cong thắt lưng, bụng có đẩy ra trước không, gối có duỗi quá không.',
          'Quan sát trong chuyển động hơn là một khoảnh khắc: học viên có đưa khung chậu về trung tính được khi hướng dẫn không (ví dụ trong Mèo – Bò, Cây cầu)?',
          'Hỏi cảm nhận: có khó chịu vùng thắt lưng khi đứng lâu hay khi ngửa sau không.',
        ],
      },
      {
        title: 'Hướng tiếp cận yoga cân bằng – phục hồi',
        items: [
          'Nhận biết: cho học viên cảm nhận nghiêng chậu trước – sau khi nằm ngửa co gối và trong Mèo – Bò, rồi tự tìm vị trí trung tính dễ chịu.',
          'Kéo dài nhẹ nhóm gập háng ở chân sau (tư thế lunge, Chiến binh I với khung chậu hơi cuộn sau), không ép sâu.',
          'Kích hoạt cơ mông lớn và đùi sau (Cây cầu), cơ bụng (Tấm ván) – ưu tiên cảm nhận hơn cường độ.',
          'Thả lỏng vùng thắt lưng trong tư thế nghỉ (Em bé) kết hợp thở chậm.',
          'Mục tiêu là khung chậu linh hoạt và kiểm soát được theo cả hai chiều, không phải "sửa" về một góc cố định.',
        ],
      },
    ],
    asanas: [
      ['tadasana', 'Tìm khung chậu trung tính khi đứng'],
      ['marjaryasana_bitilasana', 'Cảm nhận nghiêng chậu trước (Bò) và sau (Mèo)'],
      ['virabhadrasana_1', 'Kéo dài cơ thắt lưng chậu ở chân sau'],
      ['setu_bandha', 'Kích hoạt cơ mông lớn và đùi sau'],
      ['phalakasana', 'Cơ bụng giữ khung chậu và thắt lưng trung tính'],
      ['balasana', 'Thả lỏng cơ dựng sống và vuông thắt lưng'],
    ],
    cautions: [
      'Đau lan xuống chân, tê hoặc yếu chân, đau tăng về đêm hoặc sau chấn thương: dừng tập và khuyên học viên đi khám bác sĩ / chuyên viên vật lý trị liệu.',
      'Phụ nữ mang thai: thắt lưng ưỡn và khung chậu nghiêng trước nhiều hơn là thay đổi tự nhiên – không cố "sửa", tập theo hướng dẫn yoga bầu.',
      'Thắt lưng khó chịu khi ưỡn: tránh ngửa sau sâu, giữ biên độ nhỏ.',
      'Không hứa hẹn yoga "chữa" được đổ chậu; yoga hỗ trợ nhận biết, vận động và thư giãn.',
    ],
    limits: [
      'Một người mẫu nam cao 1,64 m, nửa phải là bản đối xứng của nửa trái.',
      'Cơ chỉ được mô tả bằng độ dài; mô hình không có sức căng thụ động và không đo sức mạnh cơ.',
      'Chưa có các cơ sâu: cơ nhiều chân, cơ ngang bụng, cơ chéo bụng trong, cơ sàn chậu.',
    ],
  },
  {
    id: 'posterior_pelvic_tilt',
    title: 'Đổ chậu sau (lưng phẳng)',
    en: 'Posterior pelvic tilt / flat back',
    area: 'Tư thế · Khung chậu & thắt lưng',
    compare: [
      { pose: 'tadasana', label: 'Khung chậu trung tính' },
      { pose: 'posterior_pelvic_tilt', label: 'Đổ chậu sau' },
    ],
    view: [1, 0.1, 0.25],
    joints: ['hip', 'lumbar_spine_joint', 'sacroiliac'],
    bones: ['pelvis', 'sacrum', 'lumbar_spine'],
    shorter: ['gluteus_maximus', 'rectus_abdominis', 'external_oblique'],
    longer: ['erector_spinae', 'quadratus_lumborum'],
    intro:
      'Ngược với đổ chậu trước: khung chậu xoay ra sau quanh trục ngang qua hai khớp háng – xương mu nhô lên, xương cùng hướng xuống dưới và ra trước. Để thân trên vẫn thẳng, cột sống thắt lưng gập lại, đường cong thắt lưng phẳng đi; mông trông "cụp" xuống.',
    sections: [
      {
        title: 'Mô hình 3D cho thấy gì',
        items: [
          'Khung chậu ở đây nghiêng ra sau 10° so với tư thế đứng của mô hình – con số chỉ để minh hoạ, đối xứng với chủ đề đổ chậu trước.',
          'Khớp háng duỗi nhẹ dù đùi vẫn thẳng đứng; cột sống thắt lưng gập thêm.',
          'Ngắn lại: cơ mông lớn (và cơ mông nhỡ), cơ thẳng bụng và cơ chéo bụng ngoài.',
          'Dài ra: cơ dựng sống và cơ vuông thắt lưng; cơ thắt lưng chậu dài ra một chút.',
          'Nhóm cơ gân kheo (đùi sau) trên mô hình chỉ ngắn đi khoảng 1 % vì đùi vẫn thẳng đứng và gối không đổi – điều thường được nói ("gân kheo ngắn kéo khung chậu ra sau") là giả thuyết về sức căng, mô hình không kiểm tra được.',
          'Đây là thay đổi hình học của đường đi của cơ. Mô hình không đo được cơ nào yếu, cơ nào căng cứng.',
        ],
      },
      {
        title: 'Cần hiểu đúng',
        items: [
          'Độ cong thắt lưng khác nhau nhiều giữa các cá nhân; lưng phẳng hơn mức trung bình không có nghĩa là có vấn đề.',
          'Ngồi lâu trên ghế mềm, ngồi sụp, hay thói quen "kẹp mông" khi đứng đều có thể làm khung chậu nghiêng sau – quan sát cả cách học viên ngồi.',
          'Trên lớp yoga, gợi ý "cuộn xương cụt xuống" dùng quá mức có thể khiến học viên đứng đổ chậu sau thường xuyên; hướng dẫn tìm vị trí trung tính hơn là một chiều cố định.',
          'Mối liên hệ giữa độ nghiêng khung chậu và đau thắt lưng chưa rõ ràng. Tránh "chẩn đoán" học viên bằng mắt.',
        ],
      },
      {
        title: 'Quan sát trên lớp',
        items: [
          'Nhìn nghiêng khi học viên đứng tự nhiên: thắt lưng phẳng, mông cụp, gối có thể hơi chùng, đầu và ngực có thể đưa ra trước để bù.',
          'Khi ngồi Dandasana hay Sukhasana: học viên có ngồi lên được ụ ngồi hay bị lăn ra sau lên xương cùng, lưng tròn không? Kê chăn gấp dưới mông giúp khung chậu dựng lên.',
          'Khi gập người: chuyển động có đến từ khớp háng hay chủ yếu từ việc tròn thắt lưng?',
        ],
      },
      {
        title: 'Hướng tiếp cận yoga cân bằng – phục hồi',
        items: [
          'Nhận biết: cho học viên cảm nhận nghiêng chậu trước – sau trong Mèo – Bò và khi nằm ngửa co gối, rồi tự tìm vị trí trung tính dễ chịu.',
          'Gập người từ khớp háng với lưng dài (Ardha Uttanasana, gập người ngồi trên chăn gấp), gối chùng nếu cần.',
          'Kéo dài nhẹ nhóm cơ gân kheo với dây (Supta Padangusthasana), không ép.',
          'Đánh thức cơ dựng sống trong các tư thế ngửa nhẹ nằm sấp (Nhân sư, Châu chấu) với biên độ vừa phải.',
          'Mục tiêu là khung chậu linh hoạt và kiểm soát được theo cả hai chiều, không phải "sửa" về một góc cố định.',
        ],
      },
    ],
    asanas: [
      ['tadasana', 'Tìm khung chậu trung tính khi đứng'],
      ['marjaryasana_bitilasana', 'Cảm nhận nghiêng chậu trước (Bò) và sau (Mèo)'],
      ['ardha_uttanasana', 'Gập từ khớp háng với lưng dài'],
      ['supta_padangusthasana', 'Kéo dài nhóm cơ gân kheo với dây'],
      ['salamba_bhujangasana', 'Ngửa nhẹ, đánh thức cơ dựng sống'],
      ['salabhasana', 'Cơ dựng sống và cơ mông làm việc cùng nhau'],
      ['dandasana', 'Ngồi lên ụ ngồi, kê chăn nếu lưng bị tròn'],
    ],
    cautions: [
      'Đau lan xuống chân, tê hoặc yếu chân, đau tăng về đêm hoặc sau chấn thương: dừng tập và khuyên học viên đi khám bác sĩ / chuyên viên vật lý trị liệu.',
      'Thoát vị đĩa đệm hay đau thắt lưng khi gập người: tránh gập người tròn lưng sâu; hỏi ý kiến bác sĩ trước khi tập.',
      'Lưng cứng, đau tăng dần nhiều tháng ở người trẻ, cứng buổi sáng kéo dài: khuyên đi khám – có thể là bệnh lý viêm cột sống, không phải vấn đề tư thế.',
      'Không hứa hẹn yoga "chữa" được lưng phẳng; yoga hỗ trợ nhận biết, vận động và thư giãn.',
    ],
    limits: [
      'Một người mẫu nam cao 1,64 m, nửa phải là bản đối xứng của nửa trái.',
      'Cơ chỉ được mô tả bằng độ dài; mô hình không có sức căng thụ động và không đo sức mạnh cơ.',
      'Chưa có các cơ sâu: cơ nhiều chân, cơ ngang bụng, cơ chéo bụng trong, cơ sàn chậu.',
    ],
  },
  {
    id: 'thoracic_kyphosis',
    title: 'Gù lưng trên – vai và đầu đưa ra trước',
    en: 'Rounded upper back, shoulders and head forward',
    area: 'Tư thế · Cột sống ngực, đai vai & cổ',
    compare: [
      { pose: 'tadasana', label: 'Đứng thẳng' },
      { pose: 'thoracic_kyphosis', label: 'Lưng trên tròn, vai và đầu ra trước' },
    ],
    view: [1, 0.25, 0.35],
    joints: ['thoracic_spine_joint', 'scapulothoracic', 'cervical_spine_joint', 'atlanto_occipital'],
    bones: ['thoracic_spine', 'scapula', 'cervical_spine', 'skull'],
    shorter: ['pectoralis_minor', 'pectoralis_major', 'serratus_anterior', 'rectus_abdominis', 'sternocleidomastoid'],
    longer: ['rhomboids', 'trapezius', 'levator_scapulae', 'erector_spinae'],
    intro:
      'Ba thay đổi thường đi cùng nhau: cột sống ngực cong ra sau nhiều hơn (lưng trên tròn), hai xương bả vai trượt ra trước quanh lồng ngực (vai tròn), và đầu đưa ra trước so với thân. Để mắt vẫn nhìn thẳng, phần cổ dưới gập lại trong khi đầu ngửa trên đốt cổ trên cùng.',
    sections: [
      {
        title: 'Mô hình 3D cho thấy gì',
        items: [
          'Cột sống ngực gập thêm 15°, xương bả vai đưa ra trước 15°, cổ dưới gập 10° và đầu ngửa 25° trên cổ – các con số chỉ để minh hoạ, không phải ngưỡng "bình thường" hay "bệnh lý".',
          'Ngắn lại: cơ ngực bé và cơ ngực lớn (phía trước vai), cơ răng cưa trước (kéo xương bả vai ra trước), cơ thẳng bụng và cơ ức đòn chũm.',
          'Dài ra: cơ trám và cơ thang (giữa hai xương bả vai), cơ nâng vai, cơ dựng sống.',
          'Cơ nâng vai dài ra trên mô hình vì xương bả vai trượt ra trước, xa đốt cổ. Mô hình "hội chứng chéo trên" lại xếp cơ nâng vai và phần trên cơ thang vào nhóm "căng" – căng (sức căng, cảm giác) không giống ngắn (độ dài); mô hình chỉ thấy độ dài.',
          'Cơ thang trên mô hình là một dải duy nhất, không tách phần trên / giữa / dưới.',
        ],
      },
      {
        title: 'Cần hiểu đúng',
        items: [
          'Cột sống ngực vốn cong ra sau; độ cong khác nhau nhiều giữa các cá nhân và tăng dần theo tuổi.',
          '"Hội chứng chéo trên" (Janda) – cơ ngực và cổ sau căng, cơ trám, cơ răng cưa trước và cơ gập cổ sâu yếu – là một mô hình lâm sàng dùng nhiều khi giảng dạy, không phải quy luật đã đo đạc chắc chắn.',
          'Mối liên hệ giữa tư thế đầu ra trước và đau cổ chưa rõ ràng. Không có một tư thế "đúng" duy nhất; ngồi một tư thế quá lâu, dù là tư thế nào, thường khó chịu hơn việc thay đổi tư thế thường xuyên.',
          'Gù cứng do biến dạng đốt sống (ví dụ bệnh Scheuermann, gãy lún đốt sống do loãng xương) không thay đổi khi đứng thẳng lên – khác với lưng tròn do thói quen.',
        ],
      },
      {
        title: 'Quan sát trên lớp',
        items: [
          'Nhìn nghiêng: dái tai so với đỉnh vai, độ tròn của lưng trên, xương bả vai có "bè" ra hai bên không.',
          'Học viên có tự đứng thẳng lên được khi hướng dẫn không? Lưng tròn thay đổi được là dấu hiệu của thói quen hơn là cấu trúc.',
          'Khi giơ tay lên cao: cánh tay có lên được sát tai mà không ưỡn thắt lưng bù không?',
        ],
      },
      {
        title: 'Hướng tiếp cận yoga cân bằng – phục hồi',
        items: [
          'Mở ngực có hỗ trợ: nằm trên gối ôm hoặc chăn cuộn dọc cột sống (Cá có hỗ trợ), thở chậm vào lồng ngực.',
          'Ngửa nhẹ lưng trên: Nhân sư, Rắn hổ mang thấp, Châu chấu – chú ý chuyển động đến từ lưng trên chứ không dồn vào thắt lưng.',
          'Duỗi cột sống ngực khi chống tay: Bò trong Mèo – Bò, tư thế Chó con (Anahatasana) với biên độ vừa phải.',
          'Kéo nhẹ hai xương bả vai về sau – xuống trong Tadasana và khi giơ tay; cảm nhận hơn là gồng.',
          'Đưa cằm nhẹ ra sau (không cúi) để cảm nhận đầu nằm trên cột sống; tập khi ngồi và đứng.',
        ],
      },
    ],
    asanas: [
      ['tadasana', 'Đầu, ngực và vai xếp chồng lên khung chậu'],
      ['matsyasana_supported', 'Mở ngực có hỗ trợ, thả lỏng cơ ngực'],
      ['salamba_bhujangasana', 'Ngửa nhẹ lưng trên'],
      ['bhujangasana', 'Duỗi cột sống ngực, kéo vai về sau'],
      ['salabhasana', 'Đánh thức cơ trám, cơ thang và cơ dựng sống'],
      ['anahatasana', 'Duỗi cột sống ngực với tay vươn ra trước'],
      ['marjaryasana_bitilasana', 'Cảm nhận gập – duỗi cột sống ngực'],
    ],
    cautions: [
      'Gù tăng nhanh, đau lưng ngực sau một cú ngã hay ở người lớn tuổi có nguy cơ loãng xương: khuyên đi khám trước khi tập – tránh gập người tròn lưng sâu và vặn mạnh.',
      'Tê, yếu tay, đau lan xuống cánh tay, chóng mặt khi ngửa cổ: dừng tập và khuyên học viên đi khám bác sĩ / chuyên viên vật lý trị liệu.',
      'Gù ở trẻ em và thanh thiếu niên đang lớn: nên được bác sĩ đánh giá.',
      'Không ngửa cổ ra sau mạnh trong các tư thế ngửa; giữ cổ dài.',
      'Không hứa hẹn yoga "chữa" được gù lưng; yoga hỗ trợ nhận biết, vận động và thư giãn.',
    ],
    limits: [
      'Một người mẫu nam cao 1,64 m, nửa phải là bản đối xứng của nửa trái.',
      'Cột sống ngực là một khớp duy nhất và lồng ngực cứng; xương bả vai chỉ nâng – hạ và đưa ra trước – sau quanh khớp ức đòn, chưa xoay lên – xuống.',
      'Cơ chỉ được mô tả bằng độ dài; mô hình không có sức căng thụ động và không đo sức mạnh cơ.',
      'Chưa có các cơ gập cổ sâu, cơ dưới chẩm và cơ nhiều chân.',
    ],
  },
];

export const TOPIC_BY_ID = Object.fromEntries(TOPICS.map((t) => [t.id, t]));
