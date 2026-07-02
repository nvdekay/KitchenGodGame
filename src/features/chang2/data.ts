/**
 * Chặng 2 — "Báo cáo bị xáo trộn" (Giai đoạn 2016–2024).
 *
 * All editorial content for the stage-2 memory game: the story intro, the eight
 * document pairs (each with its educational pop-up), the five meme distractor
 * cards, and the victory reveal. Asset filenames in /public/chang2 are
 * self-describing (pair-*.webp, meme-*.webp, card-back.webp, board-bg.webp).
 */

export interface PairDef {
  id: string;
  img: string;
  /** Pop-up heading when the pair is matched. */
  title: string;
  /** Pop-up body — the educational "vỡ ra" payload. */
  content: string;
}

export interface MemeDef {
  id: string;
  img: string;
  /** The meme's own punchline, shown big in the trap pop-up. */
  caption: string;
}

export const PAIRS: PairDef[] = [
  {
    id: 'can-cuoc',
    img: '/chang2/pair-can-cuoc.webp',
    title: 'Căn cước công dân gắn chip',
    content:
      'Khai tử Sổ hộ khẩu giấy (Đề án 06). Đổi mới quản lý hành chính giúp tiết kiệm hàng ngàn tỷ đồng và hàng triệu giờ đi lại của người dân.',
  },
  {
    id: 'cong-dvc',
    img: '/chang2/pair-cong-dvc.webp',
    title: 'Cổng Dịch vụ công Quốc gia',
    content:
      'Chính phủ Điện tử. Ngồi tại nhà click chuột cũng có thể đăng ký kinh doanh. Tinh gọn thủ tục chính là bệ phóng cho kinh tế số!',
  },
  {
    id: 'e-cabinet',
    img: '/chang2/pair-e-cabinet.webp',
    title: 'Trục liên thông văn bản quốc gia (E-Cabinet)',
    content:
      'Họp không giấy tờ. Xóa bỏ hàng tấn tài liệu in ấn mỗi năm. Bộ máy vận hành nhanh, quyết định chính sách kinh tế kịp thời.',
  },
  {
    id: 'ban-do-sap-nhap',
    img: '/chang2/pair-ban-do-sap-nhap.webp',
    title: 'Bản đồ sáp nhập tỉnh thành',
    content:
      '63 tỉnh sáp nhập còn 34. Chấm dứt phân tán nguồn lực. Bộ máy tinh gọn, ngân sách dư dả, tạo bệ phóng vững chắc cho kinh tế vĩ mô!',
  },
  {
    id: 'giam-tong-cuc',
    img: '/chang2/pair-giam-tong-cuc.webp',
    title: 'Biểu đồ giảm số lượng Tổng cục/Vụ',
    content:
      'Cắt bỏ cấp trung gian. Giảm 13/13 Tổng cục, hàng ngàn cán bộ dôi dư được tinh giản. Gọn bộ máy, nhẹ ngân sách!',
  },
  {
    id: 'bo-chung-chi',
    img: '/chang2/pair-bo-chung-chi.webp',
    title: 'Bỏ chứng chỉ ngoại ngữ/tin học hình thức',
    content:
      'Xóa rào cản bằng cấp hình thức. Cải cách quy chế công chức để dẹp nạn "mua bằng", tập trung vào năng lực thực chất của cán bộ.',
  },
  {
    // NOTE: pair-fta.webp hiện là ảnh tạm (cartoon tinh giảm bộ máy) — thay
    // bằng ảnh lễ ký kết FTA thật khi có, giữ nguyên tên file là xong.
    id: 'fta',
    img: '/chang2/pair-fta.webp',
    title: 'Lễ ký kết FTA (Hiệp định thương mại)',
    content:
      'Thể chế hội nhập. Cải cách hành chính trong nước là tấm vé bắt buộc để dòng vốn nước ngoài (FDI) yên tâm đổ vào Việt Nam.',
  },
  {
    id: 'sipas',
    img: '/chang2/pair-sipas.webp',
    title: 'Người dân đánh giá sự hài lòng (SIPAS)',
    content:
      'Lấy người dân làm trung tâm. Thước đo thành công của bộ máy chính trị không phải là quản lý được bao nhiêu, mà là phục vụ kinh tế tốt thế nào!',
  },
];

export const MEMES: MemeDef[] = [
  { id: 'ahihi', img: '/chang2/meme-ahihi.webp', caption: 'Ahihi, sai rồi!' },
  { id: 'che', img: '/chang2/meme-che.webp', caption: 'Chê!' },
  { id: 'ngu-6s', img: '/chang2/meme-ngu-6s.webp', caption: 'Chờ tau ngủ 6 giây đã…' },
  { id: 'cho-xiu', img: '/chang2/meme-cho-xiu.webp', caption: 'Chờ xíu…' },
  { id: 'sai-roi', img: '/chang2/meme-sai-roi.webp', caption: 'Sai rồi bây ơi!' },
];

/** Cốt truyện mở màn. */
export const STORY = {
  chapter: 'CHẶNG 2',
  title: 'Báo cáo bị xáo trộn',
  period: 'Giai đoạn 2016 – 2024',
  beats: [
    'Hồ sơ vừa tìm lại đủ, đoàn Táo chưa kịp thở phào… thì vị Táo thứ hai tái mặt: bản báo cáo của ngài bị gió trời lật tung, các trang tài liệu úp sấp, xáo trộn khắp mây!',
    'Tệ hơn nữa, đám mây tinh nghịch còn trộn vào đó 5 tấm thẻ meme "cà khịa" — lật trúng là chỉ tổ mất thời gian ngồi cười!',
    'Hãy lật thẻ tìm những CẶP TÀI LIỆU GIỐNG NHAU về công cuộc cải cách 2016–2024, ghép lại bản báo cáo hoàn chỉnh giúp Táo kịp giờ vào chầu!',
  ],
  howto: [
    '🔄 Mỗi lượt lật 2 thẻ',
    '🃏 Hai thẻ giống nhau = ghép được 1 cặp',
    '😜 Coi chừng 5 thẻ meme gây nhiễu!',
  ],
  cta: 'Bắt đầu khôi phục',
};

/** Màn chiến thắng — hé lộ danh tính Táo. */
export const VICTORY = {
  heading: 'Vượt ải thành công!',
  period: 'Giai đoạn 2016 – 2024',
  unlockLabel: 'Danh tính được hé lộ',
  taoName: 'Táo Cải Cách',
  intro:
    'Đây là giai đoạn Việt Nam đẩy mạnh cải cách hành chính, chuyển đổi số và xây dựng Chính phủ điện tử, Chính phủ số. Đồng thời, bộ máy nhà nước từng bước được sắp xếp theo hướng tinh gọn, nâng cao hiệu lực, hiệu quả, tạo nền tảng cho quá trình phát triển trong giai đoạn tiếp theo.',
};
