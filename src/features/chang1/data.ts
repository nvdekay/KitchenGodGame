/**
 * Chặng 1 — "Hồ sơ thất lạc" (Giai đoạn 1996–2015).
 *
 * All editorial content for the stage-1 game lives here: the story intro, the
 * five questions with their distractor feedback, and the victory reveal.
 *
 * ⚠ The prompt text and option ORDER of every question must stay in sync with
 * the seed in supabase/migrations/0006_chang1_hoso_thatlac.sql — the run is
 * graded server-side through submit_stage() against those seeded rows.
 */

export interface Chang1Option {
  text: string;
  /** Lý do nhiễu — why this tempting distractor is wrong (shown when picked).
   *  The correct option has none. */
  reason?: string;
}

export interface Chang1Question {
  /** 1-based, matches questions.ord in the DB. */
  ord: number;
  prompt: string;
  options: Chang1Option[];
  correctIndex: number;
  /** 💡 Giải thích "vỡ ra" — shown after answering correctly. */
  explanation: string;
}

export const QUESTIONS: Chang1Question[] = [
  {
    ord: 1,
    prompt: 'Việt Nam chính thức gia nhập WTO vào năm nào?',
    options: [
      { text: '1995', reason: 'Đây là năm Việt Nam gia nhập ASEAN, nhiều bạn dễ nhầm.' },
      { text: '2006', reason: 'Năm tổ chức APEC tại Việt Nam, diễn ra trước WTO 1 năm.' },
      { text: '2007' },
      { text: '2000', reason: 'Năm ký Hiệp định Thương mại Việt – Mỹ.' },
      { text: '2010', reason: 'Năm Việt Nam đảm nhiệm Chủ tịch ASEAN.' },
      { text: '1998', reason: 'Năm Việt Nam gia nhập APEC.' },
    ],
    correctIndex: 2,
    explanation:
      'WTO 2007 là cột mốc hội nhập sâu nhất, mở cửa thị trường cho hàng Việt Nam tiếp cận toàn cầu.',
  },
  {
    ord: 2,
    prompt: '"Công nghiệp hóa, hiện đại hóa" được Đảng xác định là nhiệm vụ gì?',
    options: [
      { text: 'Xây dựng nông thôn mới', reason: 'Đúng nhưng không phải nhiệm vụ trọng tâm giai đoạn này.' },
      { text: 'Phát triển kinh tế biển', reason: 'Là chiến lược nhưng không phải trọng tâm thời kỳ này.' },
      { text: 'Nâng cao năng lực sản xuất' },
      { text: 'Xuất khẩu nông sản', reason: 'Nhiệm vụ quan trọng nhưng không bao trùm.' },
      { text: 'Thu hút vốn đầu tư', reason: 'Là giải pháp, không phải mục tiêu chính.' },
      { text: 'Chuyển đổi số', reason: 'Là giai đoạn sau (2016–2024), chưa có trong 1996–2015.' },
    ],
    correctIndex: 2,
    explanation:
      'CNH – HĐH là chiến lược xuyên suốt để nâng cao năng lực sản xuất, nền tảng để hội nhập thành công.',
  },
  {
    ord: 3,
    prompt: 'Thu hút FDI (vốn đầu tư nước ngoài) đem lại lợi ích gì cho Việt Nam?',
    options: [
      { text: 'Tăng thu ngân sách', reason: 'Đúng nhưng chỉ là một trong nhiều lợi ích.' },
      { text: 'Thu hút vốn và công nghệ' },
      { text: 'Tạo thêm việc làm', reason: 'Đúng nhưng là kết quả thứ cấp.' },
      { text: 'Xuất khẩu lao động', reason: 'Không liên quan đến FDI.' },
      { text: 'Phát triển du lịch', reason: 'Là ngành khác, không phải bản chất FDI.' },
      { text: 'Xây dựng hạ tầng', reason: 'Đúng nhưng là một phần, không phải cốt lõi.' },
    ],
    correctIndex: 1,
    explanation:
      'FDI mang lại vốn, công nghệ và kỹ năng quản lý, là động lực chính giúp Việt Nam tăng trưởng.',
  },
  {
    ord: 4,
    prompt: '"Kinh tế nhiều thành phần" trong thời kỳ đổi mới có ý nghĩa gì?',
    options: [
      { text: 'Nhà nước độc quyền', reason: 'Là tư duy cũ trước đổi mới.' },
      { text: 'Các thành phần cùng phát triển' },
      { text: 'Chỉ phát triển nhà nước', reason: 'Không đúng với tinh thần đổi mới.' },
      { text: 'Xóa bỏ kinh tế tư nhân', reason: 'Ngược với chủ trương của Đảng.' },
      { text: 'Tập trung hóa kế hoạch', reason: 'Là mô hình cũ.' },
      { text: 'Bao cấp hoàn toàn', reason: 'Đã bị bãi bỏ từ thời kỳ trước.' },
    ],
    correctIndex: 1,
    explanation:
      'Thừa nhận kinh tế nhiều thành phần là bước đột phá từ cơ chế bao cấp sang kinh tế thị trường định hướng XHCN.',
  },
  {
    ord: 5,
    prompt: 'Hội nhập kinh tế quốc tế là chủ trương nhằm mục đích gì?',
    options: [
      { text: 'Đóng cửa thị trường', reason: 'Trái ngược với hội nhập.' },
      { text: 'Mở rộng hợp tác quốc tế' },
      { text: 'Chỉ xuất khẩu nông sản', reason: 'Quá hẹp, không bao quát.' },
      { text: 'Giảm nhập khẩu', reason: 'Không đúng, hội nhập là hai chiều.' },
      { text: 'Bảo hộ sản xuất trong nước', reason: 'Là biện pháp của thời kỳ bao cấp.' },
      { text: 'Tách khỏi thế giới', reason: 'Trái ngược với đường lối của Đảng.' },
    ],
    correctIndex: 1,
    explanation:
      'Hội nhập kinh tế quốc tế nhằm mở rộng hợp tác với thế giới, đưa hàng hoá, nguồn vốn và vị thế Việt Nam vươn ra toàn cầu.',
  },
];

