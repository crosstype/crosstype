/**
 * Node Interfaces & Related types
 *
 * Note: This file is used by generators to determine node meta-data and aliases groups.
 * The JSDoc annotations `@flags` and `@typeFlags` define those properties for node kind metadata.
 */
import {
  DecimalKind, DefinitionFlags, LinkedListFlags, ModifierFlags, NodeFlags, NodeKind, OrderKind, SignatureKind, TypeFlags
} from './enums';
import { CompileOptions, DefinitionCollection, NumberRange } from '../types';
import { NodeMap, NodeSet, ReadonlyNodeMap, ReadonlyNodeSet } from '#ast/components';
import { Language } from '#language/language';
import { CompileOptionsSet } from '#options/types';
import { NodeIndex, NodeOrigin, OutputFile } from '#ast/shared-types';


/* ****************************************************************************************************************** */
// region: Types
/* ****************************************************************************************************************** */
// @formatter:off

interface VariableBitLength {
  bitLength?: number | number[] | NumberRange     // Length, array of possible lengths, or range
}

/**
 * Helper type used solely to indicate to generator what base flags a Node should have
 */
type Flags<
  T extends TypeFlags | NodeFlags,
  K extends T extends TypeFlags ? keyof typeof TypeFlags : keyof typeof NodeFlags
> = {}

// formatter:on
// endregion


/* ****************************************************************************************************************** */
// region: Group Aliases
/* ****************************************************************************************************************** */

// TODO - Make auto generated

/**
 * All valid Nodes
 */
export type AnyNode =
  Node | ReferenceNode | StringNode | CharacterNode | ByteNode | RegExpNode | SymbolNode | BooleanNode | NumericNode |
  StringLiteral | TrueLiteral | FalseLiteral | RegExpLiteral | SymbolLiteral | NumericLiteral | FunctionDeclaration |
  AnonymousFunctionNode | SignatureNode | ParameterNode | IterableNode | EnumDeclaration | TypeParameterDeclaration |
  TypeArgumentNode | TupleNode | UnionNode | IntersectionNode | AnythingNode | NothingNode | NullNode | ModuleNode |
  ObjectNode | ClassDeclaration | InterfaceDeclaration | PropertyDeclaration | MethodDeclaration | DefinitionNode |
  DateTimeLiteral | DateLikeNode

/**
 * Nodes which cannot be used in the general value position (must have a specific parent)
 */
export type NonValueNode =
  ModuleNode | ParameterNode | SignatureNode | TypeParameterDeclaration | TypeArgumentNode | ClassDeclaration |
  InterfaceDeclaration | PropertyDeclaration | MethodDeclaration

/**
 * Nodes that can be used in the general value position (can have any parent)
 */
export type ValueNode =
  Node | ReferenceNode | StringNode | CharacterNode | ByteNode | RegExpNode | SymbolNode | BooleanNode | NumericNode |
  StringLiteral | TrueLiteral | FalseLiteral | RegExpLiteral | SymbolLiteral | NumericLiteral | FunctionDeclaration |
  AnonymousFunctionNode | IterableNode | EnumDeclaration | TupleNode | UnionNode | IntersectionNode | AnythingNode |
  NothingNode | NullNode | ObjectNode | PropertyDeclaration | MethodDeclaration | DefinitionNode | DateTimeLiteral |
  DateLikeNode

/**
 * @see https://en.wikipedia.org/wiki/Declaration_(computer_programming)
 */
export type Declaration =
  FunctionDeclaration | ClassDeclaration | InterfaceDeclaration | PropertyDeclaration | MethodDeclaration |
  EnumDeclaration | EnumMemberDeclaration | TypeDeclaration | TypeParameterDeclaration | VariableDeclaration

export type RootDeclaration =
  FunctionDeclaration | ClassDeclaration | InterfaceDeclaration | TypeDeclaration | EnumDeclaration | VariableDeclaration

