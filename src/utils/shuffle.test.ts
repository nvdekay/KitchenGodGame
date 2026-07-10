import { describe, expect, it } from 'vitest';
import { shuffle } from './shuffle';

describe('shuffle', () => {
  it('returns a new array and leaves the input untouched', () => {
    const input = [1, 2, 3, 4, 5];
    const copy = [...input];
    const out = shuffle(input);
    expect(out).not.toBe(input);
    expect(input).toEqual(copy);
  });

  it('preserves length and is a permutation of the input', () => {
    const input = ['a', 'b', 'c', 'd', 'e', 'f'];
    const out = shuffle(input);
    expect(out).toHaveLength(input.length);
    expect([...out].sort()).toEqual([...input].sort());
  });

  it('keeps duplicate multiplicity', () => {
    const input = [1, 1, 2, 2, 2, 3];
    const out = shuffle(input);
    const count = (arr: number[], v: number) => arr.filter((x) => x === v).length;
    expect(count(out, 1)).toBe(2);
    expect(count(out, 2)).toBe(3);
    expect(count(out, 3)).toBe(1);
  });

  it('handles empty and single-element arrays', () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle([42])).toEqual([42]);
  });
});
