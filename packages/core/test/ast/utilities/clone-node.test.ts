import { NamedNode, Node, NodeKind, NodeObject, ReferenceNode, TypeFlags } from '#ast';
import { NodeMap, NodeSet } from '#ast/components';
import { cloneNode } from '#ast/utilities/clone-node'
import * as nm from '#ast/node-metadata';
import { omit } from '@crosstype/system';


/* ****************************************************************************************************************** */
// region: Config
/* ****************************************************************************************************************** */

const kind = 0;
const multiNodeCount = 4;

// endregion


/* ****************************************************************************************************************** */
// region: Helpers
/* ****************************************************************************************************************** */

const createFakeNode = (parent?: Node, props?: any) =>
  new NodeObject(kind, void 0, void 0).updateProperties(<any>{ parent, ...props }) as Node;

const createFakeReferenceNode = (parent: Node | undefined, target: Node) =>
  createFakeNode(parent).updateProperties(<any>{ kind: NodeKind.Reference, typeFlags: TypeFlags.Reference, target }) as ReferenceNode;

// noinspection JSUnusedLocalSymbols
const createFakeNodes = (count: number, parent?: any, props?: any) => {
  const res: NamedNode[] = [];
  for (let i = 1; i <= count; i++)
    res.push(createFakeNode(parent).updateProperties(<any>{ name: `Node${i}` }) as any as NamedNode);
  return res;
}

const createNodeIterable = <T extends { new(...args: any[]): NodeSet<any> | NodeMap<any> }>(cls: T, nodes: NamedNode[]) =>
  new cls(nodes)

const isClone = (n: Node) => !!(<any>n).cloned
const isNotClone = (n: Node) => !(<any>n).cloned

const getComponentMap = (cls: { new(...args: any[]): any }[]) => cls.map(c => <[ string, typeof c ]>[ c.name, c ]);

// endregion


/* ****************************************************************************************************************** *
 * Test
 * ****************************************************************************************************************** */

