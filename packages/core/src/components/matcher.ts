import 'reflect-metadata';
import crypto from 'crypto';


/* ****************************************************************************************************************** */
// region: Types
/* ****************************************************************************************************************** */

type MatcherAction<TBaseType, TReturnType, TContextType> = (target: TBaseType, context: TContextType) => TReturnType;
type MatcherPredicate = (v: any, compareTo: any) => boolean
type MatchMapItem<TReturnType = any, TContextType = any> = {
  matcherValue: any
  action: MatcherAction<any, TReturnType, TContextType>,
  priority: number
}

export interface Matcher<TBaseType, TReturnType, TContextType = undefined> {
  (v: TBaseType, context: TContextType): TReturnType
  /**
   * @internal
   */
  context: MatchFnContext
}

interface MatchFnContext {
  matchMap: [ MatcherPredicate, MatchMapItem ][]
  defaultAction?: MatcherAction<any, any, any>
}

// endregion


/* ****************************************************************************************************************** */
// region: Helpers
/* ****************************************************************************************************************** */

function matchFn(this: MatchFnContext, v: any, context: any): any {
  // Get highest priority match action (array is pre-sorted by priority)
  const action = this.matchMap.find(([ predicate, item ]) => predicate(v, item.matcherValue))?.[1].action;
  return action ? action(v, context) : this.defaultAction?.(v, context);
}

// endregion


/* ****************************************************************************************************************** *
 * Namespace
 * ****************************************************************************************************************** */

export namespace Matcher {
  export const defaultPredicate: MatcherPredicate = (v: any, matcherValue: any) => (v === matcherValue);
  /**
   * Use to describe default return for when no matches found
   * @example
   * class MyMatchConfig extends Match.ConfigClass<any, any> {
   *   ['value1']: () => true
   *
   *   // Returns false if no match found
   *   [Matcher.Default]: () => false
   * }
   */
  export const Default = Symbol('Default Action');

  // noinspection JSUnusedLocalSymbols
  /**
   * Use to denote custom handling by predicate (creates a random key)
   */
  export const Custom = (label?: string) => crypto.randomBytes(21).toString('base64').slice(0,24);

  /**
   * Config class shape for Matcher
   * Note: Can use @Matcher.predicate and @Matcher.priority decorators on class and properties
   */
  export abstract class ConfigClass<TBaseType, TReturnType, TContextType = undefined, TStrict extends boolean = true> {
    [p: string]: TStrict extends true ? MatcherAction<TBaseType, TReturnType, TContextType> : MatcherAction<any, TReturnType, TContextType>
    [Matcher.Default]: MatcherAction<TBaseType, TReturnType, TContextType>
  }

  /* ********************************************************* */
  // region: Decorators
  /* ********************************************************* */

  /**
   * (Decorator) Sets a match predicate for Matcher (sets default when used on class)
   */
  export function predicate(predicate: MatcherPredicate) {
    return (ctorOrTarget: any, propertyKey?: string) => {
      if (propertyKey)
        Reflect.defineMetadata('predicate', predicate, ctorOrTarget, propertyKey);
      else
        Reflect.defineMetadata('predicate', predicate, ctorOrTarget.prototype);
    }
  }

  /**
   * (Decorator) Set priority for match (highest number = highest priority)
   */
  export function priority(priority: number) {
    return (target: any, propertyKey: string) => {
      Reflect.defineMetadata('priority', priority, target, propertyKey);
    }
  }

  // endregion

  /* ********************************************************* */
  // region: Factory
  /* ********************************************************* */

  /**
   * Create a Matcher
   */
  // @formatter:off
  export function createMatcher<T extends Matcher.ConfigClass<any, any, any>>(
    matcherClass: { new(): T }
  ):
    T extends Matcher.ConfigClass<infer TBaseType, infer TReturnType, infer TContextType> ?
      Matcher<TBaseType, TReturnType, TContextType> :
    never
  // @formatter:on
  export function createMatcher(matcherClass: { new(): Matcher.ConfigClass<any, any> }): Matcher<any, any>
  {
    const reflectTarget = matcherClass.prototype;
    const context: MatchFnContext = {
      matchMap: []
    }

    let basePredicate = Reflect.getMetadata('predicate', reflectTarget);
    if (typeof basePredicate !== 'function') basePredicate = Matcher.defaultPredicate;

    /* Populate matchMap */
    const cls = new matcherClass();
    for (const key of Reflect.ownKeys(cls) as (string | typeof Default)[]) {
      const action = cls[key];

      let priority = Reflect.getMetadata('priority', matcherClass.prototype, key);
      let predicate = Reflect.getMetadata('predicate', matcherClass.prototype, key);

      // @ts-ignore
      if (key === Matcher.Default) {
        if (priority !== undefined) throw new Error(`Cannot specify priority for Default Matcher action`);
        if (predicate !== undefined) throw new Error(`Cannot specify predicate for Default Matcher action`);
        context.defaultAction = action;
        continue;
      }

      priority = isNaN(+priority) ? 0 : +priority;
      predicate = (typeof predicate !== 'function') ? basePredicate : predicate;

      context.matchMap.push([ predicate, { action, priority: !isNaN(priority) ? priority : 0, matcherValue: key } ]);
    }

    /* Sort matchMap by priority (highest at the top) */
    context.matchMap = context.matchMap.sort((a, b) => b[1].priority - a[1].priority);

    /* Create matcher Function */
    return Object.assign(matchFn.bind(context), { context });
  }

  // endregion
}

// endregion
