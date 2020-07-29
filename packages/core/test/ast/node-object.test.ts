import {
  createDefinition, createIntegerLiteral, createObjectNode, createPropertyDeclaration, createSourceFile,
  createStringLiteral, createTrueLiteral, createTypeDeclaration, createUnionNode, isObjectNode, isSourceFile,
} from '#ast/utilities';
import { NodeMap, NodeSet } from '#ast/components/node-iterables';
import { createFakeNode, createFakeNodes, fakeNodeKind, makeJestSafe } from '../helpers';
import { nodeMetadata } from '#ast/node-metadata';
import { accForEach } from '@crosstype/common';
import {
  Definition, ModifierFlags, NamedNode, Node, NodeFlags, NodeKind, NodeObject, ReferenceNode, TypeFlags
} from '#ast';
import { Language } from '#language/language';
import * as cloneNodeModule from '#ast/utilities/clone-node'


/* ****************************************************************************************************************** */
// region: Real Nodes
/* ****************************************************************************************************************** */

/* Level 6 - Property value */
const level6_property_value = createIntegerLiteral({ value: '4' });

/* Level 5 - Object member */
const level5_objectMember_property = createPropertyDeclaration({
  name: 'prop',
  value: level6_property_value
});

/* Level 4 - Union members */
const level4_unionMember_trueLiteral = createTrueLiteral();
const level4_unionMember_stringLiteral = createStringLiteral({ value: 'hello' });
const level4_unionMember_object = createObjectNode({
  members: NodeMap.from([ level5_objectMember_property ])
});

/* Level 3 - Union */
const level3_union = createUnionNode({
  members: NodeSet.from([
    level4_unionMember_trueLiteral,
    level4_unionMember_stringLiteral,
    level4_unionMember_object
  ])
});

/* Level 2 - TypeDeclaration */
const level2_typeDeclaration = createTypeDeclaration({
  name: 'typeDeclaration',
  value: level3_union
});

/* Level 1 - Definition */
const level1_definition = createDefinition({
  name: 'definition',
  primary: true,
  declarations: NodeSet.from([ level2_typeDeclaration ])
});

/* Level 0 - SourceFile */
const level0_sourceFile = createSourceFile({
  fileName: '',
  name: 'root',
  language: 'typescript',
  definitions: NodeMap.from([ level1_definition ])
});

// endregion


/* ****************************************************************************************************************** */
// region: Fake Nodes
/* ****************************************************************************************************************** */

/* Fake Nodes */
const fakeParent = createFakeNode();
const fakeChildren = createFakeNodes(5, fakeParent);
const fakeGrandParent = fakeChildren[0];
const fakeGrandChildren = createFakeNodes(5, fakeChildren[0]);

/* Aliases */
const singleChild = fakeChildren[0];
const singleGrandChild = fakeGrandChildren[0];
const setChildren = fakeChildren.slice(1, 3);
const setGrandChildren = fakeGrandChildren.slice(1, 3);
const mapChildren = fakeChildren.slice(3, 5);
const mapGrandChildren = fakeGrandChildren.slice(3, 5);

/* Add children to parents */
fakeParent.updateProperties(<any>{
  nonChild: createFakeNode(fakeParent),
  child: singleChild,
  childSet: NodeSet.from(setChildren),
  childMap: NodeMap.from(mapChildren)
});

fakeGrandParent.updateProperties(<any>{
  nonChild: createFakeNode(fakeParent),
  child: singleGrandChild,
  childSet: NodeSet.from(setGrandChildren),
  childMap: NodeMap.from(mapGrandChildren)
});

const findableChildren = accForEach(fakeChildren, <Node[]>[], (node, res, i) => {
  if (i % 2) {
    node.updateProperties(<any>{ findMe: true });
    res.push(node)
  }
});

const findableGrandChildren = accForEach(fakeGrandChildren, <Node[]>[], (node, res, i) => {
  if (i % 2) {
    node.updateProperties(<any>{ findMe: true });
    res.push(node)
  }
});

// endregion