// endregion


/* ****************************************************************************************************************** */
// region: Node Base
/* ****************************************************************************************************************** */

export interface Node {
  readonly id: number
  readonly parent: Node
  readonly flags: NodeFlags
  readonly typeFlags: TypeFlags
  readonly kind: NodeKind
  readonly modifiers: ModifierFlags
  readonly origin?: NodeOrigin
  readonly compileOptions?: CompileOptionsSet

  /**
   * @returns Array of parental lineage (ordered from immediate parent to highest)
   */
  getLineage(): undefined | Node[]

  /**
   * Delete Node (also remove all child nodes)
   * @param brokenReferenceReplacer - If specified, broken reference nodes will be passed to the callback with the
   *   return value replacing the old node.
   */
  delete(brokenReferenceReplacer?: (node: Node) => Node): void

  /**
   * Iterate all children, providing parent property key in which the child was found
   */
  forEachChild<T extends Node>(this: T, cb: <K extends keyof T>(child: Node, parentPropertyKey: K, nodeMapKey?: NodeMap.GetKeyType<T[K]>) => void): void

  /**
   * Walks up the parent line and returns the first match
   * @param matcher
   */
  findParent<T extends Node = Node>(matcher: (node: Node) => boolean): T | undefined

  /**
   * Find nearest named parent node
   * @param name - If provided, will look for parent that matches name (string or regex)
   */
  getNamedParent(name?: string | RegExp): Node | undefined

  /**
   * Get parent DefinitionNode
   */
  getDefinition(): DefinitionNode | undefined

  /**
   * Get parent SourceFileNode (only exists during compilation, as definitions can have multiple output files)
   */
  getSourceFile(): SourceFileNode | undefined

  /**
   * @returns NodeSet of children
   * @param deep - If true, deeply returns all descendants
   * @param predicate - If provided, filters returned nodes. If used with deep and a node does not match, its children are
   *                  still checked.
   */
  getChildren<T extends Node = Node>(deep?: boolean, predicate?: (node: Node) => boolean): NodeSet<T> | undefined

  /**
   * Creates a clone of the node
   * @param parent - Set parent Node
   */
  clone<T extends Node>(this: T, parent: Node | undefined): T

  /**
   * Replace node with a new node
   * Note: All descendants will be deleted. If you'd like to maintain some, clone them and use them when creating the
   *       new replacement node.
   * @param newNode - New node to replace current with
   * @param brokenReferenceReplacer - If specified, broken reference nodes will be passed to the callback with the
   *        return value replacing the old node.
   * @param reuseMemory - When specified, the same place in memory is used, causing any memory references to the node
   *                      to be retained. This should only be used with good reason.
   *                      You do not need to use this flag to retain ReferenceNodes. They will be updated automatically.
   * @returns newNode (for chaining)
   */
  replace<T extends Node>(newNode: T, brokenReferenceReplacer?: (node: Node) => Node, reuseMemory?: boolean): T

  /**
   * Get compiled source text for node
   * @param language - Language name
   * @param options - Optionally, override node's compileOptions for compilation
   */
  compile<T extends Language.Names>(language: T, options?: Language.GetLanguage<T>['optionsTypes']['CompileOptions']): string


  /* ********************************************************* *
   * Undocumented
   * ********************************************************* */

  /**
   * Cleans node
   * - Converts optional empty node iterable containers to undefined
   * - Removes invalid members from containers
   * - If optional child property is not a valid node, sets to undefined
   * @ignore
   */
  cleanup(): void

  /**
   * Update properties of Node, regardless of mutability or visibility
   * @ignore
   * @returns This object (for chaining)
   */
  updateProperties<T extends Node>(this: T, props: { [P in keyof T]?: T[P] }): T
}

export interface NamedNode<T extends NodeIndex = NodeIndex> extends Node, Flags<NodeFlags, 'Named'> {
  name: T
}

