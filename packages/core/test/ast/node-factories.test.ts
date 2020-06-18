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
  createStringLiteralNode, createStringNode, createSymbolLiteral, createSymbolNode, createTopNode, createTrueLiteral,
  createTupleNode, createTypeArgumentNode, createTypeDeclaration, createTypeParameterDeclaration, createUnionNode,
  createVariableDeclaration
} from '#ast/utilities';
import { NodeForKind } from '#ast/node-lookups';
import { nodeMetadata } from '#ast/node-metadata';
import { RootDeclaration } from '#ast/node-aliases';
import { NodeMap } from '#ast/components';


/* ****************************************************************************************************************** *
 * Config
 * ****************************************************************************************************************** */

const factories: Array<[ string, (properties?: any) => Node, NodeKind ]> = [
  /* No special tests */
  [ 'NamespaceNode', createNamespaceNode, NodeKind.Namespace ],
  [ 'SourceFileNode', createSourceFileNode, NodeKind.SourceFile ],
  [ 'StringNode', createStringNode, NodeKind.String ],
  [ 'CharacterNode', createCharacterNode, NodeKind.Character ],
  [ 'ByteNode', createByteNode, NodeKind.Byte ],
  [ 'RegExpNode', createRegExpNode, NodeKind.RegExp ],
  [ 'SymbolNode', createSymbolNode, NodeKind.Symbol ],
  [ 'BooleanNode', createBooleanNode, NodeKind.Boolean ],
  [ 'IntegerNode', createIntegerNode, NodeKind.Integer ],
  [ 'DecimalNumberNode', createDecimalNumberNode, NodeKind.DecimalNumber ],
  [ 'ComplexNumberNode', createComplexNumberNode, NodeKind.ComplexNumber ],
  [ 'NotANumberNode', createNotANumberNode, NodeKind.NotANumber ],
  [ 'InfinityNode', createInfinityNode, NodeKind.Infinity ],
  [ 'StringLiteralNode', createStringLiteralNode, NodeKind.StringLiteral ],
  [ 'TrueLiteral', createTrueLiteral, NodeKind.TrueLiteral ],
  [ 'FalseLiteral', createFalseLiteral, NodeKind.FalseLiteral ],
  [ 'RegExpLiteral', createRegExpLiteral, NodeKind.RegExpLiteral ],
  [ 'DateTimeLiteral', createDateTimeLiteral, NodeKind.DateTimeLiteral ],
  [ 'SymbolLiteral', createSymbolLiteral, NodeKind.SymbolLiteral ],
  [ 'IntegerLiteral', createIntegerLiteral, NodeKind.IntegerLiteral ],
  [ 'DecimalLiteral', createDecimalLiteral, NodeKind.DecimalLiteral ],
  [ 'ImaginaryNumberLiteral', createImaginaryNumberLiteral, NodeKind.ImaginaryNumberLiteral ],
  [ 'GenericIterable', createGenericIterable, NodeKind.GenericIterable ],
  [ 'EnumMemberDeclaration', createEnumMemberDeclaration, NodeKind.EnumMemberDeclaration ],
  [ 'TupleNode', createTupleNode, NodeKind.Tuple ],
  [ 'ObjectNode', createObjectNode, NodeKind.Object ],
  [ 'ClassDeclaration', createClassDeclaration, NodeKind.ClassDeclaration ],
  [ 'AnonymousClass', createAnonymousClass, NodeKind.AnonymousClass ],
  [ 'InterfaceDeclaration', createInterfaceDeclaration, NodeKind.InterfaceDeclaration ],
  [ 'PropertyDeclaration', createPropertyDeclaration, NodeKind.PropertyDeclaration ],
  [ 'MethodDeclaration', createMethodDeclaration, NodeKind.MethodDeclaration ],
  [ 'DateNode', createDateNode, NodeKind.Date ],
  [ 'DateTimeNode', createDateTimeNode, NodeKind.DateTime ],
  [ 'FunctionDeclaration', createFunctionDeclaration, NodeKind.FunctionDeclaration ],
  [ 'AnonymousFunctionNode', createAnonymousFunctionNode, NodeKind.AnonymousFunction ],
  [ 'SignatureNode', createSignatureNode, NodeKind.Signature ],
  [ 'ParameterNode', createParameterNode, NodeKind.Parameter ],
  [ 'TypeParameterDeclaration', createTypeParameterDeclaration, NodeKind.TypeParameterDeclaration ],
  [ 'TypeDeclaration', createTypeDeclaration, NodeKind.TypeDeclaration ],
  [ 'VariableDeclaration', createVariableDeclaration, NodeKind.VariableDeclaration ],
  [ 'UnionNode', createUnionNode, NodeKind.Union ],
  [ 'IntersectionNode', createIntersectionNode, NodeKind.Intersection ],
  [ 'TopNode', createTopNode, NodeKind.Anything ],
  [ 'BottomNode', createBottomNode, NodeKind.Nothing ],
  [ 'AnythingNode', createAnythingNode, NodeKind.Anything ],
  [ 'NothingNode', createNothingNode, NodeKind.Nothing ],
  [ 'NullNode', createNullNode, NodeKind.Null ],

  /* With special tests */
  [ 'DefinitionNode', createDefinitionNode, NodeKind.Definition ],
  [ 'ArrayNode', createArrayNode, NodeKind.Array ],
  [ 'MapNode', createMapNode, NodeKind.Map ],
  [ 'MultiSetNode', createMultiSetNode, NodeKind.MultiSet ],
  [ 'SetNode', createSetNode, NodeKind.Set ],
  [ 'ListNode', createListNode, NodeKind.List ],
  [ 'LinkedListNode', createLinkedListNode, NodeKind.LinkedList ],
  [ 'EnumDeclaration', createEnumDeclaration, NodeKind.EnumDeclaration ],
  [ 'TypeArgumentNode', createTypeArgumentNode, NodeKind.TypeArgument ],
  [ 'ReferenceNode', createReferenceNode, NodeKind.Reference ],
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

describe(`Node Factories`, () => {
  describe(`Creates with correct properties`, () => {
    test.each(factories)(`%s`, (name, factoryFn, kind) => {
      const nodeIsKind = <K extends NodeKind>(node: Node, k: K): node is NodeForKind<K> => (kind === k);
      const props = { a: 1, b: 2 };
      const { baseFlags, baseTypeFlags } = nodeMetadata[kind];
      const node = factoryFn(props);

      expect(node).toBeInstanceOf(NodeObject);
      expect(node.kind).toBe(kind);
      expect(node).toMatchObject(props);
      if (baseFlags) expect(node.flags & baseFlags.reduce((p, c) => p + c)).toBeTruthy();
      if (baseTypeFlags) expect(node.typeFlags & baseTypeFlags.reduce((p, c) => p + c)).toBeTruthy();

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

  describe(`Property Descriptor behaviour is correct`, () => {
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