/* ****************************************************************************************************************** *
 * Tests
 * ****************************************************************************************************************** */

describe(`NodeObject`, () => {
  const originalMetadata = nodeMetadata[fakeNodeKind];
  beforeAll(() => {
    nodeMetadata[fakeNodeKind].childContainerProperties = new Map([
      [ 'child', { key: 'child', optional: false } ],
      [ 'childSet', { key: 'childSet', optional: false } ],
      [ 'childMap', { key: 'childMap', optional: false } ],
    ])
  });
  afterAll(() => {
    nodeMetadata[fakeNodeKind] = originalMetadata;
  });

  test(`Create has initial properties`, () => {
    const origin = <any>{}
    const compileOptions = {};
    let node = new NodeObject(fakeNodeKind, origin, compileOptions);

    expect(node).toMatchObject({
      kind: fakeNodeKind,
      parent: undefined,
      flags: NodeFlags.None,
      typeFlags: TypeFlags.None,
      origin: origin,
      modifiers: ModifierFlags.None,
      compileOptions: {},
      _metadata: nodeMetadata[fakeNodeKind]
    });

    expect((<any>node)._referencesToThis).toBeInstanceOf(NodeSet);
    expect((<any>node)._referencesToThis.size).toBe(0);

    node = new NodeObject(fakeNodeKind, origin, void 0);
    expect(node.compileOptions).toMatchObject(
      accForEach(Language.CompilerLanguages, <Record<string, any>>{}, ({ shortName }, acc) => acc[shortName] = {})
    );
  });

  test(`getReferencesToThisNode() works`, () => {
    const node = <Definition>createFakeNode();
    const refs = (<any>node)._referencesToThis;
    expect(refs).toBeInstanceOf(NodeSet);
    expect(node.getReferencesToThisNode()).toBe(refs);
  });

  describe(`Lineage & Descendant Methods`, () => {
    const lineage = [
      level0_sourceFile, level1_definition, level2_typeDeclaration, level3_union, level4_unionMember_object,
      level5_objectMember_property, level6_property_value
    ];
    const topNode = level6_property_value;

    describe(`getLineage()`, () => {
      test(`Has full lineage`, () => expect(topNode.getLineage()).toEqual(lineage.slice(0, -1).reverse()));
      test(`Circular ref parent in lineage throws`, () => {
        const node1 = createFakeNode();
        const node2 = createFakeNode(node1);
        node1.updateProperties({ parent: node2 });
        expect(() => node1.getLineage()).toThrow();
      })
    });

    describe(`findParent()`, () => {
      test(`Finds parent`, () => {
        expect(topNode.findParent(isObjectNode)).toBe(level4_unionMember_object);
        expect(topNode.findParent(isSourceFile)).toBe(level0_sourceFile);
      });

      test(`Circular ref parent in lineage throws`, () => {
        const node1 = createFakeNode();
        const node2 = createFakeNode(node1);
        node1.updateProperties({ parent: node2 });
        expect(() => node1.findParent(() => false)).toThrow();
      });
    });

    test(`getNamedParent() works`, () => {
      expect(level4_unionMember_object.getNamedParent()).toBe(level2_typeDeclaration);
      expect(level4_unionMember_object.getNamedParent('definition')).toBe(level1_definition);
      expect(level4_unionMember_object.getNamedParent(/.efinition$/)).toBe(level1_definition);
      expect(level4_unionMember_object.getNamedParent(/badregex$/)).toBeUndefined();
      expect(level4_unionMember_object.getNamedParent('badname')).toBeUndefined();
    });

    test(`getDefinition() works`, () => {
      expect(level4_unionMember_object.getDefinition()).toBe(level1_definition);
    });

    test(`getSourceFile() works`, () => {
      expect(level4_unionMember_object.getSourceFile()).toBe(level0_sourceFile);
    });

    describe(`getChildren()`, () => {
      const predicate = (n: any) => !!n.findMe

      test(`Undefined if empty`, () => expect(createFakeNode().getChildren()).toBeUndefined());
      test(`Returns all children`, () => expect(fakeParent.getChildren()?.toArray()).toEqual(fakeChildren));
      test(`Returns all children (deep)`, () => {
        const children = fakeParent.getChildren(true)?.toArray();
        const expected = [ ...fakeChildren, ...fakeGrandChildren ];
        expect(children).toEqual(expect.arrayContaining(expected));
        expect(children?.length).toBe(expected.length);
      });
      test(`Predicate works`, () => {
        expect(fakeParent.getChildren(false, predicate)?.toArray()).toEqual(findableChildren)
      });
      test(`Predicate works (deep)`, () => {
        const children = fakeParent.getChildren(true, predicate)?.toArray();
        const expected = [ ...findableChildren, ...findableGrandChildren ];
        expect(children).toEqual(expect.arrayContaining(expected));
        expect(children?.length).toBe(expected.length);
      });
    });

    test(`forEachChild() works`, () => {
      const res: Node[] = [];
      fakeParent.forEachChild((child, key) => {
        res.push(child);
        const expectedKey = mapChildren.includes(<any>child) ? 'childMap' :
                            setChildren.includes(<any>child) ? 'childSet' :
                            'child';
        expect(key).toBe(expectedKey);
      });

      expect(res).toEqual(fakeChildren);
    });
  });

  describe(`Utility Methods`, () => {
    describe(`delete()`, () => {
      const node = createFakeNode();
      const refNode = createFakeNode(/* parent */ node, { target: node }, NodeKind.Reference) as ReferenceNode;
      const unbreakableRefNode = createFakeNode(/* parent */ node, { target: node }, NodeKind.Reference) as ReferenceNode;
      const children = createFakeNodes(3);
      const replacementNode = createFakeNode();
      const brokenReferenceReplacer = jest.fn().mockReturnValue(replacementNode);

      let removeThisFromParentSpy: jest.SpyInstance;
      let getChildrenSpy: jest.SpyInstance;
      beforeAll(() => {
        /* Setup mocks */
        removeThisFromParentSpy = jest.spyOn(node, <any>'removeThisFromParent').mockImplementation();
        getChildrenSpy = jest.spyOn(node, 'getChildren').mockReturnValue(NodeSet.from(children));
        children.forEach(c => Object.assign(c, { delete: jest.fn() }));
        [ refNode, unbreakableRefNode ].forEach(r => jest.spyOn(r, 'replace').mockImplementation());

        // Locks target in place, which simulates target being resolvable
        Object.defineProperty(unbreakableRefNode, 'target', { get: () => 'fixed', set: () => {} });

        (<any>node)._referencesToThis.add(refNode);
        (<any>node)._referencesToThis.add(unbreakableRefNode);

        node.delete(brokenReferenceReplacer);
      });
      afterAll(jest.restoreAllMocks);

      test(`Calls removeThisFromParent()`, () => expect(removeThisFromParentSpy).toHaveBeenCalledWith());

      test(`Calls delete() on all descendants`, () => {
        expect(getChildrenSpy).toHaveBeenCalledTimes(1);
        expect(getChildrenSpy).toHaveBeenCalledWith(true);
        children.forEach(c => expect((<jest.SpyInstance><any>c.delete)).toHaveBeenCalledWith(brokenReferenceReplacer));
      });

      test(`Calls replace() on broken references & preserves un-broken references`, () => {
        expect(<jest.SpyInstance><any>refNode.replace).toHaveBeenCalledWith(replacementNode);
        expect(<jest.SpyInstance><any>unbreakableRefNode.replace).not.toHaveBeenCalled();
        expect(brokenReferenceReplacer).toHaveBeenCalledTimes(1);
        expect(brokenReferenceReplacer).toHaveBeenCalledWith(refNode);
      });

      test(`Deletes all properties & sets null prototype`, () => {
        expect(Object.getPrototypeOf(node)).toBe(null);
        expect(Object.getOwnPropertyNames(node)).toEqual([]);
      });
    });

    test(`clone() works`, () => {
      const node = createFakeNode();
      const newNode = createFakeNode();
      const cloneNodeSpy = jest.spyOn(cloneNodeModule, 'cloneNode').mockReturnValue(newNode);

      expect(node.clone(fakeParent)).toBe(newNode);
      expect(cloneNodeSpy).toHaveBeenCalledWith(node);
      expect(newNode.parent).toBe(fakeParent);

      cloneNodeSpy.mockRestore();
    });

    describe(`replace()`, () => {
      let node: Node;
      let newNode: Node;
      let deleteNodeSpy: jest.SpyInstance;
      const brokenRefReplacer = jest.fn();

      beforeEach(() => {
        node = createFakeNode(fakeParent);
        deleteNodeSpy = jest.spyOn(node, 'delete');
        newNode = createFakeNode(/* parent */ void 0, { newNode: true });
        brokenRefReplacer.mockReset();
      });

      test(`(reuseMemory = true) Replaces node in place`, () => {
        const res = node.replace(newNode, brokenRefReplacer, /* reuseMemory */ true);
        expect(res).not.toBe(newNode);
        expect(newNode.parent).toBe(fakeParent);
        expect(makeJestSafe(Object.getOwnPropertyDescriptors(res)))
          .toMatchObject(makeJestSafe(Object.getOwnPropertyDescriptors(newNode)));
        expect(deleteNodeSpy).not.toHaveBeenCalled();
      });

      test(`(reuseMemory = false) Returns new node & deletes old`, () => {
        const res = node.replace(newNode, brokenRefReplacer);
        expect(deleteNodeSpy).toHaveBeenCalledWith(brokenRefReplacer);
        expect(res).toBe(newNode);
      });
    });

    // TODO - Implement when logic is done
    // test.todo(`compile()`);

    test(`updateProperties() works`, () => {
      const newProps = { parent: fakeGrandParent, kind: 99, special: 'hello' };
      expect(makeJestSafe(createFakeNode(fakeParent).updateProperties(newProps))).toMatchObject(makeJestSafe(newProps));
    });

    describe(`cleanup()`, () => {
      const optionalChildSet = new NodeSet(createFakeNodes(1));
      const childSet = new NodeSet(createFakeNodes(1))
      const optionalChildMap = new NodeMap(createFakeNodes(1));
      const childMap = new NodeMap(createFakeNodes(1));
      const nodeProps = {
        child: { nonNode: true }, // Non-node, should be deleted
        emptyOptionalChildSet: new NodeSet(),
        emptyChildSet: new NodeSet(),
        emptyOptionalChildMap: new NodeMap(),
        emptyChildMap: new NodeMap(),
        optionalChildSet,
        childSet,
        optionalChildMap,
        childMap
      };
      const node = createFakeNode(void 0, nodeProps) as Node & typeof nodeProps;
      let mapPruneSpy: jest.SpyInstance;
      let setPruneSpy: jest.SpyInstance;
      let refPruneSpy: jest.SpyInstance;

      beforeAll(() => {
        mapPruneSpy = jest.spyOn(NodeMap.prototype, 'prune').mockImplementation();
        setPruneSpy = jest.spyOn(NodeSet.prototype, 'prune').mockImplementation();
        refPruneSpy = jest.fn();

        (<any>node)._referencesToThis = { prune: refPruneSpy };

        (<any>node)._metadata = {
          ...(<any>node)._metadata,
          childContainerProperties: new Map([
            [ 'child', { key: 'child', optional: false } ],
            [ 'emptyOptionalChildSet', { key: 'emptyOptionalChildSet', optional: true } ],
            [ 'emptyOptionalChildMap', { key: 'emptyOptionalChildMap', optional: true } ],
            [ 'emptyChildSet', { key: 'emptyChildSet', optional: false } ],
            [ 'emptyChildMap', { key: 'emptyChildMap', optional: false } ],
            [ 'optionalChildSet', { key: 'optionalChildSet', optional: true } ],
            [ 'optionalChildMap', { key: 'optionalChildMap', optional: true } ],
            [ 'childSet', { key: 'childSet', optional: false } ],
            [ 'childMap', { key: 'childMap', optional: false } ],
          ])
        }

        node.cleanup();
      });
      afterAll(jest.restoreAllMocks);

      test(`Single non-node property gets set to undefined`, () => expect(node.child).toBeUndefined());
      test(`Empty optional Node Iterables get set to undefined`, () => {
        expect(node.emptyOptionalChildSet).toBeUndefined();
        expect(node.emptyOptionalChildMap).toBeUndefined();
      });
      test(`Non-empty Node Iterables are preserved (regardless of optionality)`, () => {
        expect(node.optionalChildSet).toBe(optionalChildSet);
        expect(node.optionalChildMap).toBe(optionalChildMap);
        expect(node.childSet).toBe(childSet);
        expect(node.childMap).toBe(childMap);
      });
      test(`Calls prune() on all non-empty Node Iterables`, () => {
        expect(mapPruneSpy).toHaveBeenCalledTimes(2);
        expect(makeJestSafe(mapPruneSpy.mock.instances)).toEqual(makeJestSafe([ optionalChildMap, childMap ]));
        expect(setPruneSpy).toHaveBeenCalledTimes(2);
        expect(makeJestSafe(setPruneSpy.mock.instances)).toEqual(makeJestSafe([ optionalChildSet, childSet ]));
      })
      test(`Calls prune() on internal references set`, () => expect(refPruneSpy).toHaveBeenCalled());
      test(`Calls prune() on internal references set`, () => expect(refPruneSpy).toHaveBeenCalled());
    });

    test(`fixup() works`, () => {
      const allNodes = [ fakeParent, ...fakeChildren, ...fakeGrandChildren ];
      const updatePropertiesSpy = jest.spyOn(NodeObject.prototype, 'updateProperties').mockImplementation();
      const cleanupSpy = jest.spyOn(NodeObject.prototype, 'cleanup').mockImplementation();
      (<NodeObject>fakeParent).fixup();

      expect(makeJestSafe(updatePropertiesSpy.mock.instances)).toEqual(expect.arrayContaining(makeJestSafe(allNodes)));
      expect(makeJestSafe(updatePropertiesSpy.mock.instances)).toHaveLength(allNodes.length);

      expect(makeJestSafe(cleanupSpy.mock.instances)).toEqual(expect.arrayContaining(makeJestSafe(allNodes)));
      expect(makeJestSafe(cleanupSpy.mock.instances)).toHaveLength(allNodes.length);

      jest.restoreAllMocks();
    });

    test(`removeThisFromParent() works`, () => {
      const node = createFakeNode();
      const childNode = createFakeNode(node) as NamedNode<any>;
      const childNodeMap = new NodeMap([ childNode ]);
      const childNodeSet = new NodeSet([ childNode ]);
      const nodeMap = new NodeMap([ childNode ]);
      const nodeSet = new NodeSet([ childNode ]);

      Object.assign(node, { child: childNode, nonChild: childNode, childNodeMap, childNodeSet, nodeMap, nodeSet });

      (<any>node)._metadata = Object.assign({}, (<any>node)._metadata, {
        childContainerProperties: new Map([
          [ 'child', { key: 'child', optional: false } ],
          [ 'childNodeMap', { key: 'childNodeMap', optional: false } ],
          [ 'childNodeSet', { key: 'childNodeSet', optional: false } ]
        ])
      });

      (<any>childNode).removeThisFromParent();

      expect(childNodeMap.size).toBe(0);
      expect(childNodeSet.size).toBe(0);
      expect(makeJestSafe(nodeMap)).toEqual(makeJestSafe(new NodeMap([ childNode ])));
      expect(makeJestSafe(nodeSet)).toEqual(makeJestSafe(new NodeSet([ childNode ])));
      expect(makeJestSafe((<any>node).child)).toBeUndefined();
      expect((<any>node).nonChild).toBe(childNode);
    });
  });
});
