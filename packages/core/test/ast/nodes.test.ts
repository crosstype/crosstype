import { DefinitionNode, Node, ObjectLikeNode } from '#ast/node-types';
import { DefinitionFlags, NodeKind, NodeObject, OrderKind } from '#ast';
import {
  createAnonymousClass, createAnonymousFunctionNode, createAnythingNode, createArrayNode, createBooleanNode,
  createBottomNode, createByteNode, createCharacterNode, createClassDeclaration, createComplexNumberNode,
  createDateNode, createDateTimeLiteral, createDateTimeNode, createDecimalLiteral, createDecimalNumberNode,
  createDefinitionNode, createEnumDeclaration, createEnumMemberDeclaration, createFalseLiteral,
  createFunctionDeclaration, createGenericIterable, createImaginaryNumberLiteral, createInfinityNode,
  createIntegerLiteral, createIntegerNode, createInterfaceDeclaration, createIntersectionNode, createLinkedListNode,
  createListNode, createMapNode, createMethodDeclaration, createMultiSetNode, createNamespaceNode, createNotANumberNode,
  createNothingNode, createNullNode, createObjectNode, createParameterNode, createPropertyDeclaration,
  createReferenceNode, createRegExpLiteral, createRegExpNode, createSetNode, createSignatureNode, createSourceFileNode,
  createStringLiteral, createStringNode, createSymbolLiteral, createSymbolNode, createTopNode, createTrueLiteral,
  createTupleNode, createTypeArgumentNode, createTypeDeclaration, createTypeParameterDeclaration, createUnionNode,
  createVariableDeclaration, isAnonymousClass, isAnonymousFunctionNode, isAnythingNode, isArrayNode, isBooleanNode,
  isBottomNode, isByteNode, isCharacterNode, isClassDeclaration, isClassLikeNode, isComplexNumberNode, isDateLikeNode,
  isDateNode, isDateTimeLiteral, isDateTimeNode, isDecimalLiteral, isDecimalNumberNode, isDeclaration, isDefinitionNode,
  isEnumDeclaration, isEnumMemberDeclaration, isFalseLiteral, isFunctionDeclaration, isFunctionNode, isGenericIterable,
  isImaginaryNumberLiteral, isInfinityNode, isIntegerLiteral, isIntegerNode, isInterfaceDeclaration, isIntersectionNode,
  isIterableNode, isLinkedListNode, isListNode, isMapNode, isMethodDeclaration, isModuleNode, isMultiSetNode,
  isNamedNode, isNamespaceNode, isNotANumberNode, isNothingNode, isNullNode, isNumericNode, isObjectLikeMember,
  isObjectLikeNode, isObjectNode, isParameterNode, isPropertyDeclaration, isRealNumberLiteral, isRealNumberNode,
  isReferenceNode, isRegExpLiteral, isRegExpNode, isSetNode, isSignatureNode, isSourceFileNode, isStringLiteral,
  isStringNode, isSymbolLiteral, isSymbolNode, isTopNode, isTrueLiteral, isTupleNode, isTypeArgumentNode,
  isTypeDeclaration, isTypeParameterDeclaration, isUnionNode, isVariableDeclaration
} from '#ast/utilities';
import { NodeForKind } from '#ast/node-lookups';
import { nodeMetadata } from '#ast/node-metadata';
import { RootDeclaration } from '#ast/node-aliases';
import { NodeMap } from '#ast/components';
import { OneOrMore } from '@crosstype/system';


/* ****************************************************************************************************************** *
 * Config
 * ****************************************************************************************************************** */

type TypeGuard = (v: any) => boolean;