describe(`Node Util -> cloneNode()`, () => {
  let cloneItemSpy: jest.SpyInstance<any, Parameters<typeof cloneNode.cloneItem>>;
  let copyNodeSpy: jest.SpyInstance<any, Parameters<typeof cloneNode.copyNode>>;
  const updatedNodes = new Map();

  beforeAll(() => {
    cloneItemSpy = jest.spyOn(cloneNode, 'cloneItem');
    copyNodeSpy = jest.spyOn(cloneNode, 'copyNode');
  });
  afterAll(jest.restoreAllMocks);

  describe(`cloneItem()`, () => {
    const cloneItem = <T>(item: T, childContainer: boolean) => cloneNode.cloneItem(updatedNodes, item, childContainer) as T;
    beforeEach(() => {
      copyNodeSpy.mockImplementation((updatedNodes: any, node: any) => Object.create(
        Object.getPrototypeOf(node),
        { ...Object.getOwnPropertyDescriptors(node), cloned: { value: true } }
      ));
    });
    afterEach(() => {
      jest.clearAllMocks();
      updatedNodes.clear();
    })

    describe.each(getComponentMap([ NodeSet, NodeMap ]))(`%s`, (name, cls) => {
      test(`Non child container -> Clones just ${name}`, () => {
        const original = createNodeIterable(cls, createFakeNodes(multiNodeCount));
        const copy = cloneItem(original, /* childContainer */ false);

        // Clones iterable
        expect(copy).toBeInstanceOf(cls);
        expect(original).not.toBe(copy);

        // Has all same members
        const originalMembers = original.toArray();
        const copyMembers = copy.toArray();
        copyMembers.forEach((n, i) => expect(originalMembers[i]).toBe(n));
      });
      test(`Child container -> Clones ${name} & members`, () => {
        const original = createNodeIterable(cls, createFakeNodes(multiNodeCount));
        const copy = cloneItem(original, /* childContainer */ true);

        // Clones set
        expect(copy).toBeInstanceOf(cls);
        expect(original).not.toBe(copy);

        // Has all new members
        const originalMembers = original.toArray();
        const copyMembers = copy.toArray();
        copyMembers.forEach((n, i) => {
          expect(originalMembers[i]).not.toBe(n);
          expect(isClone(n)).toBeTruthy();
        });
      });
    });

    describe(`Single Node`, () => {
      test(`Non child container -> Preserves Node`, () => {
        const original = createFakeNode();
        const copy = cloneItem(original, /* childContainer */ false);

        expect(copy).toBe(original);
        expect(isNotClone(copy)).toBeTruthy();
      });
      test(`Child container -> Copies Node`, () => {
        const original = createFakeNode();
        const copy: typeof original = cloneItem(original, /* childContainer */ true);

        expect(copy).not.toBe(original);
        expect(isClone(copy)).toBeTruthy();
      });
    });

    test(`Non-Objects -> Does not clone`, () => {
      const items = [ 1, null, 'hello', void 0, Infinity ];
      let processed = items.map(item => cloneItem(item, /* childContainer */ true));
      processed.forEach((item, i) => expect(item).toBe(items[i]));

      processed = items.map(item => cloneItem(item, /* childContainer */ false));
      processed.forEach((item, i) => expect(item).toBe(items[i]));
    });

    const { cloneNode: { cloneItem: originalCloneItem } } = jest.requireActual('#ast/utilities/clone-node');
    test.each(getComponentMap([ Array, Set, Map ]))(`%s -> Creates new & calls cloneItem for each member`, (name, cls) => {
      cloneItemSpy.mockImplementation((updated: any, item: any) => ({ value: item }));
      const items = [ { a: 'hello' }, null, 3, void 0 ].map((item, i) => (cls === Map) ? [ i, item ] : item);
      const original = (cls === Array) ? Array.from(items) : new cls(items);
      const copy = originalCloneItem(updatedNodes, original);
      const resultArray = Array.from(copy) as any[];

      // Clones iterable
      expect(copy).toBeInstanceOf(cls);
      expect(copy).not.toBe(original)

      const { calls } = cloneItemSpy.mock;
      // All calls passed updatedNodes
      calls.forEach(c => expect(c[0]).toBe(updatedNodes));

      /* Called cloneItem for all items & all values present in result */
      for (let i = 0; i < items.length; i++) {
        if (cls === Map) {
          const callIndex = (i * 2);
          const [ itemKey, itemValue ] = (<any>items)[i];
          expect(calls[callIndex][1]).toBe(itemKey);
          expect(calls[callIndex + 1][1]).toBe(itemValue);
          expect(resultArray[i][0]).toMatchObject({ value: itemKey });
          expect(resultArray[i][1]).toMatchObject({ value: itemValue });
        } else {
          expect(calls[i][1]).toBe(items[i]);
          expect(resultArray[i]).toMatchObject({ value: items[i] });
        }
      }
    });
  });

  describe(`copyNode()`, () => {
    const { cloneNode: { copyNode: originalCopyNode } } = jest.requireActual('#ast/utilities/clone-node');
    const originalNode = createFakeNode(void 0, {
      childKey1: 1,
      childKey2: 2,
      nonChildKey: 3,
      method1() { return true }
    });
    const originalMetaEntry = nm.nodeMetadata[kind];
    let copiedNode: Node
    const childContainerProperties = new Map([
      [ 'childKey1', { key: 'childKey1', optional: true } ],
      [ 'childKey2', { key: 'childKey2', optional: true } ]
    ])

    beforeAll(() => {
      updatedNodes.clear();
      copyNodeSpy.mockReset();
      cloneItemSpy.mockImplementation((updatedNodes: any, item: any, childContainer?: boolean) => ({
        item,
        childContainer
      }));
      nm.nodeMetadata[kind] = { childContainerProperties };

      copiedNode = originalCopyNode(updatedNodes, originalNode);
    });
    afterAll(() => {
      nm.nodeMetadata[kind] = originalMetaEntry;
    })

    test(`Copies all property descriptors & clones their values`, () => {
      const originalDescriptors = Object.getOwnPropertyDescriptors(originalNode);
      const copiedDescriptors: PropertyDescriptorMap = Object.getOwnPropertyDescriptors(copiedNode);

      for (const [ key, descriptor ] of Object.entries(copiedDescriptors)) {
        const originalDescriptor = originalDescriptors[key];
        const isChildContainer = childContainerProperties.has(key);
        const { value } = descriptor
        if (value)
          expect(value).toMatchObject({ item: originalDescriptor.value, childContainer: isChildContainer })
        expect(omit(descriptor, 'value')).toMatchObject(omit(originalDescriptor, 'value'));
      }
    });

    test(`Has Node prototype`, () => expect(copiedNode).toBeInstanceOf(NodeObject));

    test(`Added node to updatedNodes`, () => expect(updatedNodes.get(originalNode)).toBe(copiedNode));
  });

  describe(`cloneNode()`, () => {
    let resNode: Node;
    /* Create Nodes */
    const externalNode = createFakeNode();

    const baseNode = createFakeNode();
    const level1 = createFakeNode(baseNode);
    const level2 = createFakeNode(level1);
    const level3 = createFakeNode(level2);

    /* Create targets & References */
    const targetNode1 = createFakeNode(level1);
    const targetNode2 = createFakeNode(baseNode);

    const ref1 = createFakeReferenceNode(baseNode, targetNode1);
    const ref2 = createFakeReferenceNode(level3, targetNode1);
    const externalRef = createFakeReferenceNode(level2, externalNode);

    const nodes = [ baseNode, level1, level2, level3, targetNode1, targetNode2, ref1, ref2, externalRef ];
    const clones = nodes.map(n => Object.create(Object.getPrototypeOf(n), Object.getOwnPropertyDescriptors(n)));

    const getCloneFor = (node: Node) => clones[nodes.indexOf(node)];

    beforeAll(() => {
      // Setup mock
      copyNodeSpy.mockImplementation((updatedNodes: Map<Node,Node | undefined>) => {
        nodes.forEach((n, i) => updatedNodes.set(n, clones[i]));
      });

      resNode = cloneNode(baseNode);

      /* Make sure our helper works */
      const cloneIndex = clones.indexOf(getCloneFor(ref1));
      expect(cloneIndex > -1);
      expect(cloneIndex === nodes.indexOf(ref1));
    });

    test(`Calls copyNode() on baseNode`, () => {
      const [ updNodesParam, targetNodeParam ] = copyNodeSpy.mock.calls[0];
      expect(updNodesParam).toBeInstanceOf(Map);
      expect(targetNodeParam).toBe(baseNode);
      expect(updNodesParam.size).toBe(nodes.length);
    });

    test(`Returns updated node`, () => expect(resNode).toBe(getCloneFor(baseNode)));

    test(`Updates internal references`, () => {
      expect(getCloneFor(ref1).target).toBe(getCloneFor(ref1.target));
      expect(getCloneFor(ref2).target).toBe(getCloneFor(ref2.target));
    });

    test(`Leaves external references as they were`, () => {
      expect(getCloneFor(externalRef).target).toBe(externalRef.target);
    })
  });
});
