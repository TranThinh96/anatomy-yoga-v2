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
];

export const TOPIC_BY_ID = Object.fromEntries(TOPICS.map((t) => [t.id, t]));