/** Cốt truyện mở màn. */
export const STORY = {
  chapter: 'CHẶNG 1',
  title: 'Hồ sơ thất lạc',
  period: 'Giai đoạn 1996 – 2015',
  beats: [
    'Canh ba, gà chưa gáy. Cổng thiên đình sắp mở, các Táo tay ôm sớ xếp hàng chờ vào chầu Ngọc Hoàng.',
    'Bỗng… VÙ! Một cơn gió lốc quét ngang lưng trời. Bản báo cáo của một vị Táo bung tung toé, bao nhiêu trang hồ sơ quý giá bay lẫn vào tài liệu của các giai đoạn khác!',
    'Không có báo cáo, Táo không thể vào chầu. Hãy giúp Táo nhặt đúng những THẺ THÔNG TIN thuộc giai đoạn 1996–2015 để ghép lại bản báo cáo hoàn chỉnh!',
  ],
  howto: [
    '☁️ Các thẻ đáp án trôi qua lại trên trời',
    '👆 Chạm vào thẻ ĐÚNG với câu hỏi',
    '⏳ Chọn sai phải chờ 4 giây mới được chọn tiếp',
    '💡 Chọn đúng: đồng hồ tạm dừng 10 giây để bạn đọc thông điệp',
    '📜 Đúng cả 5 câu để hoàn thiện hồ sơ',
  ],
  cta: 'Bắt đầu tìm hồ sơ',
};

/** Màn chiến thắng — mở khoá danh tính Táo. */
export const VICTORY = {
  heading: 'Vượt ải thành công!',
  period: 'Giai đoạn 1996 – 2015',
  unlockLabel: 'Danh tính được mở khóa',
  taoName: 'Táo Hội Nhập',
  intro:
    'Đây là vị Táo đại diện cho giai đoạn 1996–2015, khi Việt Nam đẩy mạnh công nghiệp hóa, hiện đại hóa và hội nhập kinh tế quốc tế. Việc mở rộng hợp tác, gia nhập WTO và thu hút đầu tư nước ngoài đã tạo động lực quan trọng cho tăng trưởng kinh tế và nâng cao vị thế của Việt Nam trên trường quốc tế.',
};