export interface DeclarationBase<T extends NodeIndex = string> extends NamedNode<T> {
  /**
   * Get all ReferenceNodes in collection which refer to this node
   */
  getReferencesToThisNode(): ReadonlyNodeSet<ReferenceNode> | undefined
}

// endregion


/* ****************************************************************************************************************** */
// region: Definition Node
/* ****************************************************************************************************************** */

export interface DefinitionNode extends NamedNode<string>, Flags<NodeFlags, 'Definition'> {
  readonly kind: NodeKind.Definition
  readonly definitionFlags: DefinitionFlags     // getter, then remove this note
  readonly collection?: DefinitionCollection
  outputs?: OutputFile[]
  name: string
  declarations: NodeMap<RootDeclaration>
  exported?: boolean
  typeArguments?: NodeMap<TypeArgumentNode>
  primary: boolean
}

// endregion


/* ****************************************************************************************************************** */
// region: Module Nodes
/* ****************************************************************************************************************** */

export type ModuleNode = NamespaceNode | SourceFileNode

interface ModuleBase extends Node {
  name: string
  exported?: boolean
  definitions?: NodeMap<DefinitionNode>
  namespaces?: NodeMap<NamespaceNode>
}

export interface NamespaceNode extends ModuleBase, Flags<TypeFlags, 'Module'> {
  readonly kind: NodeKind.Namespace
  exported?: boolean
}

export interface SourceFileNode extends ModuleBase, Flags<TypeFlags, 'Module'> {
  readonly kind: NodeKind.SourceFile
  readonly language: Language.FullNames
  fileName: string
}

// endregion


/* ****************************************************************************************************************** */
// region: Non-Numeric Primitive Nodes
/* ****************************************************************************************************************** */

/**
 * @see https://en.wikipedia.org/wiki/String_(computer_science)
 */
export interface StringNode extends Node, Flags<TypeFlags, 'Primitive'> {
  readonly kind: NodeKind.String
}

/**
 * When length specified, assumes fixed length array of characters, otherwise, assumes single character
 * @see https://en.wikipedia.org/wiki/Character_(computing)
 */
export interface CharacterNode extends Node, VariableBitLength, Flags<TypeFlags, 'Primitive'> {
  readonly kind: NodeKind.Character
  length: number | NumberRange
}

/**
 * When length specified, assumes fixed length array of characters, otherwise, assumes single character
 * @see https://en.wikipedia.org/wiki/Byte
 */
export interface ByteNode extends Node, VariableBitLength, Flags<TypeFlags, 'Primitive'> {
  readonly kind: NodeKind.Byte
  length: number | NumberRange
  signed: boolean
}

/**
 * @see https://en.wikipedia.org/wiki/Regular_expression
 */
export interface RegExpNode extends Node, Flags<TypeFlags, 'Primitive'> {
  readonly kind: NodeKind.RegExp
}

/**
 * @see https://en.wikipedia.org/wiki/Symbol_(programming)
 */
export interface SymbolNode extends Node, Flags<TypeFlags, 'Primitive'> {
  readonly kind: NodeKind.Symbol
}

/**
 * @see https://en.wikipedia.org/wiki/Boolean_data_type
 */
export interface BooleanNode extends Node, Flags<TypeFlags, 'Primitive'> {
  readonly kind: NodeKind.Boolean
}


// endregion


/* ****************************************************************************************************************** */
// region: Numeric Primitive Nodes
/* ****************************************************************************************************************** */

export type RealNumberNode = IntegerNode | DecimalNumberNode
export type NumericNode = IntegerNode | DecimalNumberNode | NotANumberNode | InfinityNode | ComplexNumberNode

/**
 * Real whole number
 * @see https://en.wikipedia.org/wiki/Integer_(computer_science)
 */
export interface IntegerNode extends Node, VariableBitLength, Flags<TypeFlags, 'Primitive' | 'Numeric'> {
  readonly kind: NodeKind.Integer
}

