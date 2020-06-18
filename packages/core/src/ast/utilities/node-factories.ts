import { DefinitionFlags, NodeFlags, NodeKind, OrderKind, TypeFlags } from '#ast/enums';
import {
  AnonymousClass, AnonymousFunctionNode, AnythingNode, ArrayNode, BooleanNode, ByteNode, CharacterNode,
  ClassDeclaration, ComplexNumberNode, DateNode, DateTimeLiteral, DateTimeNode, DecimalLiteral, DecimalNumberNode,
  DefinitionNode, EnumDeclaration, EnumMemberDeclaration, FalseLiteral, FunctionDeclaration, GenericIterable,
  ImaginaryNumberLiteral, InfinityNode, IntegerLiteral, IntegerNode, InterfaceDeclaration, IntersectionNode,
  LinkedListNode, ListNode, MapNode, MethodDeclaration, MultiSetNode, NamespaceNode, Node, NotANumberNode, NothingNode,
  NullNode, ObjectNode, ObjectNodeBase, ParameterNode, PropertyDeclaration, ReferenceNode, RegExpLiteral, RegExpNode,
  SetNode, SignatureNode, SourceFileNode, StringLiteral, StringNode, SymbolLiteral, SymbolNode, TrueLiteral, TupleNode,
  TypeArgumentNode, TypeDeclaration, TypeParameterDeclaration, UnionNode, VariableDeclaration
} from '#ast/node-types';
import { omit } from '@crosstype/system';
import { NodeForKind } from '#ast/node-lookups';
import { NodeObject } from '#ast/node-object';
import {
  isClassDeclaration, isDeclaration, isEnumDeclaration, isFunctionDeclaration, isInterfaceDeclaration,
  isMethodDeclaration, isNamedNode, isNode, isPropertyDeclaration, isTypeDeclaration, isVariableDeclaration
} from '#ast/utilities/node-typeguards';
import { NodeMap, NodeSet } from '#ast/components';
import { cloneNode } from '#ast/utilities/clone-node';
import { nodeMetadata } from '#ast/node-metadata';
import { Declaration } from '#ast/node-aliases';


/* ****************************************************************************************************************** */
// region: Reusable Descriptor Factories
/* ****************************************************************************************************************** */

const getObjectLikeNodeDescriptors = (): PropertyDescriptorMap => ({
  properties: {
    get(this: ObjectNodeBase) {
      return new NodeMap(this.members.toArray().filter(isPropertyDeclaration));
    }
  },
  methods: {
    get(this: ObjectNodeBase) {
      return new NodeMap(this.members.toArray().filter(isMethodDeclaration));
    }
  }
});

// endregion


/* ****************************************************************************************************************** */
// region: Helpers
/* ****************************************************************************************************************** */

/**
 * @returns type with non-function Node properties optional, and kind required
 */
type CreateNodeProperties<T> = Partial<Pick<T, {
  [K in keyof T]: T[K] extends Function ? never :
                  K extends 'kind' ? never :
                  K
}[keyof T]>>

/**
 * @returns Non-function interface properties (not including base class Node keys)
 */
type NodeProperties<T extends Node, Exclusions extends keyof T = never> = Pick<T, {
  [K in keyof T]: T[K] extends Function ? never :
                  K extends Exclusions ? never :
                  K extends Exclude<keyof Node, 'origin' | 'compileOptions'> ? never :
                  K
}[keyof T]>

/**
 * @internal
 */
