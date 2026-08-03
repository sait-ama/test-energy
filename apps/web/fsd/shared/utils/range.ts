// python range like
export function* range(start: number, end?: number, step: number = 1): Generator<number> {
  if (step === 0) throw new Error('Step cannot be 0');

  if (end == null) {
    end = start;
    start = 0;
  }

  const increasing = step > 0;
  for (let i = start; increasing ? i < end : i > end; i += step) {
    yield i;
  }
}