/**
 * Real number with decimal
 * @see https://en.wikipedia.org/wiki/Decimal_data_type
 * @see https://en.wikipedia.org/wiki/Decimal_floating_point
 * @see https://en.wikipedia.org/wiki/Fixed-point_arithmetic
 */
export interface DecimalNumberNode extends Node, VariableBitLength, Flags<TypeFlags, 'Primitive' | 'Numeric'> {
  readonly kind: NodeKind.DecimalNumber
  decimalKind: DecimalKind
  /**
   * Optionally specify decimal precision
   * Q: Is this valid?
   */
  decimalPrecision?: number
}

/**
 * @see https://en.wikipedia.org/wiki/Complex_number
 */
export interface ComplexNumberNode extends Node, VariableBitLength, Flags<TypeFlags, 'Primitive' | 'Numeric'> {
  readonly kind: NodeKind.ComplexNumber
}

/**
 * @see https://en.wikipedia.org/wiki/NaN
 */
export interface NotANumberNode extends Node, Flags<TypeFlags, 'Primitive' | 'Numeric'> {
  readonly kind: NodeKind.NotANumber
}

/**
 * @see https://en.wikipedia.org/wiki/Infinity
 */
export interface InfinityNode extends Node, Flags<TypeFlags, 'Primitive' | 'Numeric'> {
  readonly kind: NodeKind.Infinity
  negative: boolean
}

// endregion


/* ****************************************************************************************************************** */
// region: Non-Numeric Literal Nodes
/* ****************************************************************************************************************** */

/**
 * Exact string value
 */
export interface StringLiteral extends Node, Flags<TypeFlags, 'Literal'> {
  readonly kind: NodeKind.StringLiteral
  value: string
}

/**
 * true literal value
 */
export interface TrueLiteral extends Node, Flags<TypeFlags, 'Literal'> {
  readonly kind: NodeKind.TrueLiteral
  value: true
}

/**
 * false literal value
 */
export interface FalseLiteral extends Node, Flags<TypeFlags, 'Literal'> {
  readonly kind: NodeKind.FalseLiteral
  value: false
}

/**
 * Exact Regular Expression
 */
export interface RegExpLiteral extends Node, Flags<TypeFlags, 'Literal'> {
  readonly kind: NodeKind.RegExpLiteral
  expression: string
  regexFlags?: string
}

/**
 * Format conforms to ISO 8601
 * @see https://en.wikipedia.org/wiki/ISO_8601
 */
export interface DateTimeLiteral extends Node, Flags<TypeFlags, 'Literal'> {
  kind: NodeKind.DateTimeLiteral
  format: string,
  value: string
}

/**
 * Exact symbol (may or may not be always unique - see notes for alwaysUnique property)
 */
export interface SymbolLiteral extends Node, Flags<TypeFlags, 'Literal'> {
  readonly kind: NodeKind.SymbolLiteral
  value?: string | number
  // Is symbol unique regardless of its value?
  // In languages like Ruby, there a single symbol per name. In that case, alwaysUnique is false.
  // JavaScript Symbols, in contrast, are always unique unless a Global Symbol (see: https://javascript.info/symbol)
  alwaysUnique: boolean
}

// endregion


/* ****************************************************************************************************************** */
// region: Numeric Literal Nodes
/* ****************************************************************************************************************** */

export type RealNumberLiteral = IntegerLiteral | DecimalLiteral
export type NumericLiteral = IntegerLiteral | DecimalLiteral | ImaginaryNumberLiteral

/**
 * Exact integer value
 */
export interface IntegerLiteral extends Node, Flags<TypeFlags, 'Literal'> {
  readonly kind: NodeKind.IntegerLiteral
  value: string
}

/**
 * Exact decimal value
 */
export interface DecimalLiteral extends Node, Flags<TypeFlags, 'Literal'> {
  readonly kind: NodeKind.DecimalLiteral
  value: string
}