export function createNode<K extends NodeKind>(
  kind: K,
  properties: CreateNodeProperties<NodeForKind<K>>,
  additionalDescriptors?: PropertyDescriptorMap
): NodeForKind<K>
export function createNode<T extends Node>(
  kind: NodeKind,
  properties: CreateNodeProperties<T>,
  additionalDescriptors?: PropertyDescriptorMap
): T
export function createNode(
  kind: NodeKind,
  properties: CreateNodeProperties<Node>,
  additionalDescriptors?: PropertyDescriptorMap
): Node {
  const node = new NodeObject(kind, properties.origin, properties.compileOptions);
  const { baseTypeFlags, baseFlags, childContainerProperties } = nodeMetadata[kind];

  /* Determine base flags */
  const flags = (properties.flags || NodeFlags.None) | (baseFlags?.reduce((p, c) => p + c) || 0)
  const typeFlags = (properties.typeFlags || TypeFlags.None) | (baseTypeFlags?.reduce((p, c) => p + c) || 0)

  // Assign property descriptors
  if (additionalDescriptors) Object.defineProperties(node, additionalDescriptors);

  /* If child container properties have nodes which already have assigned parents, substitute for clones */
  for (const key of childContainerProperties?.keys() || []) {
    if (properties.hasOwnProperty(key)) {
      const item = (<any>properties)[key];
      if (isNode(item) && item.parent)
        (<any>properties)[key] = cloneNode(item);
      else if (NodeMap.isNodeMap(item) && item.find(n => !!n.parent))
        (<any>properties)[key] = NodeMap.from(item.values(), node => {
          return (node.parent) ? node : cloneNode(node)
        });
      else if (NodeSet.isNodeSet(item) && item.find(n => !!n.parent))
        (<any>properties)[key] = NodeSet.from(item, node => {
          return (node.parent) ? node : cloneNode(node)
        });
    }
  }

  // Assign properties
  Object.assign(node, omit(properties, 'origin', 'compileOptions'), { flags, typeFlags });

  return node;
}

// endregion


/* ****************************************************************************************************************** */
// region: Definition Nodes
/* ****************************************************************************************************************** */

export function createDefinitionNode(properties: NodeProperties<DefinitionNode, 'definitionFlags'>): DefinitionNode {
  const desc: PropertyDescriptorMap = {
    definitionFlags: {
      get(this: DefinitionNode): DefinitionFlags {
        let res = DefinitionFlags.None |
          (+(this.declarations.size > 1) && DefinitionFlags.HasMultipleDeclarations) |
          (+(!!this.typeArguments && this.typeArguments.size > 0) && DefinitionFlags.Parameterized);

        for (const declaration of this.declarations.values())
          res |= isFunctionDeclaration(declaration) ? DefinitionFlags.Function :
                 isTypeDeclaration(declaration) ? DefinitionFlags.Type :
                 isClassDeclaration(declaration) ? DefinitionFlags.Class :
                 isInterfaceDeclaration(declaration) ? DefinitionFlags.Interface :
                 isEnumDeclaration(declaration) ? DefinitionFlags.Enum :
                 isVariableDeclaration(declaration) ? DefinitionFlags.Variable :
                 0;

        return res;
      }
    }
  }

  return createNode(NodeKind.Definition, properties, desc);
}

// endregion


/* ****************************************************************************************************************** */
// region: Module Nodes
/* ****************************************************************************************************************** */

export function createNamespaceNode(properties: NodeProperties<NamespaceNode>): NamespaceNode {
  return createNode(NodeKind.Namespace, properties);
}

export function createSourceFileNode(properties: NodeProperties<SourceFileNode>): SourceFileNode {
  return createNode(NodeKind.SourceFile, properties);
}

// endregion


/* ****************************************************************************************************************** */
// region: Non-Numeric Primitive Nodes
/* ****************************************************************************************************************** */

export function createStringNode(properties: NodeProperties<StringNode>): StringNode {
  return createNode(NodeKind.String, properties);
}

export function createCharacterNode(properties: NodeProperties<CharacterNode>): CharacterNode {
  return createNode(NodeKind.Character, properties);
}

export function createByteNode(properties: NodeProperties<ByteNode>): ByteNode {
  return createNode(NodeKind.Byte, properties);
}

export function createRegExpNode(properties: NodeProperties<RegExpNode>): RegExpNode {
  return createNode(NodeKind.RegExp, properties);
}

export function createSymbolNode(properties: NodeProperties<SymbolNode>): SymbolNode {
  return createNode(NodeKind.Symbol, properties);
}

export function createBooleanNode(properties: NodeProperties<BooleanNode>): BooleanNode {
  return createNode(NodeKind.Boolean, properties);
}

export function createIntegerNode(properties?: NodeProperties<IntegerNode>): IntegerNode {
  return createNode(NodeKind.Integer, properties || {});
}

