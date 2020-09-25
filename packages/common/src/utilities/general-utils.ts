

/* ****************************************************************************************************************** */
// region: JSON
/* ****************************************************************************************************************** */

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

// endregion


/* ****************************************************************************************************************** */
// region: General
/* ****************************************************************************************************************** */

/**
 * Cast a value to a type (bypasses similarity check)
 * @param value - Pass value to cast or leave empty to create an empty type-only placeholder
 */
export const cast = <T>(value?: any): T => value;

/**
 * Swap key & value in a map
 */
export const reverseMap = <TKeyType, TValType>(map: Map<TKeyType, TValType>): Map<TValType, TKeyType> =>
  new Map([ ...map.entries() ].map(([ k, v ]) => [ v, k ]));

// @formatter:off
/**
 * forEach with accumulator. This is meant to replace difficult to read Array.reduce methods.
 */
export function accForEach<T, Acc>(
  arr: T[],
  acc: Acc,
  cb: (item: T, acc: Acc, index: number, arr: T[]) => void
): Acc
/**
 * forEach with accumulator. This is meant to replace difficult to read Array.reduce methods.
 */
export function accForEach<T, Acc>(
  iterable: Iterable<T>,
  acc: Acc,
  cb: (item: T, acc: Acc, index: number, iterable: Iterable<T>) => void
): Acc
export function accForEach<T, Acc>(
  iterable: Iterable<T> | T[],
  acc: Acc,
  cb: (item: T, acc: Acc, index: number, iterable: any) => void
): Acc {
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
// @formatter:on

// endregion


/* ****************************************************************************************************************** */
// region: String
/* ****************************************************************************************************************** */

/**
 * If value is truthy, returns `value` (or `v` if no `value` provided), otherwise, returns an empty string
 * @param v - Var to check for truthiness
 * @param value - Value to return if true
 */
export const truthyStr = (v: any, value?: string): string =>
  v ? ((value !== undefined) ? value : String(v)) : '';

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
 * Converts string from snake_case to camelCase
 */
export const snakeToCamel = (s: string) =>
  s.toLowerCase().replace(/[-_][a-zA-Z]/g, (group) => group.slice(-1).toUpperCase());

/**
 * Converts string from camelCase to snake_case
 */
export const camelToSnake = (s: string) =>
  s.replace(/[A-Z]/g, (group) => `_${group.toLowerCase()}`);

// endregion


/* ****************************************************************************************************************** */
// region: Deep copy / merge
/* ****************************************************************************************************************** */

/**
 * Deep Copy (uses package: rfdc)
 */
import deepCopy from 'rfdc';

/**
 * Deep Merge (uses package: deepmerge)
 */
import deepMerge from 'deepmerge'


export { deepMerge, deepCopy }

// endregion