/**
 * Exact imaginary number value
 * @see https://docs.python.org/2.0/ref/imaginary.html
 */
export interface ImaginaryNumberLiteral extends Node, Flags<TypeFlags, 'Literal'> {
  readonly kind: NodeKind.ImaginaryNumberLiteral
  value: string
}

// endregion


/* ****************************************************************************************************************** */
// region: Iterable Nodes
/* ****************************************************************************************************************** */

export type IterableNode = GenericIterable | ArrayNode | MapNode | MultiSetNode | SetNode | ListNode | LinkedListNode

interface IterableNodeBase extends Node {
  orderKind: OrderKind
  uniqueMembers?: boolean
  indexType?: ValueNode
  valueType: ValueNode
  resizable?: boolean
}

/**
 * Used if no existing iterable node fits
 */
export interface GenericIterable extends IterableNodeBase, Flags<TypeFlags, 'Iterable' | 'Composite'> {
  readonly kind: NodeKind.GenericIterable
}

/**
 * @see https://en.wikipedia.org/wiki/Array_data_type
 */
export interface ArrayNode extends IterableNodeBase, Flags<TypeFlags, 'Iterable' | 'Composite'> {
  readonly kind: NodeKind.Array
  readonly orderKind: OrderKind.Index
  readonly indexType: IntegerNode
  resizable: boolean
}

/**
 * @see https://en.wikipedia.org/wiki/Associative_array
 */
export interface MapNode extends IterableNodeBase, Flags<TypeFlags, 'Iterable' | 'Composite'> {
  readonly kind: NodeKind.Map
  readonly resizable: true
  readonly orderKind: OrderKind.Index
  readonly uniqueMembers: true
  indexType: ValueNode
}

/**
 * @see https://en.wikipedia.org/wiki/Set_(abstract_data_type)
 */
export interface MultiSetNode extends IterableNodeBase, Flags<TypeFlags, 'Iterable' | 'Composite'> {
  readonly kind: NodeKind.MultiSet
  readonly uniqueMembers: false
}

/**
 * @see https://en.wikipedia.org/wiki/Set_(abstract_data_type)
 */
export interface SetNode extends IterableNodeBase, Flags<TypeFlags, 'Iterable' | 'Composite'> {
  readonly kind: NodeKind.Set
  readonly uniqueMembers: true
}

/**
 * Essentially an Array that is always resizable
 * @see https://www.quora.com/What-is-the-difference-between-an-ARRAY-and-a-LIST
 */
export interface ListNode extends IterableNodeBase, Flags<TypeFlags, 'Iterable' | 'Composite'> {
  readonly kind: NodeKind.List
  readonly resizable: true
  readonly orderKind: OrderKind.Index
  readonly indexType: IntegerNode
}

/**
 * @see https://en.wikipedia.org/wiki/Linked_list
 */
export interface LinkedListNode extends IterableNodeBase, Flags<TypeFlags, 'Iterable' | 'Composite'> {
  readonly kind: NodeKind.LinkedList
  readonly orderKind: OrderKind.Link
  linkedListFlags: LinkedListFlags
}

// endregion


/* ****************************************************************************************************************** */
// region: Enum-Related Nodes
/* ****************************************************************************************************************** */

/**
 * Enumerated Type
 * @see https://en.wikipedia.org/wiki/Enumerated_type
 * Note: ADA allows specifying bit length for enum
 */
export interface EnumDeclaration extends DeclarationBase, VariableBitLength, Flags<TypeFlags, 'Enum'> {
  readonly kind: NodeKind.EnumDeclaration
  name: string
  members: NodeMap<EnumMemberDeclaration>

  readonly keys: NodeIndex[] | undefined                   // Getter only (reads from members)
  readonly values: (StringLiteral | RealNumberLiteral)[]   // Getter only (reads from members)
}

