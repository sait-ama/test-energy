type AnyLiteral = Record<string, any>;
type AnyClass = new (...args: any[]) => any;
type AnyFunction = (...args: any[]) => any;
type AnyToVoidFunction = (...args: any[]) => void;
type BooleanToVoidFunction = (value: boolean) => void;
type NoneToVoidFunction = () => void;
type Redefine<From extends object, To extends object> = Omit<From, keyof To> & To;
export type SingleOrMultiOf<T> = T | T[];

type Promisify<T> = T extends object
  ? {
      [K in keyof T]: Promise<T[K]>;
    }
  : never;

export type DeepPartial<
  T extends object,
  K extends keyof T = keyof T,
  E extends string = never,
> = Omit<Partial<T>, K> & {
  [P in K]?: DeepPartialValue<T[P], E>;
};
