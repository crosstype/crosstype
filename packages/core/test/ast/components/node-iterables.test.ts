import { createFakeNodes, createNodeIterable, fakeNodeKind, getClassStringMap } from '../../helpers';
import { NodeMap, NodeSet } from '#ast/components/node-iterables';
import { Node } from '#ast';


/* ****************************************************************************************************************** *
 * Tests
 * ****************************************************************************************************************** */

describe(`Node Iterables`, () => {
  describe.each(getClassStringMap(NodeMap, NodeSet))(`%s`, (name, cls) => {
    let iterable: NodeSet<any> | NodeMap<any>
    let emptyIterable: NodeSet<any> | NodeMap<any>
    const nodes = createFakeNodes(4);
    beforeAll(() => {
      iterable = createNodeIterable(cls, nodes);
      emptyIterable = createNodeIterable(cls, []);
    });

    test(`Has proper prototypes`, () => {
      expect(iterable).toBeInstanceOf(cls);
      expect(iterable).toBeInstanceOf(cls === NodeMap ? Map : Set);
    });

    test(`Has all nodes`, () => {
      expect([ ...iterable.values() ]).toEqual(nodes)
    });

    test(`Filters undefined during create`, () => {
      const iter = createNodeIterable(cls, <any>[ void 0, ...createFakeNodes(4), void 0, void 0 ]);
      expect(iter.size).toBe(4);
      expect([ ...iter.values() ].indexOf(void 0)).toBe(-1);
    });

    if (cls === NodeMap)
      test(`NodeMap has correct keys`, () => {
        [ ...(<NodeMap<any>>iterable).entries() ].forEach(([ key, node ]) => expect(node.name).toBe(key));
      });

    test(`isEmpty works`, () => {
      expect(iterable.isEmpty).toBeFalsy();
      expect(emptyIterable.isEmpty).toBeTruthy();
    });

    test(`toArray() works`, () => expect(iterable.toArray()).toEqual(nodes));

    test(`orUndefinedIfEmpty() works`, () => {
      expect(iterable.orUndefinedIfEmpty()).toBe(iterable);
      expect(emptyIterable.orUndefinedIfEmpty()).toBeUndefined();
    });


    test(`prune() works`, () => {
      const fakeNodes = createFakeNodes(4);
      const pruneIter = createNodeIterable(cls, fakeNodes);
      expect(pruneIter.size).toBe(4);
      pruneIter.prune();
      expect(pruneIter.size).toBe(4);

      // Break first node, making it non-valid
      Object.setPrototypeOf(fakeNodes[0], null);
      pruneIter.prune();

      // Broken should be removed
      expect(pruneIter.size).toBe(3);
      expect([ ...pruneIter.values() ].indexOf(fakeNodes[0])).toBe(-1);
    });

    test(`find() works`, () => {
      const predicate = (n: Node) => n.kind === fakeNodeKind
      expect(iterable.find(predicate)).toEqual([ ...iterable.values() ].find(predicate));
    });

    test(`add() works`, () => {
      const fakeNodes = createFakeNodes(2);
      const iterable = createNodeIterable(cls, [ fakeNodes[0] ]);
      expect([ ...iterable.values() ]).toEqual([ fakeNodes[0] ]);

      iterable.add(fakeNodes[1]);
      expect([ ...iterable.values() ]).toEqual(fakeNodes);
    });

    test(`${ cls === NodeSet ? 'toNodeMap' : 'toNodeSet' }() works`, () => {
      const newCls = cls === NodeMap ? NodeSet : NodeMap;
      const newIterable = (iterable instanceof NodeSet) ? iterable.toNodeMap() : iterable.toNodeSet();

      expect(newIterable).toBeInstanceOf(newCls);
      expect([ ...newIterable.values() ]).toEqual(nodes);
    });

    describe(`[Static] ${name}.from()`, () => {
      test(`From iterable of nodes`, () => {
        const nodeSet = new Set(nodes);
        const iter = (<any>cls).from(nodeSet);
        expect([ ...iter.values() ]).toEqual(nodes);
      });

      test(`From map function`, () => {
        const nodeIndexes = nodes.map((n, index) => index);
        const mapFn = (val: number, key: number) => {
          expect(key).toBe(val);
          return nodes[val];
        }
        const iter = (<any>cls).from(nodeIndexes, mapFn);
        expect([ ...iter.values() ]).toEqual(nodes);
      });
    });
  });
});