export function createDecimalNumberNode(properties: NodeProperties<DecimalNumberNode>): DecimalNumberNode {
  return createNode(NodeKind.DecimalNumber, properties);
}

export function createComplexNumberNode(properties: NodeProperties<ComplexNumberNode>): ComplexNumberNode {
  return createNode(NodeKind.ComplexNumber, properties);
}

export function createNotANumberNode(properties: NodeProperties<NotANumberNode>): NotANumberNode {
  return createNode(NodeKind.NotANumber, properties);
}

export function createInfinityNode(properties: NodeProperties<InfinityNode>): InfinityNode {
  return createNode(NodeKind.Infinity, properties);
}

// endregion


/* ****************************************************************************************************************** */
// region: Non-Numeric Literal Nodes
/* ****************************************************************************************************************** */

export function createStringLiteralNode(properties: NodeProperties<StringLiteral>): StringLiteral {
  return createNode(NodeKind.StringLiteral, properties);
}

export function createTrueLiteral(properties: NodeProperties<TrueLiteral>): TrueLiteral {
  return createNode(NodeKind.TrueLiteral, properties);
}

export function createFalseLiteral(properties: NodeProperties<FalseLiteral>): FalseLiteral {
  return createNode(NodeKind.FalseLiteral, properties);
}

export function createRegExpLiteral(properties: NodeProperties<RegExpLiteral>): RegExpLiteral {
  return createNode(NodeKind.RegExpLiteral, properties);
}

export function createDateTimeLiteral(properties: NodeProperties<DateTimeLiteral>): DateTimeLiteral {
  return createNode(NodeKind.DateTimeLiteral, properties);
}

export function createSymbolLiteral(properties: NodeProperties<SymbolLiteral>): SymbolLiteral {
  return createNode(NodeKind.SymbolLiteral, properties);
}

export function createIntegerLiteral(properties: NodeProperties<IntegerLiteral>): IntegerLiteral {
  return createNode(NodeKind.IntegerLiteral, properties);
}

export function createDecimalLiteral(properties: NodeProperties<DecimalLiteral>): DecimalLiteral {
  return createNode(NodeKind.DecimalLiteral, properties);
}

export function createImaginaryNumberLiteral(properties: NodeProperties<ImaginaryNumberLiteral>): ImaginaryNumberLiteral {
  return createNode(NodeKind.ImaginaryNumberLiteral, properties);
}

// endregion


/* ****************************************************************************************************************** */
// region: Iterable Nodes
/* ****************************************************************************************************************** */

export function createGenericIterable(properties: NodeProperties<GenericIterable>): GenericIterable {
  return createNode(NodeKind.GenericIterable, properties);
}

export function createArrayNode(properties: NodeProperties<ArrayNode, 'orderKind' | 'indexType'>): ArrayNode {
  const props = Object.assign({}, properties, {
    orderKind: <const>OrderKind.Index,
    indexType: createIntegerNode()
  });
  return createNode(NodeKind.Array, props);
}

export function createMapNode(properties: NodeProperties<MapNode, 'resizable' | 'orderKind' | 'uniqueMembers'>): MapNode {
  const props = Object.assign({}, properties, <const>{
    resizable: true,
    uniqueMembers: true,
    orderKind: OrderKind.Index
  });
  return createNode(NodeKind.Map, props);
}

export function createMultiSetNode(properties: NodeProperties<MultiSetNode, 'resizable' | 'uniqueMembers' | 'indexType'>):
  MultiSetNode
{
  const props = Object.assign({}, properties, <const>{
    uniqueMembers: false,
  });
  return createNode(NodeKind.MultiSet, props);
}

export function createSetNode(properties: NodeProperties<SetNode, 'resizable' | 'uniqueMembers' | 'indexType'>): SetNode {
  const props = Object.assign({}, properties, <const>{
    uniqueMembers: true,
  });
  return createNode(NodeKind.Set, props);
}

export function createListNode(properties: NodeProperties<ListNode, 'resizable' | 'orderKind' | 'indexType'>): ListNode {
  const props = Object.assign({}, properties, <const>{
    resizable: true,
    orderKind: <const>OrderKind.Index,
    indexType: createIntegerNode()
  });
  return createNode(NodeKind.List, props);
}