const factories: Array<[ string, (properties?: any) => Node, NodeKind, OneOrMore<TypeGuard> ]> = [
  /* No special tests */
  [ 'NamespaceNode', createNamespaceNode, NodeKind.Namespace, [ isNamespaceNode, isModuleNode ] ],
  [ 'SourceFileNode', createSourceFileNode, NodeKind.SourceFile, [ isSourceFileNode, isModuleNode ] ],
  [ 'StringNode', createStringNode, NodeKind.String, isStringNode ],
  [ 'CharacterNode', createCharacterNode, NodeKind.Character, isCharacterNode ],
  [ 'ByteNode', createByteNode, NodeKind.Byte, isByteNode ],
  [ 'RegExpNode', createRegExpNode, NodeKind.RegExp, isRegExpNode ],
  [ 'SymbolNode', createSymbolNode, NodeKind.Symbol, isSymbolNode ],
  [ 'BooleanNode', createBooleanNode, NodeKind.Boolean, isBooleanNode ],
  [ 'IntegerNode', createIntegerNode, NodeKind.Integer, [ isIntegerNode, isRealNumberNode, isNumericNode ] ],
  [ 'DecimalNumberNode', createDecimalNumberNode, NodeKind.Decimal, [ isDecimalNumberNode, isRealNumberNode, isNumericNode ] ],
  [ 'ComplexNumberNode', createComplexNumberNode, NodeKind.ComplexNumber, [ isComplexNumberNode, isNumericNode ] ],
  [ 'NotANumberNode', createNotANumberNode, NodeKind.NotANumber, [ isNotANumberNode, isNumericNode ] ],
  [ 'InfinityNode', createInfinityNode, NodeKind.Infinity, [ isInfinityNode, isNumericNode ] ],
  [ 'StringLiteral', createStringLiteral, NodeKind.StringLiteral, isStringLiteral ],
  [ 'TrueLiteral', createTrueLiteral, NodeKind.TrueLiteral, isTrueLiteral ],
  [ 'FalseLiteral', createFalseLiteral, NodeKind.FalseLiteral, isFalseLiteral ],
  [ 'RegExpLiteral', createRegExpLiteral, NodeKind.RegExpLiteral, isRegExpLiteral ],
  [ 'DateTimeLiteral', createDateTimeLiteral, NodeKind.DateTimeLiteral, isDateTimeLiteral ],
  [ 'SymbolLiteral', createSymbolLiteral, NodeKind.SymbolLiteral, isSymbolLiteral ],
  [ 'IntegerLiteral', createIntegerLiteral, NodeKind.IntegerLiteral, [ isIntegerLiteral, isRealNumberLiteral ] ],
  [ 'DecimalLiteral', createDecimalLiteral, NodeKind.DecimalLiteral, [ isDecimalLiteral, isRealNumberLiteral ] ],
  [ 'ImaginaryNumberLiteral', createImaginaryNumberLiteral, NodeKind.ImaginaryNumberLiteral, isImaginaryNumberLiteral ],
  [ 'GenericIterable', createGenericIterable, NodeKind.GenericIterable, [ isGenericIterable, isIterableNode ] ],
  [ 'EnumMemberDeclaration', createEnumMemberDeclaration, NodeKind.EnumMemberDeclaration, [ isEnumMemberDeclaration, isDeclaration, isNamedNode ] ],
  [ 'TupleNode', createTupleNode, NodeKind.Tuple, isTupleNode ],
  [ 'ObjectNode', createObjectNode, NodeKind.Object, [ isObjectNode, isObjectLikeNode ] ],
  [ 'ClassDeclaration', createClassDeclaration, NodeKind.ClassDeclaration, [ isClassDeclaration, isObjectLikeNode, isClassLikeNode, isNamedNode ] ],
  [ 'AnonymousClass', createAnonymousClass, NodeKind.AnonymousClass, [ isAnonymousClass, isClassLikeNode, isObjectLikeNode ] ],
  [ 'InterfaceDeclaration', createInterfaceDeclaration, NodeKind.InterfaceDeclaration, [ isInterfaceDeclaration, isObjectLikeNode, isClassLikeNode, isNamedNode ] ],
  [ 'PropertyDeclaration', createPropertyDeclaration, NodeKind.PropertyDeclaration, [ isPropertyDeclaration, isObjectLikeMember, isNamedNode ] ],
  [ 'MethodDeclaration', createMethodDeclaration, NodeKind.MethodDeclaration, [ isMethodDeclaration, isObjectLikeMember, isNamedNode ] ],
  [ 'DateNode', createDateNode, NodeKind.Date, [ isDateNode, isDateLikeNode ] ],
  [ 'DateTimeNode', createDateTimeNode, NodeKind.DateTime, [ isDateTimeNode, isDateLikeNode ] ],
  [ 'FunctionDeclaration', createFunctionDeclaration, NodeKind.FunctionDeclaration, [ isFunctionDeclaration, isFunctionNode, isNamedNode ] ],
  [ 'AnonymousFunctionNode', createAnonymousFunctionNode, NodeKind.AnonymousFunction, [ isAnonymousFunctionNode, isFunctionNode ] ],
  [ 'SignatureNode', createSignatureNode, NodeKind.Signature, isSignatureNode ],
  [ 'ParameterNode', createParameterNode, NodeKind.Parameter, [ isParameterNode, isNamedNode ] ],
  [ 'TypeParameterDeclaration', createTypeParameterDeclaration, NodeKind.TypeParameterDeclaration, [ isTypeParameterDeclaration, isDeclaration, isNamedNode ] ],
  [ 'TypeDeclaration', createTypeDeclaration, NodeKind.TypeDeclaration, [ isTypeDeclaration, isDeclaration, isNamedNode ] ],
  [ 'VariableDeclaration', createVariableDeclaration, NodeKind.VariableDeclaration, [ isVariableDeclaration, isDeclaration, isNamedNode ] ],
  [ 'UnionNode', createUnionNode, NodeKind.Union, isUnionNode ],
  [ 'IntersectionNode', createIntersectionNode, NodeKind.Intersection, isIntersectionNode ],
  [ 'TopNode', createTopNode, NodeKind.Anything, isTopNode ],
  [ 'BottomNode', createBottomNode, NodeKind.Nothing, isBottomNode ],
  [ 'AnythingNode', createAnythingNode, NodeKind.Anything, isAnythingNode ],
  [ 'NothingNode', createNothingNode, NodeKind.Nothing, isNothingNode ],
  [ 'NullNode', createNullNode, NodeKind.Null, isNullNode ],

  /* With special tests */
  [ 'DefinitionNode', createDefinitionNode, NodeKind.Definition, [ isDefinitionNode, isNamedNode ] ],
  [ 'ArrayNode', createArrayNode, NodeKind.Array, [ isArrayNode, isIterableNode ] ],
  [ 'MapNode', createMapNode, NodeKind.Map, [ isMapNode, isIterableNode ] ],
  [ 'MultiSetNode', createMultiSetNode, NodeKind.MultiSet, [ isMultiSetNode, isIterableNode ] ],
  [ 'SetNode', createSetNode, NodeKind.Set, [ isSetNode, isIterableNode ] ],
  [ 'ListNode', createListNode, NodeKind.List, [ isListNode, isIterableNode ] ],
  [ 'LinkedListNode', createLinkedListNode, NodeKind.LinkedList, [ isLinkedListNode, isIterableNode ] ],
  [ 'EnumDeclaration', createEnumDeclaration, NodeKind.EnumDeclaration, [ isEnumDeclaration, isDeclaration, isNamedNode ] ],
  [ 'TypeArgumentNode', createTypeArgumentNode, NodeKind.TypeArgument, [ isTypeArgumentNode, isNamedNode ] ],
  [ 'ReferenceNode', createReferenceNode, NodeKind.Reference, isReferenceNode ],
];

