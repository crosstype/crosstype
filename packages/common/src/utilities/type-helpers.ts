
/* ****************************************************************************************************************** *
 * Type Helpers
 * ****************************************************************************************************************** */

/**
 * If T is 'any', returns TrueType, otherwise returns FalseType
 */
export type IfAny<T, TrueType, FalseType> = 0 extends (1 & T) ? TrueType : FalseType

/**
 * Returns boolean of whether T is 'any'
 */
export type IsAny<T> = IfAny<T, true, false>

/**
 * Get indices for array, excluding non-array properties
 */
export type Indices<T> = Exclude<keyof T, keyof any[]>;

/**
 * Convert tuple to indexed Object type
 */
export type IndexedTuple<T extends readonly any[] | any[] | undefined> = T extends any[] ? { [K in Indices<T>]: T[K] } : never

/**
 * Return only keys of specific type
 */
export type KeysOfType<T, U> = { [K in keyof T]: T[K] extends U ? K : never }[keyof T];

/**
 * Convert Union to Intersection
 */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

/**
 * Infer 'this' type from function
 */
export type InferThis<T extends Function> = T extends (this: infer TThis, ...args: any[]) => any ? TThis : never;

/**
 * Single or array of T
 */
export type OneOrMore<T> = T | T[]

/**
 * Make certain properties required
 */
export type RequireSome<T, K extends keyof T> = T & Pick<Required<T>, K>

/**
 * Make certain properties partial
 */
export type PartialSome<T, K extends keyof T> = Omit<T, K> & Pick<Partial<T>, K>

/**
 * Flatten multi-level array
 */
export type Flatten<T extends Array<any>> = {
  [K in keyof T]: T[K] extends Array<any> ? Flatten<T[K][number]> : T[K]
}

/**
 * Apply Partial recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};