export function createLinkedListNode(properties: NodeProperties<LinkedListNode, 'resizable' | 'orderKind' | 'indexType'>):
  LinkedListNode
{
  const props = Object.assign({}, properties, {
    orderKind: <const>OrderKind.Link
  });
  return createNode(NodeKind.LinkedList, props);
}

// endregion


/* ****************************************************************************************************************** */
// region: Enum-Related Nodes
/* ****************************************************************************************************************** */

export function createEnumDeclaration(properties: NodeProperties<EnumDeclaration, 'keys' | 'values'>): EnumDeclaration {
  const desc: PropertyDescriptorMap = {
    keys: {
      get(this: EnumDeclaration) { return [ ...this.members.keys() ] }
    },
    values: {
      get(this: EnumDeclaration) { return [ ...this.members.values() ] }
    }
  }

  return createNode(NodeKind.EnumDeclaration, properties, desc);
}

export function createEnumMemberDeclaration(properties: NodeProperties<EnumMemberDeclaration>): EnumMemberDeclaration {
  return createNode(NodeKind.EnumMemberDeclaration, properties);
}

export function createTupleNode(properties: NodeProperties<TupleNode>): TupleNode {
  return createNode(NodeKind.Tuple, properties);
}

// endregion


/* ****************************************************************************************************************** */
// region: Object-Like Nodes
/* ****************************************************************************************************************** */

export function createObjectNode(properties: NodeProperties<ObjectNode, 'properties' | 'methods'>): ObjectNode {
  return createNode(NodeKind.Object, properties, getObjectLikeNodeDescriptors());
}

export function createClassDeclaration(properties: NodeProperties<ClassDeclaration, 'properties' | 'methods'>):
  ClassDeclaration
{
  return createNode(NodeKind.ClassDeclaration, properties, getObjectLikeNodeDescriptors());
}

export function createAnonymousClass(properties: NodeProperties<AnonymousClass, 'properties' | 'methods'>):
  AnonymousClass
{
  return createNode(NodeKind.AnonymousClass, properties, getObjectLikeNodeDescriptors());
}

export function createInterfaceDeclaration(properties: NodeProperties<InterfaceDeclaration, 'properties' | 'methods'>):
  InterfaceDeclaration
{
  return createNode(NodeKind.InterfaceDeclaration, properties, getObjectLikeNodeDescriptors());
}

// endregion


/* ****************************************************************************************************************** */
// region: Object-Member Nodes
/* ****************************************************************************************************************** */

export function createPropertyDeclaration(properties: NodeProperties<PropertyDeclaration>): PropertyDeclaration {
  return createNode(NodeKind.PropertyDeclaration, properties);
}

export function createMethodDeclaration(properties: NodeProperties<MethodDeclaration>): MethodDeclaration {
  return createNode(NodeKind.MethodDeclaration, properties);
}

// endregion


/* ****************************************************************************************************************** */
// region: Abstract Data Types
/* ****************************************************************************************************************** */

export function createDateNode(properties?: NodeProperties<DateNode>): DateNode {
  return createNode(NodeKind.Date, properties || {});
}

export function createDateTimeNode(properties?: NodeProperties<DateTimeNode>): DateTimeNode {
  return createNode(NodeKind.DateTime, properties || {});
}

// endregion


/* ****************************************************************************************************************** */
// region: Function-Related Nodes
/* ****************************************************************************************************************** */

export function createFunctionDeclaration(properties: NodeProperties<FunctionDeclaration>): FunctionDeclaration {
  return createNode(NodeKind.FunctionDeclaration, properties);
}

export function createAnonymousFunctionNode(properties: NodeProperties<AnonymousFunctionNode>): AnonymousFunctionNode {
  return createNode(NodeKind.AnonymousFunction, properties);
}

export function createSignatureNode(properties: NodeProperties<SignatureNode>): SignatureNode {
  return createNode(NodeKind.Signature, properties);
}

export function createParameterNode(properties: NodeProperties<ParameterNode>): ParameterNode {
  return createNode(NodeKind.Parameter, properties);
}

