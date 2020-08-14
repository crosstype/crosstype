/* ****************************************************************************************************************** */
// region: General Array Utils
/* ****************************************************************************************************************** */


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

// endregion


/* ****************************************************************************************************************** */
// region: Object Nesting
/* ****************************************************************************************************************** */

export type NestedObject<T extends { [p: string]: any }, TChildrenKey extends string> =
  T &
  { [K in TChildrenKey]: NestedObject<T, TChildrenKey>[] } &
  { flatten(): NestedObject<T, TChildrenKey>[] }


// @formatter:off
/**
 * Takes Array of Objects and returns a flattenable array of root objects with nested children (recursively) on the objects
 * (Use res.flatten() to get a flattened array)
 * @param objects - Array of objects
 * @param primaryKey - Primary identifier key
 * @param parentKey - Key which refers to parent primary key
 * @param childrenKey - Child array will be assigned to this key
 */
export function nestObjects<T extends { [p:string]: any }, TChildrenKey extends string>(
  objects: T[],
  primaryKey: keyof T,
  parentKey: keyof T,
  childrenKey: TChildrenKey
): NestedObject<T, TChildrenKey>[]
/**
 * Takes Array of Objects and returns a flattenable array of root objects with nested children (recursively) on the objects
 * (Use res.flatten() to get a flattened array)
 * @param objects - Array of objects
 * @param primaryKey - Primary identifier key
 * @param parentKey - Key which refers to parent primary key
 * @param childrenKey - Child array will be assigned to this key
 * @param preFormatter - Run objects through formatter before nesting
 */
export function nestObjects<
  T extends { [p:string]: any },
  TChildrenKey extends string,
  TFormatter extends (o: T) => unknown
>(
  objects: T[],
  primaryKey: keyof T,
  parentKey: keyof T,
  childrenKey: TChildrenKey,
  preFormatter: TFormatter
): TFormatter extends () => infer U ? NestedObject<U, TChildrenKey>[] : never
// noinspection BadExpressionStatementJS
export function nestObjects<T, TChildrenKey extends string>(
  objects: T[],
  primaryKey: keyof T,
  parentKey: keyof T,
  childrenKey: TChildrenKey,
  preFormatter?: (o: T) => unknown
): any[] {
  const flatten = function(this: Array<any>) {
    const res:any[] = [];
    const addItem = (item: any) => {
      res.push(item);
      item[childrenKey]?.forEach(addItem);
    };

    this.forEach(addItem);

    return res;
  }

  const rootItems:any[] = [];
  Object.defineProperty(rootItems, 'flatten', { value: flatten.bind(rootItems), enumerable: false });

  const newObjects:any[] = objects.map(o => preFormatter?.({ ...o }) || { ...o });

  for (const item of newObjects) {
    item[childrenKey] = newObjects.filter(i => i[parentKey] === item[primaryKey]);
    // noinspection BadExpressionStatementJS
    (item[parentKey] ?? rootItems.push(item));
  }

  return rootItems;
}
// @formatter:on

// endregion
