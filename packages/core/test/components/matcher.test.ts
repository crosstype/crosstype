import { Matcher } from '../../src/components';
import { expectTypeOf } from 'expect-type';


/* ****************************************************************************************************************** *
 * Config
 * ****************************************************************************************************************** */

type Base = { a: string, kind?: number }
type Return = { result: string }
type Context = { c: any }


/* ****************************************************************************************************************** *
 * Tests
 * ****************************************************************************************************************** */

describe(`Matcher`, () => {
  test(`Created matcher type infers all types`, () => {
    type InferConfigClass<T extends Matcher<any, any, any>> =
      T extends Matcher<infer A, infer B, infer C> ? [ A, B, C ] : never

    class C extends Matcher.ConfigClass<Base, Return, Context> {}
    const m = Matcher.createMatcher(C);

    expectTypeOf<InferConfigClass<typeof m>>().toEqualTypeOf<[ Base, Return, Context ]>();

    /* With strict */
    class C1 extends Matcher.ConfigClass<Base, Return, Context, false> {}
    const m2 = Matcher.createMatcher(C1);

    expectTypeOf<InferConfigClass<typeof m2>>().toEqualTypeOf<[ any, Return, Context ]>();
  });

  test(`Functions in ConfigClass are restricted by types`, () => {
    class A extends Matcher.ConfigClass<Base, Return, Context> {
      // @ts-expect-error
      ['hello'] = (base: null, context: Context) => <Return><any>null;
    }

    class B extends Matcher.ConfigClass<Base, Return, Context> {
      // @ts-expect-error
      ['hello'] = (base: Base, context: null) => <Return><any>null
    }

    class C extends Matcher.ConfigClass<Base, Return, Context> {
      // @ts-expect-error
      ['hello'] = (base: Base, context: Context) => null
    }
  });

  test(`Strict setting permits/restricts base type in action function`, () => {
    class A extends Matcher.ConfigClass<Base, Return, Context, false> {
      ['hello'] = (base: null, context: Context) => <Return><any>null;
    }

    class B extends Matcher.ConfigClass<Base, Return, Context, true> {
      // @ts-expect-error
      ['hello'] = (base: null, context: Context) => <Return><any>null;
    }
  });

  test(`@Matcher.predicate decorator sets predicate`, () => {
    const predicate1 = (v: any) => !!v;
    const predicate2 = (v: any) => !v
    @Matcher.predicate(predicate1)
    class C {
      @Matcher.predicate(predicate2)
      hello = {}
    }

    expect(Reflect.getMetadata('predicate', C.prototype)).toBe(predicate1);
    expect(Reflect.getMetadata('predicate', C.prototype, 'hello')).toBe(predicate2);
  });

  test(`Matches with correct predicate and returns result of action`, () => {
    const basePredicate = (v:Base, compareTo:any) => v.a === compareTo;
    const bitwisePredicate = (v:Base, compareTo:any) => !!v.kind && !!(v.kind & compareTo);

    @Matcher.predicate(basePredicate)
    class C extends Matcher.ConfigClass<Base, Return, Context> {
      ['hello'] = (v: Base, context: Context) => ({ result: 'hello', context });
      @Matcher.predicate(bitwisePredicate)
      [2] = (v: Base, context: Context) => ({ result: '2', context });
    }

    const matcher = Matcher.createMatcher(C);

    const context = { c: 5 };

      expect(matcher({ a: 'hello' }, context)).toEqual({ result: 'hello', context });
      expect(matcher({ a: 'hola', kind: 2 }, context)).toEqual({ result: '2', context });
  });

  test(`Assigns & respects priorities`, () => {
    @Matcher.predicate((v) => v === 1)
    class C extends Matcher.ConfigClass<any, any> {
      ['first'] = (v:any) => 'first';
      @Matcher.priority(3)
      ['second'] = (v:any) => 'second';
      @Matcher.priority(5)
      ['last'] = (v:any) => 'last';
    }

    const matcher = Matcher.createMatcher(C);

    expect([ ...(<any>matcher).context.matchMap.values() ].map(({ 1: { priority } }) => priority)).toEqual([ 5, 3, 0 ]);
    expect(matcher(1, undefined)).toBe('last');
  });

  test(`Default action works`, () => {
    @Matcher.predicate((v) => v === 1)
    class C extends Matcher.ConfigClass<any, any> {
      ['first'] = (v:any) => 'first';
      [Matcher.Default] = (v:any) => 'default';
    }

    const matcher = Matcher.createMatcher(C);

    expect(matcher('no-match', undefined)).toBe('default');
  });

  test(`Matcher.Label() generates unique label`, () => {
    const label = Matcher.Custom('ABC');
    const label2 = Matcher.Custom('ABC');

    expect(typeof label).toBe('string');
    expect(typeof label2).toBe('string');

    expect(label).toHaveLength(24);
    expect(label2).toHaveLength(24);

    expect(label2).not.toBe(label);
  });
});
