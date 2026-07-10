import { describe, expect, it } from 'vitest';
import { KEYWORD_NORMALIZED, KEYWORD_WORDS, normalizeAnswer } from './data';

describe('normalizeAnswer', () => {
  it('folds Vietnamese diacritics and upper-cases', () => {
    expect(normalizeAnswer('gọn')).toBe('GON');
    expect(normalizeAnswer('TINH GỌN')).toBe('TINHGON');
  });

  it('maps đ/Đ to d/D', () => {
    expect(normalizeAnswer('đổi mới')).toBe('DOIMOI');
    expect(normalizeAnswer('Đảng')).toBe('DANG');
  });

  it('strips spaces, punctuation and other non-letters', () => {
    expect(normalizeAnswer('  tinh-gọn, bộ máy! ')).toBe('TINHGONBOMAY');
    expect(normalizeAnswer('a1b2c3')).toBe('ABC');
  });

  it('is diacritic-insensitive — accented and bare forms match', () => {
    expect(normalizeAnswer('TINH GỌN BỘ MÁY')).toBe(normalizeAnswer('tinh gon bo may'));
  });

  it('the exported keyword constant matches the spelled-out words', () => {
    expect(KEYWORD_NORMALIZED).toBe(normalizeAnswer(KEYWORD_WORDS.join(' ')));
    expect(KEYWORD_NORMALIZED).toBe('TINHGONBOMAY');
  });
});
