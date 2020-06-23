import * as nm from '#ast/node-metadata';
import * as cloneUtilModule from '#ast/utilities/clone-node';
import { NamedNode, Node, NodeFlags, NodeObject, TypeFlags } from '#ast';
import { createNode } from '#ast/utilities/node-factories';
import { NodeMap, NodeSet } from '#ast/components';


/* ****************************************************************************************************************** */
// region: Config
/* ****************************************************************************************************************** */

const kind = 0;
const cloneCount = 3;
const nonCloneCount = 2;
const baseTypeFlags = [ TypeFlags.Object, TypeFlags.Iterable ];
const baseFlags = [ NodeFlags.Declaration, NodeFlags.Nested ];

// endregion


/* ****************************************************************************************************************** */
// region: Helpers
/* ****************************************************************************************************************** */

const createFakeNodes = (count: number, parent?: any | undefined) => {
  const res: NamedNode[] = [];
  for (let i = 1; i <= count; i++)
    res.push(
      new NodeObject(kind, void 0, void 0)
        .updateProperties(<any>{ name: `${parent ? 'clone' : 'nonClone'}Node${i}`, parent }) as any as NamedNode);
  return res;
}

const isClone = (n: Node) => !!(<any>n).cloned
const isNotClone = (n: Node) => !(<any>n).cloned

// endregion


/* ****************************************************************************************************************** *
 * Test
 * ****************************************************************************************************************** */

describe(`Node Util -> createNode()`, () => {
  const originalMetaEntry = nm.nodeMetadata[kind];
  const descMap: PropertyDescriptorMap = { prop: { value: 4, configurable: false, writable: false } }

  let props: any;
  let node: Node;
  beforeAll(() => {
    /* Setup Fake Nodes */
    const parentNode = createFakeNodes(1)[0];
    props = {
      nSet: new NodeSet([ ...createFakeNodes(cloneCount, parentNode), ...createFakeNodes(nonCloneCount) ]),
      nMap: new NodeMap([ ...createFakeNodes(cloneCount, parentNode), ...createFakeNodes(nonCloneCount) ]),
      single: createFakeNodes(1, parentNode)[0],
      nonChildSet: new NodeSet(createFakeNodes(cloneCount, parentNode)),
      nonChildMap: new NodeMap(createFakeNodes(cloneCount, parentNode)),
      nonChildSingle: createFakeNodes(1, parentNode)[0]
    }

    /* Setup fake metadata */
    nm.nodeMetadata[kind] = {
      baseTypeFlags,
      baseFlags,
      childContainerProperties: new Map([
        [ 'nSet', { key: 'nSet', optional: false } ],
        [ 'nMap', { key: 'nMap', optional: false } ],
        [ 'single', { key: 'single', optional: false } ]
      ])
    }

    // Mock cloneNode
    jest.spyOn(cloneUtilModule, 'cloneNode').mockImplementation(node => {
      (<any>node).cloned = true;
      return node
    });

    // Create primary node via createNode
    node = createNode(kind, <any>props, descMap);
  });
  afterAll(() => {
    nm.nodeMetadata[kind] = originalMetaEntry;
    jest.restoreAllMocks();
  });

  test(`Assigns flags`, () => {
    expect(node.typeFlags).toBe(baseTypeFlags.reduce((p, f) => p + f));
    expect(node.flags).toBe(baseFlags.reduce((p, f) => p + f));
  });

  test(`Assigns property descriptors`, () => {
    expect(Object.getOwnPropertyDescriptors(node)).toMatchObject(descMap)
  });

  test(`Assigns properties`, () => {
    expect(node).toMatchObject(props);
  });

  test(`Clones nodes in child props if node has existing parent`, () => {
    const n: typeof props = node;

    // Should create a new NodeSet instance
    expect(n.nSet).not.toBe(props.nSet);
    expect(n.nSet).toBeInstanceOf(NodeSet);

    // Should have cloned nodes with parents
    expect(n.nSet.toArray().filter(isClone)).toHaveLength(cloneCount);
    expect(n.nSet.toArray().filter(isNotClone)).toHaveLength(nonCloneCount);

    // Should create a new NodeMap instance
    expect(n.nMap).not.toBe(props.nMap);
    expect(n.nMap).toBeInstanceOf(NodeMap);

    // Should have cloned nodes with parents
    expect(n.nMap.toArray().filter(isClone)).toHaveLength(cloneCount);
    expect(n.nMap.toArray().filter(isNotClone)).toHaveLength(nonCloneCount);

    // Should have cloned single node with parents
    expect(isClone(n.single)).toBeTruthy();

    // Non-child containers should not clone
    expect(n.nonChildSet.toArray().filter(isNotClone)).toHaveLength(n.nonChildSet.size);
    expect(n.nonChildMap.toArray().filter(isNotClone)).toHaveLength(n.nonChildMap.size);
    expect(isNotClone(n.nonChildSingle)).toBeTruthy();
  });
});
