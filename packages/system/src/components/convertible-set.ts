
/* ****************************************************************************************************************** *
 * Components
 * ****************************************************************************************************************** */

export class ConvertibleSet<T, TImmutable extends boolean = false, TArray extends Array<any> = T[]> extends Set<T> {
  toArray(): TImmutable extends true ? Readonly<TArray> : TArray {
    return [ ...this.values() ] as any;
  }

  removeUndefined(): ConvertibleSet<Exclude<T, undefined>, TImmutable>
  removeUndefined(): ConvertibleSet<T, TImmutable> {
    this.delete(undefined as any);
    return this;
  }
}
