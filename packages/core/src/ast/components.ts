
/* ****************************************************************************************************************** */
// region: TagMap
/* ****************************************************************************************************************** */

export class TagMap extends Map<string, any> {
  /**
   * Convert to object (sets empty values to true)
   */
  // @ts-ignore
  toObject() {
    return Array.from(this.entries()).reduce((res, [ k, v ]) => {
      res[k] = (v === undefined) ? true : v;
      return res;
    }, <Record<string, any>>{});
  }
}

// endregion
