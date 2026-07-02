/**
 * Chặng 3 — "Khôi phục báo cáo" (Giai đoạn 2025 – nay).
 *
 * Editorial content + puzzle config for the stage-3 game: reassemble the
 * shattered illustration (jigsaw), then guess the era's keyword from it.
 * The puzzle tiles are cut VIRTUALLY from one image via background-position,
 * so /public/chang3 only ships puzzle-tinh-gon.webp.
 */

export const PUZZLE = {
  img: '/chang3/puzzle-tinh-gon.webp',
  /** Native size of the optimized asset — keeps every tile's aspect exact. */
  width: 1600,
  height: 1061,
  /** 3 hàng × 7 mảnh = 21 pieces. */
  cols: 7,
  rows: 3,
};

/** The phrase to guess, word by word (diacritics shown, compared leniently). */
export const KEYWORD_WORDS = ['TINH', 'GỌN', 'BỘ', 'MÁY'];

/** Diacritic-insensitive normalization: "gọn"/"GON" both → "GON". */
export function normalizeAnswer(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
}

export const KEYWORD_NORMALIZED = normalizeAnswer(KEYWORD_WORDS.join(''));

/** Cốt truyện mở màn. */
export const STORY = {
  chapter: 'CHẶNG 3',
  title: 'Khôi phục báo cáo',
  period: 'Giai đoạn 2025 – nay',
  beats: [
    'Hai bản báo cáo đã về tay, chỉ còn vị Táo cuối cùng. Nhưng ngài… chẳng còn nhớ nổi chữ nào trong sớ! Tất cả những gì đọng lại trong trí nhớ là MỘT BỨC HÌNH minh họa.',
    'Khổ nỗi, bức hình cũng bị gió thổi vỡ thành từng mảnh, rơi rải rác khắp chín tầng mây. May thay, bốn góc hình còn dính lại làm mốc.',
    'Hãy ghép các mảnh về đúng chỗ để khôi phục bức tranh, rồi đoán CỤM TỪ KHÓA của giai đoạn 2025 – nay để hoàn tất bản báo cáo cuối cùng!',
  ],
  howto: [
    '🖐️ KÉO THẢ mảnh ghép vào ô trên bức tranh',
    '🔁 Thả nhầm? Kéo mảnh này thả lên mảnh kia để đổi chỗ',
    '📌 4 góc đã được ghép sẵn làm mốc',
    '🔤 Ghép xong: đoán cụm từ khóa từ bức tranh',
    '⏱️ Đồng hồ chỉ chạy trong lúc chơi, đọc màn này thoải mái',
  ],
  cta: 'Bắt đầu ghép hình',
};

/** Màn chúc mừng cuối game — composed from the separated /public/end layers. */
export const FINALE = {
  banner: '/end/banner-chuc-mung.webp',
  button: '/end/btn-ket-thuc.webp',
  /** Left → right like the reference art: đỏ, cam, hồng, xanh lá, xanh dương. */
  riders: [
    '/end/tao-do-ca-chep.webp',
    '/end/tao-cam-ca-chep.webp',
    '/end/tao-hong-ca-chep.webp',
    '/end/tao-xanh-la-ca-chep.webp',
    '/end/tao-xanh-duong-ca-chep.webp',
  ],
};

/** Màn chiến thắng — hé lộ danh tính Táo, khép lại hành trình 3 chặng. */
export const VICTORY = {
  heading: 'Vượt ải thành công!',
  period: 'Giai đoạn 2025 – nay',
  unlockLabel: 'Danh tính được hé lộ',
  taoName: 'Táo Tinh Gọn',
  intro:
    'Việt Nam tiếp tục đẩy mạnh đổi mới chính trị nhằm đáp ứng yêu cầu phát triển trong thời kỳ mới. Trọng tâm của giai đoạn này là sắp xếp, sáp nhập đơn vị hành chính, tinh gọn tổ chức bộ máy, tăng cường phân cấp, phân quyền và xây dựng nền hành chính hoạt động tinh – gọn – mạnh – hiệu năng – hiệu lực – hiệu quả.',
};
