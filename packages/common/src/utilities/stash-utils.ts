import { DeepPartial } from './type-helpers';
import { deepCopy, deepMerge } from './general-utils';
import { pick } from './object-utils';


/* ****************************************************************************************************************** */
// region: Types
/* ****************************************************************************************************************** */

export type Stash<T, P> = {
  target: T
  stashedProperties: P
  restore(): void
}

// endregion


/* ****************************************************************************************************************** */
// region: Utilities
/* ****************************************************************************************************************** */

/**
 * Stash old properties on target and update with new properties (to restore, call stash.restore())
 * Note: Stashed properties are stored as a deep copy. Restoring causes the copied items to be restored
 */
export function stashAndUpdate<T, P extends DeepPartial<T>>(
  target: T,
  updatedProperties: P,
  useDeepMerge: boolean = true,
  arrayMerge: deepMerge.Options['arrayMerge'] | undefined = (a, b) => b
): Stash<T, P>
{
  const pickedProperties = pick(target, ...<any[]>Object.keys(updatedProperties));
  const stashedProperties = deepCopy({ proto: true })(pickedProperties) as unknown as P;
  Object.assign(
    target,
    !useDeepMerge ? updatedProperties : deepMerge(pickedProperties, <any>updatedProperties, { arrayMerge })
  );

  return {
    target,
    stashedProperties,
    restore: () => Object.assign(target, stashedProperties)
  }
}

// endregion
