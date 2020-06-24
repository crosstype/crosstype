import { NamedNode, Node, NodeFlags, NodeKind, NodeObject, ReferenceNode, TypeFlags } from '#ast';
import { NodeMap, NodeSet } from '#ast/components';


/* ****************************************************************************************************************** */
// region: Config
/* ****************************************************************************************************************** */

export const fakeNodeKind = 0

// endregion


/* ****************************************************************************************************************** */
// region: General Helpers
/* ****************************************************************************************************************** */

/**
 * Get array of [ classname, string ] for class (Use with test.each / describe.each)
 */
export const getClassStringMap = (...cls: { new(...args: any[]): any }[]) => cls.map(c => <[ string, typeof c ]>[ c.name, c ]);

// endregion


/* ****************************************************************************************************************** */
// region: Test Helpers
/* ****************************************************************************************************************** */

/**
 * Workaround to convert Node Iterables to jest-safe versions
 * Related to: https://github.com/facebook/jest/issues/10199
 */
export function makeJestSafe<T>(v: T): T {
  const cache = new Map();

  return (function visit(v: any) {
    if (cache.has(v)) return cache.get(v);
    const addCache = (result: any) => { cache.set(v, result); return result }

    if (!(typeof v === 'object') || Array.isArray(v)) return addCache((v && v['map']) ? v.map(visit) : v);
    if (v instanceof NodeMap) return addCache(new Map(v));
    if (v instanceof NodeSet) return addCache(new Set(v));

    /* Deeply recurse, if object */
    const descriptors = Object.getOwnPropertyDescriptors(v);
    let res = {} as T;
    addCache(res);

    Object.entries(descriptors).forEach(([ name, descriptor ]) => {
      if (descriptor.hasOwnProperty('value'))
        Object.defineProperty(res, name, {  ...descriptor, value: visit(descriptor.value) });
    });

    return res;
  })(v);
}

// endregion



/* ****************************************************************************************************************** */
// region: Fake Factories
/* ****************************************************************************************************************** */

export const createFakeNode = (parent?: Node, props?: any, kind: number = fakeNodeKind) =>
  new NodeObject(kind, void 0, void 0)
    .updateProperties(<any>{ parent, flags: NodeFlags.Named, ...props }) as Node;

export const createFakeReferenceNode = (parent: Node | undefined, target: Node) =>
  createFakeNode(parent).updateProperties(<any>{ kind: NodeKind.Reference, typeFlags: TypeFlags.Reference, target }) as ReferenceNode;

// noinspection JSUnusedLocalSymbols
export const createFakeNodes = (count: number, parent?: any, props?: any) => {
  const res: NamedNode[] = [];
  for (let i = 1; i <= count; i++)
    res.push(createFakeNode(parent).updateProperties(<any>{ name: `${!parent ? 'Root' : 'Child'}Node${i}` }) as any as NamedNode);
  return res;
}

export const createNodeIterable = <T extends { new(...args: any[]): NodeSet<any> | NodeMap<any> }>(cls: T, nodes: NamedNode[]) =>
  new cls(nodes)

// endregion
