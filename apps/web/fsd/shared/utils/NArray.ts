//todo
import orderBy from 'lodash.orderby';

export type NBy<T, U> = (value: T) => U;
export type NByWithIndex<T, U> = (value: T, index: number) => U;
export type NKey = NumberIsomorphic | symbol;

export enum NOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export interface NCollection<T> {
  length: number;

  isEmpty(): boolean;

  first(): T | undefined;

  indexOfField(field: keyof T, value: T[keyof T]): number;

  maxBy(by: NBy<T, number>): number;

  minBy(by: NBy<T, number>): number;

  recordBy<U extends NKey>(byKey: NBy<T, U>): Record<U, T>;

  recordBy<U extends NKey, V>(byKey: NBy<T, U>, byValue: NBy<T, V>): Record<U, V>;

  groupBy<U extends NKey, V extends NArray<T>>(by: NBy<T, U>): Record<U, V>;

  orderBy(by: NBy<T, unknown>, order: NOrder): NArray<T>;
}

export interface NArrayType<T> extends NCollection<T> {
  uniqBy<U>(by: NBy<T, U>): NArray<T>;

  map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): NArray<U>;
  filter(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): NArray<T>;

  flatMap<U, This = undefined>(
    callback: (this: This, value: T, index: number, array: T[]) => U | readonly U[],
    thisArg?: This
  ): NArray<U>;
}

export class NArray<T> extends Array<T> implements NArrayType<T> {
  static new<T>(...array: T[]): NArray<T> {
    return NArray.from(array) as NArray<T>;
  }

  static fromRecord2Entries<T>(record: Record<string, T>): [string, T][] {
    const array: Array<[string, T]> = [];
    for (const key in record) {
      // @ts-ignore
      array.push([key, record[key]]);
    }
    return array;
  }

  static newBy<T>(array?: T[]): NArray<T> {
    if (!Array.isArray(array)) return NArray.empty();
    return NArray.from(array) as NArray<T>;
  }

  static empty<T>(): NArray<T> {
    return new NArray();
  }

  uniqBy<U>(by: NBy<T, U>): NArray<T> {
    const map = new Map();
    this.forEach((it) => map.set(by(it), it));
    return NArray.from(map.values()) as NArray<T>;
  }

  indexOfField(field: keyof T, value: T[keyof T]): number {
    return this.map((it) => it[field]).indexOf(value);
  }

  isEmpty(): boolean {
    return this.length === 0;
  }

  first(): T | undefined {
    return this[0];
  }

  minBy(by: NBy<T, number>): number {
    const numbers = this.map(by);
    return Math.min(...(numbers as number[]));
  }

  maxBy(by: NBy<T, number>): number {
    const numbers = this.map(by);
    return Math.max(...(numbers as number[]));
  }

  recordBy<U extends NKey, V>(
    byKey: NByWithIndex<T, U>,
    byValue?: NByWithIndex<T, V>
  ): V extends undefined ? Record<U, T> : Record<U, V> {
    return this.reduce(
      (acc, cur, index) => {
        const key = byKey(cur, index);
        if (key !== undefined && key !== null) {
          // @ts-ignore
          acc[key] = byValue ? byValue(cur, index) : cur;
        }
        return acc;
      },
      {} as V extends undefined ? Record<U, T> : Record<U, V>
    );
  }

  groupBy<U extends NKey, V extends NArray<T>>(by: NBy<T, U>): Record<U, V> {
    return this.reduce(
      (acc, cur) => {
        const key = by(cur);
        if (key !== undefined && key !== null) {
          const value = acc[key];

          if (value === undefined || value === null) {
            // @ts-ignore
            acc[key] = NArray.empty();
          }

          acc[key].push(cur);
        }
        return acc;
      },
      {} as Record<U, V>
    );
  }

  orderBy(by: NBy<T, unknown>, order?: NOrder): NArray<T> {
    // @ts-ignore
    return NArray.from(orderBy(this, [by], [order])) as NArray<T>;
  }
  override map<U>(
    callbackfn: (value: T, index: number, array: T[]) => U,
    thisArg?: any
  ): NArray<U> {
    return super.map(callbackfn, thisArg) as NArray<U>;
  }

  // @ts-ignore
  override filter(
    predicate: (value: T, index: number, array: T[]) => unknown,
    thisArg?: any
  ): NArray<T> {
    return super.filter(predicate, thisArg) as NArray<T>;
  }

  // @ts-ignore
  override flatMap<U, This = undefined>(
    callback: (this: This, value: T, index: number, array: T[]) => U | readonly U[],
    thisArg?: This
  ): NArray<U> {
    return super.flatMap<U, This>(callback, thisArg) as NArray<U>;
  }
}