/**
 * Member of Enumerated Type (Always has value, may or may not have key depending on the language)
 * @see https://en.wikipedia.org/wiki/Enumerated_type
 */
export interface EnumMemberDeclaration extends DeclarationBase, Flags<NodeFlags, 'Declaration' | 'Nested'> {
  readonly kind: NodeKind.EnumMemberDeclaration
  name: string
  value?: StringLiteral | RealNumberLiteral
}


// endregion


/* ****************************************************************************************************************** */
// region: Tuple Node
/* ****************************************************************************************************************** */

/**
 * A specific record of types in sequence
 * @see https://en.wikipedia.org/wiki/Record_(computer_science)
 */
export interface TupleNode extends Node, Flags<TypeFlags, 'Tuple'> {
  readonly kind: NodeKind.Tuple
  elements?: NodeSet<ValueNode>
  hasRestElement?: boolean
}

// endregion


/* ****************************************************************************************************************** */
// region: Object-Like Nodes
/* ****************************************************************************************************************** */

export type ObjectNodeKey = string | number | SymbolLiteral
export type ObjectLikeNode = ObjectNode | ClassDeclaration | InterfaceDeclaration
export type ClassLikeNode = ClassDeclaration | InterfaceDeclaration

export interface ObjectNodeBase extends Node {
  members: NodeMap<ObjectLikeMember>
  indexType?: StringNode | RealNumberNode | SymbolNode | NodeSet<StringLiteral | RealNumberLiteral | SymbolLiteral>
  valueType?: ValueNode

  readonly properties?: ReadonlyNodeMap<PropertyDeclaration>    // getter proxy (filtered members)
  readonly methods?: ReadonlyNodeMap<MethodDeclaration>         // getter proxy (filtered members)
}

export interface ClassLikeNodeBase extends ObjectNodeBase {
  readonly heritage?: ReadonlyNodeSet<ReferenceNode>            // References to Class or Interface
  constructSignatures?: NodeSet<SignatureNode | ReferenceNode>  // Reference to heritage signature if none present
  typeParameters?: NodeMap<TypeParameterDeclaration>
}

/**
 * Object-literal type
 * @see https://en.wikipedia.org/wiki/Object_type_(object-oriented_programming)
 */
export interface ObjectNode extends ObjectNodeBase, Flags<TypeFlags, 'Object'> {
  readonly kind: NodeKind.Object
}

/**
 * @see https://en.wikipedia.org/wiki/Class_(computer_programming)
 */
export interface ClassDeclaration extends ClassLikeNodeBase, DeclarationBase,
  Flags<NodeFlags, 'Declaration'>,
  Flags<TypeFlags, 'Class' | 'Composite'>
{
  readonly parent: DefinitionNode
  readonly kind: NodeKind.ClassDeclaration
  name: string
}

/**
 * Anonymous class (expression level, may or may not have name)
 * @see https://en.wikipedia.org/wiki/Class_(computer_programming)
 */
export interface AnonymousClass extends ClassLikeNodeBase, Flags<TypeFlags, 'Class' | 'Composite'> {
  readonly parent: DefinitionNode
  readonly kind: NodeKind.AnonymousClass
  name?: string
}

/**
 * Any Interface is essentially the same as a class without the implementation. As a result, it can also contain call
 * signatures, where classes cannot.
 * @see https://www.iitk.ac.in/esc101/05Aug/tutorial/java/concepts/interface.html
 * @see https://www.typescriptlang.org/docs/handbook/interfaces.html
 */
export interface InterfaceDeclaration extends ClassLikeNodeBase, DeclarationBase,
  Flags<NodeFlags, 'Declaration'>,
  Flags<TypeFlags, 'Interface' | 'Composite'>
{
  readonly parent: DefinitionNode
  readonly kind: NodeKind.InterfaceDeclaration
  callSignatures?: NodeSet<SignatureNode>
  name: string
}

// endregion


