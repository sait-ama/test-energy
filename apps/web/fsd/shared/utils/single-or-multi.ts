export class SingleOrMulti<T> {
  value: T | T[];
  isSingle: boolean;

  constructor(value: T | T[]) {
    this.value = value;
    this.isSingle = !Array.isArray(value);
  }

  /**
   * @param transformer
   * @param onlyIf 'single' | 'multi'
   */
  transform<U>(transformer: (item: T) => U, onlyIf?: 'single' | 'multi'): SingleOrMulti<U | T> {
    if (onlyIf === 'single' && !this.isSingle) return this;
    if (onlyIf === 'multi' && this.isSingle) return this;

    if (this.isSingle) {
      return new SingleOrMulti<U | T>(transformer(this.value as T));
    } else {
      return new SingleOrMulti<U | T>((this.value as T[]).map(transformer));
    }
  }

  /**
   * @param predicate
   * @param onlyIf 'single' | 'multi'
   */
  filter<Predicate extends (item: T) => boolean>(
    predicate: Predicate,
    onlyIf?: 'single' | 'multi'
  ): SingleOrMulti<T> | SingleOrMulti<null> {
    if (onlyIf === 'single' && !this.isSingle) return this;
    if (onlyIf === 'multi' && this.isSingle) return this;

    if (this.isSingle) {
      return predicate(this.value as T) ? this : new SingleOrMulti(null);
    } else {
      return new SingleOrMulti((this.value as T[]).filter(predicate));
    }
  }

  toArray(): T[] {
    return this.isSingle ? [this.value as T] : (this.value as T[]);
  }

  // if (singleOrMulti.isEmpty() || is<SingleOrMultiOf<null | undefined>>(singleOrMulti.value, false)) guard
  isEmpty(): boolean {
    return this.isSingle ? !(this.value as T) : !(this.value as T[]).length;
  }
}