// endregion


/* ****************************************************************************************************************** */
// region: TypeParameter Related Nodes
/* ****************************************************************************************************************** */

export function createTypeParameterDeclaration(properties: NodeProperties<TypeParameterDeclaration>): TypeParameterDeclaration {
  return createNode(NodeKind.TypeParameterDeclaration, properties);
}

export function createTypeArgumentNode(properties: NodeProperties<TypeArgumentNode, 'name'>): TypeArgumentNode {
  const desc: PropertyDescriptorMap = {
    name: {
      get(this: TypeArgumentNode): string { return this.association.name }
    }
  }
  return createNode(NodeKind.TypeArgument, properties, desc);
}

// endregion


/* ****************************************************************************************************************** */
// region: Other Declarations
/* ****************************************************************************************************************** */

export function createTypeDeclaration(properties: NodeProperties<TypeDeclaration>): TypeDeclaration {
  return createNode(NodeKind.TypeDeclaration, properties);
}

export function createVariableDeclaration(properties: NodeProperties<VariableDeclaration>): VariableDeclaration {
  return createNode(NodeKind.VariableDeclaration, properties);
}

// endregion


/* ****************************************************************************************************************** */
// region: Set Operation Nodes
/* ****************************************************************************************************************** */

export function createUnionNode(properties: NodeProperties<UnionNode>): UnionNode {
  return createNode(NodeKind.Union, properties);
}

export function createIntersectionNode(properties: NodeProperties<IntersectionNode>): IntersectionNode {
  return createNode(NodeKind.Intersection, properties);
}

// endregion


/* ****************************************************************************************************************** */
// region: Special Type Nodes
/* ****************************************************************************************************************** */

export function createTopNode(properties?: NodeProperties<AnythingNode>) {
  return createAnythingNode(properties);
}

export function createBottomNode(properties?: NodeProperties<NothingNode>) {
  return createNothingNode(properties);
}

export function createAnythingNode(properties?: NodeProperties<AnythingNode>): AnythingNode {
  return createNode(NodeKind.Anything, properties || {});
}

export function createNothingNode(properties?: NodeProperties<NothingNode>): NothingNode {
  return createNode(NodeKind.Nothing, properties || {});
}

export function createNullNode(properties?: NodeProperties<NullNode>): NullNode {
  return createNode(NodeKind.Null, properties || {});
}

// endregion


/* ****************************************************************************************************************** */
// region: Reference Node
/* ****************************************************************************************************************** */

export function createReferenceNode(properties: NodeProperties<ReferenceNode, 'targetBase' | 'path'>): ReferenceNode
export function createReferenceNode(properties: NodeProperties<ReferenceNode, 'target'>): ReferenceNode
export function createReferenceNode(properties: Partial<NodeProperties<ReferenceNode>>): ReferenceNode {
  let target: Declaration | undefined

  const desc = {
    target: {
      get(this: ReferenceNode): Declaration {
        updatePath(this);
        if (target) return target;

        /* Resolve target from base & path */
        let node: Node | undefined = this.targetBase;
        for (let i = 0; node && (i < this.path.length); i++) {
          const key = this.path[i];
          node = node.getChildren(/* deep */ false, n => isDeclaration(n) && (n.name === key))?.toArray()?.[0];
        }

        if (node) this.target = <Declaration>node;
        return target!;
      },
      set(this: ReferenceNode, newTarget: Declaration) {
        const oldTarget = target;
        target = newTarget;

        updatePath(this);

        /* Update target references sets */
        if (oldTarget !== target) {
          (oldTarget?.getReferencesToThisNode() as NodeSet<ReferenceNode>).delete(this);
          (target.getReferencesToThisNode() as NodeSet<ReferenceNode>).add(this);
        }
      },
    },
  };

  return createNode(NodeKind.Reference, properties, desc);

  function updatePath(ref: ReferenceNode) {
    if (!target || !target.parent) return;

    ref.targetBase = target.getDefinition()!;
    ref.path = [ target.name ];
    target.getLineage()?.forEach(parent => isNamedNode(parent) && ref.path.unshift(parent.name));
  }
}


// endregion