/* ****************************************************************************************************************** */
// region: Object-Member Nodes
/* ****************************************************************************************************************** */

export type ObjectLikeMember = PropertyDeclaration | MethodDeclaration

export interface ObjectMemberBase extends DeclarationBase<ObjectNodeKey> {
  optional: boolean
}

/**
 * Property on an ObjectLikeNode
 * @see https://en.wikipedia.org/wiki/Property_(programming)
 */
export interface PropertyDeclaration extends ObjectMemberBase,
  Flags<NodeFlags, 'Nested' | 'Declaration'>,
  Flags<TypeFlags, 'Property'>
{
  readonly kind: NodeKind.PropertyDeclaration
  value: ValueNode
  /**
   * Indicates property is implemented as accessors (able to determine getter/setter by ReadOnly/WriteOnly modifiers)
   */
  isAccessor?: boolean
}

/**
 * Method on an ObjectLikeNode
 * @see https://en.wikipedia.org/wiki/Method_(computer_programming)
 */
export interface MethodDeclaration extends ObjectMemberBase,
  Flags<NodeFlags, 'Nested' | 'Declaration'>,
  Flags<TypeFlags, 'Method'>
{
  readonly kind: NodeKind.MethodDeclaration
  signatures: NodeSet<SignatureNode>
}

// endregion


/* ****************************************************************************************************************** */
// region: Abstract Data Types
/* ****************************************************************************************************************** */

export type DateLikeNode = DateNode | DateTimeNode

export interface DateBase extends Node {
  format?: string
}

/**
 * Date (optionally specify ISO 8601 format)
 * @see https://en.wikipedia.org/wiki/ISO_8601
 */
export interface DateNode extends DateBase, Flags<TypeFlags, 'Abstract'> {
  kind: NodeKind.Date
}

/**
 * DateTime (optionally specify ISO 8601 format)
 * @see https://en.wikipedia.org/wiki/ISO_8601
 */
export interface DateTimeNode extends DateBase, Flags<TypeFlags, 'Abstract'> {
  kind: NodeKind.DateTime
}


// endregion


/* ****************************************************************************************************************** */
// region: Function-Related Nodes
/* ****************************************************************************************************************** */

/**
 * Named function, allows multiple (overload) signatures
 * @see https://en.wikipedia.org/wiki/Subroutine
 */
export interface FunctionDeclaration extends DeclarationBase, Flags<TypeFlags, 'Function'> {
  readonly kind: NodeKind.FunctionDeclaration
  signatures: NodeSet<SignatureNode>
}

/**
 * Anonymous Function (expression level, may or may not be named)
 * @see https://en.wikipedia.org/wiki/Anonymous_function
 */
export interface AnonymousFunctionNode extends Node, Flags<TypeFlags, 'Function'> {
  readonly kind: NodeKind.AnonymousFunction
  name?: string                         // Name is allowed for anonymous functions in some languages (like JS)
  signature: SignatureNode
}

/**
 * @see https://en.wikipedia.org/wiki/Type_signature
 */
export interface SignatureNode extends Node, Flags<NodeFlags, 'Nested'> {
  readonly kind: NodeKind.Signature
  signatureKind: SignatureKind
  isAsync?: boolean
  isGenerator?: boolean
  returnType: ValueNode
  parameters?: NodeMap<ParameterNode>
  typeParameters?: NodeMap<TypeParameterDeclaration>
}

/**
 * @see https://en.wikipedia.org/wiki/Parameter_(computer_programming)
 */
export interface ParameterNode extends NamedNode<string>, Flags<NodeFlags, 'Nested'> {
  readonly kind: NodeKind.Parameter
  name: string
  type?: ValueNode
  initializer?: ValueNode      // Must be unit type (literals, empty, etc)
  markedOptional: boolean
  /**
   * @see https://javascript.info/rest-parameters-spread
   */
  isRestParameter?: boolean
}