const objectFactories: Array<[ string, (properties?: any) => Node ]> = [
  [ 'ObjectNode', createObjectNode ],
  [ 'ClassDeclaration', createClassDeclaration ],
  [ 'AnonymousClass', createAnonymousClass ],
  [ 'InterfaceDeclaration', createInterfaceDeclaration ]
];

/* ****************************************************************************************************************** *
 * Test
 * ****************************************************************************************************************** */

describe(`Node Tests`, () => {
  describe(`Factories & TypeGuards`, () => {
    test.each(factories)(`%s`, (name, factoryFn, kind, guards) => {
      const nodeIsKind = <K extends NodeKind>(node: Node, k: K): node is NodeForKind<K> => (kind === k);
      const props = { a: 1, b: 2 };
      const { baseFlags, baseTypeFlags } = nodeMetadata[kind];
      const node = factoryFn(props);

      expect(node).toBeInstanceOf(NodeObject);
      expect(node.kind).toBe(kind);
      expect(node).toMatchObject(props);
      if (baseFlags) expect(node.flags & baseFlags.reduce((p, c) => p + c)).toBeTruthy();
      if (baseTypeFlags) expect(node.typeFlags & baseTypeFlags.reduce((p, c) => p + c)).toBeTruthy();

      [ guards ].flat().forEach(guard => expect(guard(node)).toBe(true));

      /* Custom properties set in factory function */
      if (nodeIsKind(node, NodeKind.Array)) {
        expect(node.orderKind).toBe(OrderKind.Index);
        expect(node.indexType.kind).toBe(NodeKind.Integer);
      } else if (nodeIsKind(node, NodeKind.Map))
        expect(node).toMatchObject({ resizable: true, uniqueMembers: true, orderKind: OrderKind.Index })
      else if (nodeIsKind(node, NodeKind.MultiSet))
        expect(node).toMatchObject({ uniqueMembers: false });
      else if (nodeIsKind(node, NodeKind.List)) {
        expect(node).toMatchObject({ resizable: true, orderKind: OrderKind.Index });
        expect(node.indexType.kind).toBe(NodeKind.Integer);
      } else if (nodeIsKind(node, NodeKind.LinkedList))
        expect(node).toMatchObject({ orderKind: OrderKind.Link });
    });
  })

  describe(`Property Descriptor Behaviours`, () => {
    test(`DefinitionNode -> definitionFlags`, () => {
      let node: DefinitionNode = createDefinitionNode({
        name: 'd',
        declarations: new NodeMap<RootDeclaration>(),
        primary: false
      });

      // Initialized with no flags
      let definitionFlags = node.definitionFlags;
      expect(definitionFlags).toBe(DefinitionFlags.None);

      // Adding typeArguments sets Parameterized flag
      node.typeArguments = new NodeMap([
        createTypeArgumentNode({
          type: <any>null,
          association: createTypeParameterDeclaration({ name: 'param1' })
        })
      ]);
      definitionFlags = node.definitionFlags
      expect(definitionFlags & DefinitionFlags.Parameterized).toBeTruthy();
      expect(definitionFlags & DefinitionFlags.Function).toBeFalsy();
      expect(definitionFlags & DefinitionFlags.Type).toBeFalsy();
      expect(definitionFlags & DefinitionFlags.Class).toBeFalsy();
      expect(definitionFlags & DefinitionFlags.Interface).toBeFalsy();
      expect(definitionFlags & DefinitionFlags.Enum).toBeFalsy();
      expect(definitionFlags & DefinitionFlags.Variable).toBeFalsy();

      // Adding FunctionDeclaration sets Function flag & HasMultipleDeclarations flag (due to more than 1 definition)
      node.declarations.add(createFunctionDeclaration(<any>{ name: '1' }));
      definitionFlags = node.definitionFlags
      expect(definitionFlags & DefinitionFlags.HasMultipleDeclarations).toBeFalsy();
      expect(definitionFlags & DefinitionFlags.Function).toBeTruthy();
      expect(definitionFlags & DefinitionFlags.Type).toBeFalsy();
      expect(definitionFlags & DefinitionFlags.Class).toBeFalsy();
      expect(definitionFlags & DefinitionFlags.Interface).toBeFalsy();
      expect(definitionFlags & DefinitionFlags.Enum).toBeFalsy();
      expect(definitionFlags & DefinitionFlags.Variable).toBeFalsy();

      // Adding TypeDeclaration sets Type flag
      node.declarations.add(createTypeDeclaration(<any>{ name: '2' }));
      definitionFlags = node.definitionFlags
      expect(definitionFlags & DefinitionFlags.Function).toBeTruthy();
      expect(definitionFlags & DefinitionFlags.Type).toBeTruthy();
      expect(definitionFlags & DefinitionFlags.Class).toBeFalsy();
      expect(definitionFlags & DefinitionFlags.Interface).toBeFalsy();
      expect(definitionFlags & DefinitionFlags.Enum).toBeFalsy();
      expect(definitionFlags & DefinitionFlags.Variable).toBeFalsy();

      // Adding ClassDeclaration sets Class flag
      node.declarations.add(createClassDeclaration(<any>{ name: '3' }));
      definitionFlags = node.definitionFlags
      expect(definitionFlags & DefinitionFlags.Type).toBeTruthy();
      expect(definitionFlags & DefinitionFlags.Class).toBeTruthy();
      expect(definitionFlags & DefinitionFlags.Interface).toBeFalsy();
      expect(definitionFlags & DefinitionFlags.Enum).toBeFalsy();
      expect(definitionFlags & DefinitionFlags.Variable).toBeFalsy();

      // Adding InterfaceDeclaration sets Interface flag
      node.declarations.add(createInterfaceDeclaration(<any>{ name: '4' }));
      definitionFlags = node.definitionFlags
      expect(definitionFlags & DefinitionFlags.Type).toBeTruthy();
      expect(definitionFlags & DefinitionFlags.Class).toBeTruthy();
      expect(definitionFlags & DefinitionFlags.Interface).toBeTruthy();
      expect(definitionFlags & DefinitionFlags.Enum).toBeFalsy();
      expect(definitionFlags & DefinitionFlags.Variable).toBeFalsy();

      // Adding EnumDeclaration sets Enum flag
      node.declarations.add(createEnumDeclaration(<any>{ name: '5' }));
      definitionFlags = node.definitionFlags
      expect(definitionFlags & DefinitionFlags.Type).toBeTruthy();
      expect(definitionFlags & DefinitionFlags.Class).toBeTruthy();
      expect(definitionFlags & DefinitionFlags.Interface).toBeTruthy();
      expect(definitionFlags & DefinitionFlags.Enum).toBeTruthy();
      expect(definitionFlags & DefinitionFlags.Variable).toBeFalsy();

      // Adding VariableDeclaration sets Variable flag
      node.declarations.add(createVariableDeclaration(<any>{ name: '6' }));
      definitionFlags = node.definitionFlags
      expect(definitionFlags & DefinitionFlags.Type).toBeTruthy();
      expect(definitionFlags & DefinitionFlags.Class).toBeTruthy();
      expect(definitionFlags & DefinitionFlags.Interface).toBeTruthy();
      expect(definitionFlags & DefinitionFlags.Enum).toBeTruthy();
      expect(definitionFlags & DefinitionFlags.Variable).toBeTruthy();
    });

    test(`EnumDeclaration -> keys & values`, () => {
      const node = createEnumDeclaration({
        members: new NodeMap([ createEnumMemberDeclaration({ name: '1' }) ]),
        name: 'enum1'
      });

      expect(node.keys).toEqual([ ...node.members.keys() ]);
      expect(node.values).toEqual([ ...node.members.values() ]);
    });

    test(`TypeArgumentNode -> name`, () => {
      const node = createTypeArgumentNode({
        type: <any>null,
        association: createTypeParameterDeclaration({ name: 'param1' })
      });

      expect(node.name).toBe(node.association.name);
    });

    test.each(objectFactories)(`%s -> methods & properties`, (name, factoryFn) => {
      const prop = createPropertyDeclaration(<any>{ name: 'prop' });
      const method = createMethodDeclaration(<any>{ name: 'method' });
      const members = new NodeMap([ prop, method ]);
      const node = factoryFn({ members }) as ObjectLikeNode;

      expect(node.properties!.toArray()).toEqual([ prop ]);
      expect(node.methods!.toArray()).toEqual([ method ]);
    });

    // NOTE - ReferenceNode 'target' logic in separate test file -> reference-node.test.ts
  });
});
