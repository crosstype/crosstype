import { omit, pick } from './general-utils';


/* ****************************************************************************************************************** */
// region: Types
/* ****************************************************************************************************************** */

type Mixin = { prototype: any }

export interface MixinConfig<T extends Mixin = any> {
  mixin: T
  omit?: (keyof T['prototype'])[]
  pick?: (keyof T['prototype'])[]
  copyConstructor?: boolean
}

// endregion


/* ****************************************************************************************************************** */
// region: Helpers
/* ****************************************************************************************************************** */

const isMixinConfig = (v: any): v is MixinConfig =>
  Object.getOwnPropertyNames(v).every(n => [ 'mixin', 'omit', 'pick' ].includes(n));

// endregion


/* ****************************************************************************************************************** *
 * Decorators
 * ****************************************************************************************************************** */

/**
 * Add mixins to prototype
 * @example
 * abstract class MixinClass1 {
 *   sayHello() { return 'hi' }
 * }
 *
 * abstract class MixinClass2 {
 *   sayGoodbye() { return 'goodbye' }
 *   ignoredMethod() { return true }
 * }
 *
 * interface MainClass extends MixinClass1, Omit<MixinClass2, 'ignoredMethod'> {}
 *
 * // The following line should be un-commented. It is only commented to preserve JSDoc
 * // @mixin(MixinClass1, { mixin: MixinClass2, omit: [ 'ignoredMethod' ] })
 * class MainClass {
 *   init() { console.log(
 *     this.sayHello(),
 *     this.sayGoodbye(),
 *     `ignoredMethod is: ${this.ignoredMethod}` // Should say undefined
 *   ); }
 * }
 */
export function mixin<T extends Mixin>(...mixin: (Mixin | MixinConfig<T>)[]) {
  return function (ctor: Function) {
    for (const m of mixin) {
      let descriptors: PropertyDescriptorMap;
      let copyConstructor = false;
      if (isMixinConfig(m)) {
        copyConstructor = !!m.copyConstructor;
        if (m.hasOwnProperty('pick') && m.hasOwnProperty('omit'))
          throw new Error(`Can't specify both pick and omit for mixin config!`);

        /* Copy prototype & filter if needed */
        descriptors = Object.getOwnPropertyDescriptors(m.mixin.prototype);
        descriptors = m['pick'] ? pick(descriptors, ...(<any>m)['pick']) :
                      m['omit'] ? omit(descriptors, ...(<any>m)['omit']) :
                      descriptors;
      } else {
        descriptors = Object.getOwnPropertyDescriptors((<Mixin>m).prototype);
      }

      if (!copyConstructor) delete descriptors['constructor'];
      Object.defineProperties(ctor.prototype, descriptors);
    }
  }
}