// endregion


/* ****************************************************************************************************************** */
// region: TypeParameter-Related Nodes
/* ****************************************************************************************************************** */

/**
 * @see https://en.wikipedia.org/wiki/TypeParameter
 */
export interface TypeParameterDeclaration extends DeclarationBase, Flags<NodeFlags, 'Declaration' | 'Nested'> {
  readonly kind: NodeKind.TypeParameterDeclaration
  name: string
  constraint?: ValueNode
  default?: ValueNode
}

/**
 * Argument which corresponds to a TypeParameter
 * @see https://en.wikipedia.org/wiki/TypeParameter
 */
export interface TypeArgumentNode extends NamedNode<string>, Flags<NodeFlags, 'Nested'> {
  readonly kind: NodeKind.TypeArgument
  readonly association: ParameterNode
  readonly name: string                   // Getter to association.name
  type: ValueNode
}

// endregion


/* ****************************************************************************************************************** */
// region: Other Declarations
/* ****************************************************************************************************************** */

/**
 * @see https://en.wikipedia.org/wiki/Data_type
 */
export interface TypeDeclaration extends DeclarationBase, Flags<NodeFlags, 'Declaration'> {
  kind: NodeKind.TypeDeclaration
  value: ValueNode
}

export interface VariableDeclaration extends DeclarationBase, Flags<NodeFlags, 'Declaration'> {
  kind: NodeKind.VariableDeclaration
  value: ValueNode
}


// endregion


/* ****************************************************************************************************************** */
// region: Set Operation Nodes
/* ****************************************************************************************************************** */

/**
 * @see https://en.wikipedia.org/wiki/Union_type
 * @see https://en.wikipedia.org/wiki/Tagged_union
 */
export interface UnionNode extends Node, Flags<TypeFlags, 'Composite'> {
  readonly kind: NodeKind.Union
  members: NodeSet<ValueNode>
  discriminants?: ObjectLikeMember['name']
}

/**
 * @see https://en.wikipedia.org/wiki/Intersection_type
 */
export interface IntersectionNode extends Node, Flags<TypeFlags, 'Composite'> {
  readonly kind: NodeKind.Intersection
  /**
   * Some languages may have custom methodology for joining types. When set, this value represents the final resolved
   * type for the members. If not present, common logic should be applied on members
   */
  resolvedType?: ValueNode
}

// endregion


/* ****************************************************************************************************************** */
// region: Special Type Nodes
/* ****************************************************************************************************************** */

export type TopNode = AnythingNode
export type BottomNode = NothingNode

/**
 * Top Type
 * @see https://en.wikipedia.org/wiki/Top_type
 */
export interface AnythingNode extends Node {
  readonly kind: NodeKind.Anything
}

/**
 * Bottom Type
 * @see https://en.wikipedia.org/wiki/Bottom_type
 */
export interface NothingNode extends Node {
  readonly kind: NodeKind.Nothing
}

/**
 * @see https://en.wikipedia.org/wiki/Null_pointer
 * Specific type can be determined in specificKind (useful in cases like JS which has null and undefined)
 */
export interface NullNode extends Node, Flags<TypeFlags, 'Unit'> {
  readonly kind: NodeKind.Null
}

// endregion


/* ****************************************************************************************************************** */
// region: Reference Node
/* ****************************************************************************************************************** */

/**
 * Reference to Declaration (definition, object property, etc)
 * @see https://en.wikipedia.org/wiki/Reference_(computer_science)
 */
export interface ReferenceNode extends Node, Flags<TypeFlags, 'Reference'> {
  readonly kind: NodeKind.Reference
  /* @notChild */
  target: Declaration

  /**
   * Base node to search for target
   * @internal
   * @notChild
   */
  targetBase: DefinitionNode | TypeArgumentNode
  /**
   * Chain of property keys
   * @internal
   */
  path: NodeIndex[]
}

// endregion
