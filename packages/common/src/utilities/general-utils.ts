
/* ****************************************************************************************************************** *
 * General Helpers
 * ****************************************************************************************************************** */

/**
 * Cast a value to a type (bypasses similarity check)
 * @param value - Pass value to cast or leave empty to create an empty type-only placeholder
 */
export const cast = <T>(value?: any): T => value;

/**
 * Deep Copy object using rfdc
 */
export { default as deepCopy } from 'rfdc';

/**
 * Convert array to single item if only one in the array
 */
export const convertSingleElementArray = <T>(v: T): T extends ArrayLike<any> ? T[number] : T => Array.isArray(v) ? v[0] : v;

/**
 * @returns iterable or undefined if it is empty
 */
export const undefinedIfEmptyArray = <T extends Iterable<any> | ArrayLike<any>>(arr: T | undefined) =>
  arr && ((Array.isArray(arr) && arr.length) || Array.from(arr).length) ? arr : void 0;

/**
 * Validate a possible JSON object represented as string
 */
export function isJSONObjectString(s: string) {
  try {
    const o = JSON.parse(s);
    return !!o && (typeof o === 'object') && !Array.isArray(o)
  }
  catch {
    return false
  }
}

/**
 * Validate a possible JSON object represented as string
 */
export const isJSONObject = (o: any) =>
  !!o && (typeof o === 'object') && !Array.isArray(o) &&
  (() => { try { return Boolean(JSON.stringify(o)); } catch { return false } })()

/**
 * Swap key & value in a map
 */
export const reverseMap = <TKeyType, TValType>(map: Map<TKeyType, TValType>): Map<TValType, TKeyType> =>
  new Map([ ...map.entries() ].map(([ k, v ]) => [ v, k ]));

/**
 * If value is truthy, returns `value` (or `v` if no `value` provided), otherwise, returns an empty string
 * @param v - Var to check for truthiness
 * @param value - Value to return if true
 */
export const truthyStr = (v: any, value?: string): string =>
  v ? ((value !== undefined) ? value : String(v)) : '';

/**
 * Filter object, only including specific properties (Based on TypeScript Pick)
 * @param obj - Object to filter
 * @param keys - Keys to extract
 * @example
 * let obj = { a: 1, b: 2, c: '3' }     // Type is { a: number, b: number, c: string }
 * obj = pick(obj, 'a', 'b')            // Type is { a: number, c: string }
 */
export function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  const descriptors = Object.getOwnPropertyDescriptors(obj);
  return accForEach(Object.entries(descriptors), <typeof obj>{}, ([ key, descriptor], res) => {
    if (keys.includes(<any>key)) Object.defineProperty(res, key, descriptor);
  });
}

/**
 * Filter object, excluding specific properties (Based on TypeScript Pick)
 * @param obj - Object to filter
 * @param keys - Keys to exclude
 * @example
 * const obj = { a: 1, b: 2, c: '3' }     // Type is { a: number, b: number, c: string }
 * const obj2 = omit(obj, 'a', 'c')       // Type is { b: number }
 */
export function omit<T, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> {
  const descriptors = Object.getOwnPropertyDescriptors(obj);
  return accForEach(Object.entries(descriptors), <typeof obj>{}, ([ key, descriptor], res) => {
    if (!keys.includes(<any>key)) Object.defineProperty(res, key, descriptor);
  });
}

/**
 * Filter Array for unique only, optionally remove undefined values
 */
export function uniqueArray<T, TBoolean extends boolean>(arr: T[], removeUndefined?: TBoolean):
  TBoolean extends true ? Exclude<T, undefined>[] : T[] {
  return [ ...arr ].filter((val, i) => (arr.indexOf(val) === i) && (!removeUndefined || val !== undefined)) as any;
}

/**
 * Remove undefined values from array
 */
export function removeUndefinedFromArray<T>(arr: T[]): Exclude<T, undefined>[] {
  return [ ...arr ].filter(val => val !== undefined) as any;
}

/**
 * Fully typed Object.keys
 */
export const getKeys = <T>(obj: T): [keyof T] => Object.keys(obj) as [keyof T];

/**
 * Join paths with forward separator (ignores falsy) & normalizes (all backslashes to forward slash, no running slashes)
 */
export const normalizeAndJoinPaths = (...paths: (string | undefined)[]) =>
  truthyStr(
    paths.reduce((prev, path, index) => path ?
                                        prev!.concat(path, truthyStr(index !== paths.length - 1, '/')) :
                                        prev
      , ''))
    .replace(/[\\\/]+/g, '/')   // Replace backslashes to forward slash & remove running-slashes
    .replace(/\/\.\//g, '/')    // Remove /./
    .replace(/\/$/g, '');       // No trailing slash

/**
 * Verify that object has all provided keys
 * @param strict - Can *only* have the provided keys
 */
export const hasKeys = (o: object, keys: string[], strict?: boolean) => {
  if (typeof o !== 'object') return false;
  const objKeys = Object.keys(o);
  return !strict ? keys.every(k => objKeys.includes(k)) : (objKeys.sort().toString() === keys.sort().toString());
};

/**
 * Verify that object has all provided properties
 * @param strict - Can *only* have the provided properties
 */
export const hasProperties = (o: object, propNames: string[], strict?: boolean) => {
  if (typeof o !== 'object') return false;
  const objProps = Object.getOwnPropertyNames(o);
  return !strict ? propNames.every(k => objProps.includes(k)) : (objProps.sort().toString() === propNames.sort().toString());
};

/**
 * forEach with accumulator. This is meant to replace difficult to read Array.reduce methods.
 */
export function accForEach<T, Acc>(
  iterable: Iterable<T> | T[],
  acc: Acc,
  cb: (item: T, acc: Acc, index: number, iterable: Iterable<T>
  ) => void): Acc {
  if (Array.isArray(iterable)) iterable.forEach((item, i) => cb(item, acc, i, iterable));
  else {
    let i = 0;
    for (const item of iterable) {
      cb(item, acc, i, iterable);
      i++;
    }
  }
  return acc;
}

