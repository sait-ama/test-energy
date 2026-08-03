import { anchorBasedRegex } from './regexp';

describe('anchorBasedRegex', () => {
  test('removes leading and trailing brackets and quotes', () => {
    expect("['example']".replace(anchorBasedRegex, '')).toBe('example');
    expect(`["test"]`.replace(anchorBasedRegex, '')).toBe('test');
    expect(`['"mixed"']`.replace(anchorBasedRegex, '')).toBe('mixed');
  });

  test('does not remove characters inside the string', () => {
    expect(`['[inner]']`.replace(anchorBasedRegex, '')).toBe('inner');
  });

  test('returns unchanged if no leading/trailing brackets or quotes', () => {
    expect('example'.replace(anchorBasedRegex, '')).toBe('example');
  });

  test('removes multiple brackets and quotes on edges', () => {
    expect(`[[''"example"'']]`.replace(anchorBasedRegex, '')).toBe('example');
  });
});
