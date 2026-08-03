//todo
// @ts-ignore
import mergeWith from 'lodash.mergewith';

/**
 * Customizer function that always returns the source value,
 * effectively overriding the target value in all cases
 */
const overrideEverything = (_: unknown, source: unknown) => source;

/**
 * Customizer function that only overrides when the target value is undefined
 */
const overrideUndefinedOnly = (object: unknown, source: unknown) => object ?? source;

/**
 * Custom merge function for mergeWith that handles arrays
 * and other special cases
 */
function customizer(targetValue: any, sourceValue: any): any {
  // If both values are arrays, concat them instead of overwriting
  if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
    return targetValue.concat(sourceValue);
  }

  // Let lodash handle the default merging
  return undefined;
}

/**
 * Utility type to convert a union type to an intersection type
 * This helps with proper typing of merged objects
 */
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

export const mergeDeep = <TObject extends object, TSource extends object>(
  target: TObject,
  source: TSource
): TObject & TSource => mergeWith({}, target, source, overrideEverything);

export const mergeDeepUndefined = <TObject extends object, TSource extends object>(
  target: TObject,
  source: TSource
): TObject & Partial<TSource> => mergeWith({}, target, source, overrideUndefinedOnly);

export const mergeDeepObjects = <T extends object, S extends object[]>(
  target: T,
  ...sources: S
): T & UnionToIntersection<S[number]> => {
  return mergeWith({}, target, ...sources, customizer);
};
