
/* ****************************************************************************************************************** *
 * Type Helpers
 * ****************************************************************************************************************** */

export type Indices<T> = Exclude<keyof T, keyof any[]>;

export type IndexedTuple<T extends readonly any[] | any[] | undefined> = T extends any[] ? { [K in Indices<T>]: T[K] } : never

/**
 * Return only keys of specific type
 */
export type KeysOfType<T, U> = { [K in keyof T]: T[K] extends U ? K : never }[keyof T];

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

export type InferThis<T extends Function> = T extends (this: infer TThis, ...args: any[]) => any ? TThis : never;

export type OneOrMore<T> = T | T[]

export type RequireSome<T, K extends keyof T> = T & Pick<Required<T>, K>

type Flatten<T extends Array<any>> = {
  [K in keyof T]: T[K] extends Array<any> ? Flatten<T[K][number]> : T[K]
}

