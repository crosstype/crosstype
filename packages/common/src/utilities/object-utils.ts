import { accForEach, camelToSnake, snakeToCamel } from './general-utils';


/* ****************************************************************************************************************** *
 * Object Utils
 * ****************************************************************************************************************** */

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
 * Fully typed Object.keys
 */
export const getKeys = <T>(obj: T): [keyof T] => Object.keys(obj) as [keyof T];

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
 * Returns new object with snake case keys
 */
export const snakeCaseObject = <T = any>(o: object): T => {
  const res = Object.create(Object.getPrototypeOf(o), Object.getOwnPropertyDescriptors(o)) as any;
  for (const [ key, value ] of Object.entries(res)) {
    delete res[key];
    res[camelToSnake(key)] = value;
  }
  return res;
}

/**
 * Returns new object with camel case keys
 */
export const camelCaseObject = <T = any>(o: object): T => {
  const res = Object.create(Object.getPrototypeOf(o), Object.getOwnPropertyDescriptors(o)) as any;
  for (const [ key, value ] of Object.entries(res)) {
    delete res[key];
    res[snakeToCamel(key)] = value;
  }
  return res;
}
