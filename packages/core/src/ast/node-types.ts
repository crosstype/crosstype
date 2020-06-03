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
import { Language } from '../language/language';
import { CompileOptionsSet } from '../options/types';
import { NamedNodeName, NodeOrigin } from '#ast/shared-types';


/* ****************************************************************************************************************** */
// region: Types
/* ****************************************************************************************************************** */

interface VariableBitLength {
  bitLength?: number | number[] | NumberRange     // Length, array of possible lengths, or range
}

interface OutputFile {
  fileName: string,
  language: string,
  compileOptions?: CompileOptions                 // Configure to override using Definition's compileOptions as a base
}

// endregion


/* ****************************************************************************************************************** */
// region: Group Aliases
/* ****************************************************************************************************************** */

// TODO - Make auto generated

/**
 * All valid Nodes
 */
type AnyNode =
  Node | ReferenceNode | StringNode | CharacterNode | ByteNode | RegExpNode | SymbolNode | BooleanNode | NumericNode |
  StringLiteral | TrueLiteral | FalseLiteral | RegExpLiteral | SymbolLiteral | NumericLiteral | FunctionNode |
  AnonymousFunctionNode | SignatureNode | ParameterNode | IterableNode | EnumNode | TypeParameterNode |
  TypeArgumentNode | TupleNode | UnionNode | IntersectionNode | AnythingNode | NothingNode | NullNode | ModuleNode |
  ObjectNode | ClassNode | InterfaceNode | PropertyNode | MethodNode | DefinitionNode | DateTimeLiteralNode |
  DateLikeNode

/**
 * Nodes which cannot be used in the general value position (must have a specific parent)
 */
type NonValueNode =
  ModuleNode | ParameterNode | SignatureNode | TypeParameterNode | TypeArgumentNode | ClassNode | InterfaceNode |
  PropertyNode | MethodNode

/**
 * Nodes that can be used in the general value position (can have any parent)
 */
type ValueNode =
  Node | ReferenceNode | StringNode | CharacterNode | ByteNode | RegExpNode | SymbolNode | BooleanNode | NumericNode |
  StringLiteral | TrueLiteral | FalseLiteral | RegExpLiteral | SymbolLiteral | NumericLiteral | FunctionNode |
  AnonymousFunctionNode | IterableNode | EnumNode | TupleNode | UnionNode | IntersectionNode | AnythingNode |
  NothingNode | NullNode | ObjectNode | PropertyNode | MethodNode | DefinitionNode | DateTimeLiteralNode | DateLikeNode

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
  readonly origin: NodeOrigin
  readonly modifiers: ModifierFlags
  readonly compileOptions: CompileOptionsSet

  /**
   * @returns Array of parental lineage (ordered from immediate parent to highest)
   */
  getLineage(): undefined | Node[]

  /**
   * Delete Node (also remove all child nodes)
   * @param brokenReferenceReplacer - If specified, broken reference nodes will be passed to the callback with the
   *   return value replacing the old node. When not specified, default behaviour is to replace with `AnythingNode`
   */
  delete(brokenReferenceReplacer?: (node: Node) => Node): void

  /**
   * Iterate all children, providing parent property key in which the child was found
   */
  forEachChild<T extends Node>(cb: (child: Node, parentPropertyKey: keyof T, index?: number) => void): void

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
   * @param matcher - If provided, filters returned nodes. If used with deep and a node does not match, its children are
   *                  still checked.
   */
  getChildren<T extends Node = Node>(deep?: boolean, matcher?: (node: Node) => boolean): NodeSet<T> | undefined

  /**
   * Creates a clone of the node
   * @param parent - Set parent Node
   */
  clone<T extends Node>(this: T, parent: Node | undefined): T

  /**
   * Replace node with a new node
   * Note: All descendants will be deleted. If you'd like to maintain them, create your new node and clone the
   * descendants with the new node as a parent before replacing.
   * @param newNode - New node to replace current with
   * @param reuseMemory - When specified, the same place in memory is used, causing any memory references to the node
   *                      to be retained. This should only be used with good reason.
   *                      You do not need to use this flag to retain ReferenceNodes. They will be updated automatically.
   * @returns newNode (for chaining)
   */
  replace<T extends Node>(this: T, newNode: Node, reuseMemory?: boolean): T

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
   * Update properties of Node, regardless of mutability or visibility
   * @ignore
   * @returns This object (for chaining)
   */
  updateProperties<T extends Node>(this: T, props: { [P in keyof T]?: T[P] }): T

  /**
   * Cleans node (invalid properties, arrays, unresolvable references, etc)
   * @ignore
   */
  cleanup(): void
}

/**
 * @flags NodeFlags.Named
 */
export interface NamedNode<T extends NamedNodeName = string> extends Node {
  name: T
}

/**
 * @flags NodeFlags.CanReference
 */
export interface ReferenceableNamedNode<T extends NamedNodeName = string> extends NamedNode<T> {
  /**
   * Get all ReferenceNodes in collection which refer to this node
   */
  getReferencesToThisNode(): NodeSet<ReferenceNode> | undefined
}

// endregion


/* ****************************************************************************************************************** */
// region: TypeFlags Bases
/* ****************************************************************************************************************** */

// TODO - Migrate this section to generated code

/**
 * @typeFlags TypeFlags.Unit
 */
export interface UnitType {}

/**
 * @typeFlags TypeFlags.Primitive
 */
export interface PrimitiveType {}

/**
 */
export interface LiteralType {}

/**
 * @typeFlags TypeFlags.Composite
 */
export interface CompositeType {}

/**
 */
export interface LiteralType {}

/**
 * @typeFlags TypeFlags.Numeric
 */
export interface NumericType {}

/**
 * @typeFlags TypeFlags.Module
 */
export interface ModuleType {}

/**
 * @typeFlags TypeFlags.Iterable
 */
export interface IterableType {}

/**
 * @typeFlags TypeFlags.Function
 */

export interface FunctionType {}

/**
 * @typeFlags TypeFlags.Tuple
 */
export interface TupleType {}

/**
 * @typeFlags TypeFlags.Object
 */
export interface ObjectType {}

/**
 * @typeFlags TypeFlags.Reference
 */
export interface ReferenceType {}

/**
 * @typeFlags TypeFlags.ObjectMember
 */
export interface ObjectMemberType {}

/**
 * @typeFlags TypeFlags.Enum
 */
export interface EnumType {}

/**
 * @typeFlags TypeFlags.Abstract
 */
export interface AbstractType {}

// endregion


/* ****************************************************************************************************************** */
// region: Definition Node
/* ****************************************************************************************************************** */

/**
 * @flags NodeFlags.Definition
 */
export interface DefinitionNode extends ReferenceableNamedNode {
  readonly kind: NodeKind.Definition
  readonly definitionFlags: DefinitionFlags     // getter, then remove this note
  readonly collection?: DefinitionCollection
  outputs: OutputFile[]
  name: string
  declarationTypes: NodeSet<ValueNode>
  exported?: boolean
  typeArguments?: NodeSet<TypeArgumentNode>

  getParentCollection(): DefinitionCollection
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

export interface NamespaceNode extends ModuleBase, ModuleType {
  readonly kind: NodeKind.Namespace
  exported?: boolean
}

export interface SourceFileNode extends ModuleBase, ModuleType {
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
export interface StringNode extends Node, PrimitiveType {
  readonly kind: NodeKind.String
}

/**
 * When length specified, assumes fixed length array of characters, otherwise, assumes single character
 * @see https://en.wikipedia.org/wiki/Character_(computing)
 */
export interface CharacterNode extends Node, VariableBitLength, PrimitiveType {
  readonly kind: NodeKind.Character
  length: number | NumberRange
}

/**
 * When length specified, assumes fixed length array of characters, otherwise, assumes single character
 * @see https://en.wikipedia.org/wiki/Byte
 */
export interface ByteNode extends Node, VariableBitLength, PrimitiveType {
  readonly kind: NodeKind.Byte
  length: number | NumberRange
  signed: boolean
}

/**
 * @see https://en.wikipedia.org/wiki/Regular_expression
 */
export interface RegExpNode extends Node, PrimitiveType {
  readonly kind: NodeKind.RegExp
}

/**
 * @see https://en.wikipedia.org/wiki/Symbol_(programming)
 */
export interface SymbolNode extends Node, PrimitiveType {
  readonly kind: NodeKind.Symbol
}

/**
 * @see https://en.wikipedia.org/wiki/Boolean_data_type
 */
export interface BooleanNode extends Node, PrimitiveType {
  readonly kind: NodeKind.Boolean
}


// endregion


/* ****************************************************************************************************************** */
// region: Numeric Primitive Nodes
/* ****************************************************************************************************************** */

export type RealNumberNode = IntegerNode | DecimalNumberNode
export type NumericNode = IntegerNode | DecimalNumberNode | NotANumberNode | InfinityNode | ComplexNumberNode

interface NumberNodeBase extends Node, VariableBitLength {}

/**
 * Real whole number
 * @see https://en.wikipedia.org/wiki/Integer_(computer_science)
 */
export interface IntegerNode extends NumberNodeBase, PrimitiveType, NumericType {
  readonly kind: NodeKind.Integer
}

/**
 * Real number with decimal
 * @see https://en.wikipedia.org/wiki/Decimal_data_type
 * @see https://en.wikipedia.org/wiki/Decimal_floating_point
 * @see https://en.wikipedia.org/wiki/Fixed-point_arithmetic
 */
export interface DecimalNumberNode extends NumberNodeBase, PrimitiveType, NumericType {
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
export interface ComplexNumberNode extends NumberNodeBase, PrimitiveType, NumericType {
  readonly kind: NodeKind.ComplexNumber
}

/**
 * @see https://en.wikipedia.org/wiki/NaN
 */
export interface NotANumberNode extends Node, PrimitiveType, NumericType {
  readonly kind: NodeKind.NotANumber
}

/**
 * @see https://en.wikipedia.org/wiki/Infinity
 */
export interface InfinityNode extends Node, PrimitiveType, NumericType {
  readonly kind: NodeKind.Infinity
  negative: boolean
}

// endregion


/* ****************************************************************************************************************** */
// region: Non-Numeric Literal Nodes
/* ****************************************************************************************************************** */

/**
 * Unit type containing an exact string value
 */
export interface StringLiteral extends Node, LiteralType {
  readonly kind: NodeKind.StringLiteral
  value: string
}

/**
 * Unit type containing: true
 */
export interface TrueLiteral extends Node, LiteralType {
  readonly kind: NodeKind.TrueLiteral
  value: true
}

/**
 * Unit type containing: false
 */
export interface FalseLiteral extends Node, LiteralType {
  readonly kind: NodeKind.FalseLiteral
  value: false
}

/**
 * Unit type containing an exact Regular Expression
 */
export interface RegExpLiteral extends Node, LiteralType {
  readonly kind: NodeKind.RegExpLiteral
  expression: string
  regexFlags?: string
}

/**
 * Format conforms to ISO 8601
 * @see https://en.wikipedia.org/wiki/ISO_8601
 */
export interface DateTimeLiteralNode extends Node {
  kind: NodeKind.DateTimeLiteral
  format: string,
  value: string
}

/**
 * Unit type containing an exact symbol (may or may not be always unique - see notes for alwaysUnique property)
 */
export interface SymbolLiteral extends Node, LiteralType {
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
 * Unit type containing exact integer value
 */
export interface IntegerLiteral extends Node, LiteralType {
  readonly kind: NodeKind.IntegerLiteral
  value: string
}

/**
 * Unit type containing exact decimal value
 */
export interface DecimalLiteral extends Node, LiteralType {
  readonly kind: NodeKind.DecimalLiteral
  value: string
}

/**
 * Unit type containing exact imaginary number value
 * @see https://docs.python.org/2.0/ref/imaginary.html
 */
export interface ImaginaryNumberLiteral extends Node, LiteralType {
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
export interface GenericIterable extends IterableNodeBase, IterableType, CompositeType {
  readonly kind: NodeKind.GenericIterable
}

/**
 * @see https://en.wikipedia.org/wiki/Array_data_type
 */
export interface ArrayNode extends IterableNodeBase, IterableType, CompositeType {
  readonly kind: NodeKind.Array
  readonly orderBy: OrderKind.Index
  readonly indexType: IntegerNode
  resizable: boolean
}

/**
 * @see https://en.wikipedia.org/wiki/Associative_array
 */
export interface MapNode extends IterableNodeBase, IterableType, CompositeType {
  readonly kind: NodeKind.Map
  readonly resizable: true
  readonly orderKind: OrderKind.Index
  readonly indexType: ValueNode
}

/**
 * @see https://en.wikipedia.org/wiki/Set_(abstract_data_type)
 */
export interface MultiSetNode extends IterableNodeBase, IterableType, CompositeType {
  readonly kind: NodeKind.MultiSet
  readonly uniqueMembers: false
}

/**
 * @see https://en.wikipedia.org/wiki/Set_(abstract_data_type)
 */
export interface SetNode extends IterableNodeBase, IterableType, CompositeType {
  readonly kind: NodeKind.Set
  readonly uniqueMembers: true
}

/**
 * Essentially an Array that is always resizable
 * @see https://www.quora.com/What-is-the-difference-between-an-ARRAY-and-a-LIST
 */
export interface ListNode extends IterableNodeBase, IterableType, CompositeType {
  readonly kind: NodeKind.List
  readonly resizable: true
  readonly orderKind: OrderKind.Index
  readonly indexType: IntegerNode
}

/**
 * @see https://en.wikipedia.org/wiki/Linked_list
 */
export interface LinkedListNode extends IterableNodeBase, IterableType, CompositeType {
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
export interface EnumNode extends Node, VariableBitLength, EnumType {
  readonly kind: NodeKind.Enum
  members: NodeSet<EnumMemberNode>

  readonly keys: string[] | undefined                      // Getter only (reads from members)
  readonly values: (StringLiteral | RealNumberLiteral)[]   // Getter only (reads from members)
}

/**
 * Member of Enumerated Type (Always has value, may or may not have key depending on the language)
 * @see https://en.wikipedia.org/wiki/Enumerated_type
 * @flags TypeFlags.Nested
 */
export interface EnumMemberNode extends Node {
  readonly kind: NodeKind.EnumMember
  key?: string
  value: StringLiteral | RealNumberLiteral
}


// endregion


/* ****************************************************************************************************************** */
// region: Tuple Node
/* ****************************************************************************************************************** */

/**
 * A specific record of types in sequence
 * @see https://en.wikipedia.org/wiki/Record_(computer_science)
 */
export interface TupleNode extends Node, TupleType {
  readonly kind: NodeKind.Tuple
  elements?: NodeSet<ValueNode>
  hasRestElement?: boolean
}

// endregion


/* ****************************************************************************************************************** */
// region: Object-Like Nodes
/* ****************************************************************************************************************** */

export type ObjectNodeKey = string | number | SymbolLiteral
export type ObjectLikeNode = ObjectNode | ClassNode | InterfaceNode
export type ClassLikeNode = ClassNode | InterfaceNode

export interface ObjectNodeBase extends Node {
  members: NodeMap<ObjectMember>
  indexType?: StringNode | RealNumberNode | SymbolNode | NodeSet<StringLiteral | RealNumberLiteral | SymbolLiteral>
  valueType?: ValueNode

  readonly properties?: ReadonlyNodeMap<PropertyNode>    // getter proxy (filtered members)
  readonly methods?: ReadonlyNodeMap<MethodNode>         // getter proxy (filtered members)

  /**
   * Get property or method by name
   * @param name - Name of property or method
   */
  getMember(name: ObjectNodeKey): ValueNode | undefined
}

export interface ClassLikeNodeBase extends ObjectNodeBase, ReferenceableNamedNode {
  readonly heritage?: ReadonlyNodeSet<ReferenceNode>            // References to Class or Interface
  constructSignatures?: NodeSet<SignatureNode | ReferenceNode>  // Reference to heritage signature if none present
  typeParameters?: NodeMap<TypeParameterNode>
}

/**
 * Non-class based Object-literal type
 * @see https://en.wikipedia.org/wiki/Object_type_(object-oriented_programming)
 */
export interface ObjectNode extends ObjectNodeBase, ObjectType, CompositeType {
  readonly kind: NodeKind.Object
}

/**
 * @see https://en.wikipedia.org/wiki/Class_(computer_programming)
 */
export interface ClassNode extends ClassLikeNodeBase, ObjectType, CompositeType {
  readonly parent: DefinitionNode
  readonly kind: NodeKind.Class
}

/**
 * Any Interface is essentially the same as a class without the implementation. As a result, it can also contain call
 * signatures, where classes cannot.
 * @see https://www.iitk.ac.in/esc101/05Aug/tutorial/java/concepts/interface.html
 * @see https://www.typescriptlang.org/docs/handbook/interfaces.html
 */
export interface InterfaceNode extends ClassLikeNodeBase, ObjectType, CompositeType {
  readonly parent: DefinitionNode
  readonly kind: NodeKind.Interface
  callSignatures?: NodeSet<SignatureNode>
}

// endregion


/* ****************************************************************************************************************** */
// region: Object-Member Nodes
/* ****************************************************************************************************************** */

export type ObjectMember = PropertyNode | MethodNode

export interface ObjectMemberBase extends ReferenceableNamedNode<ObjectNodeKey> {
  optional: boolean
}

/**
 * Property of an ObjectLikeNode
 * @see https://en.wikipedia.org/wiki/Property_(programming)
 * @flags NodeFlags.Nested
 */
export interface PropertyNode extends ObjectMemberBase, ObjectMemberType {
  readonly kind: NodeKind.Property
  value: ValueNode
  /**
   * Indicates property is implemented as accessors (able to determine getter/setter by ReadOnly/WriteOnly modifiers)
   */
  isAccessor?: boolean
}

/**
 * Method of an ObjectLikeNode
 * @see https://en.wikipedia.org/wiki/Method_(computer_programming)
 * @flags NodeFlags.Nested
 */
export interface MethodNode extends ObjectMemberBase, ObjectMemberType {
  readonly kind: NodeKind.Method
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
export interface DateNode extends DateBase, AbstractType {
  kind: NodeKind.Date
}

/**
 * DateTime (optionally specify ISO 8601 format)
 * @see https://en.wikipedia.org/wiki/ISO_8601
 */
export interface DateTimeNode extends DateBase, AbstractType {
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
export interface FunctionNode extends NamedNode, FunctionType {
  readonly kind: NodeKind.Function
  signatures: NodeSet<SignatureNode>
}

/**
 * Anonymous Function
 * @see https://en.wikipedia.org/wiki/Anonymous_function
 */
export interface AnonymousFunctionNode extends Node, FunctionType {
  readonly kind: NodeKind.AnonymousFunction
  name?: string                         // Name is allowed for anonymous functions in some languages (like JS)
  signature: SignatureNode
}

/**
 * @see https://en.wikipedia.org/wiki/Type_signature
 * @flags NodeFlags.Nested
 */
export interface SignatureNode extends Node {
  readonly kind: NodeKind.Signature
  signatureKind: SignatureKind
  isAsync?: boolean
  isGenerator?: boolean
  returnType: ValueNode
  parameters?: NodeMap<ParameterNode>
  typeParameters?: NodeMap<TypeParameterNode>
}

/**
 * @see https://en.wikipedia.org/wiki/Parameter_(computer_programming)
 * @flags NodeFlags.Nested
 */
export interface ParameterNode extends NamedNode {
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
// region: Type Parameter Related Nodes
/* ****************************************************************************************************************** */

/**
 * @see https://en.wikipedia.org/wiki/TypeParameter
 * @flags NodeFlags.Nested
 */
export interface TypeParameterNode extends ReferenceableNamedNode {
  readonly kind: NodeKind.TypeParameter
  name: string
  constraint?: ValueNode
  default?: ValueNode
}

/**
 * Argument which corresponds to a TypeParameter
 * @see https://en.wikipedia.org/wiki/TypeParameter
 * @flags NodeFlags.Nested
 */
export interface TypeArgumentNode extends NamedNode {
  readonly kind: NodeKind.TypeArgument
  readonly _association: ParameterNode
  name: string            // Getter to _association.name (remove this note & _association from interface)
  type: ValueNode
}

// endregion


/* ****************************************************************************************************************** */
// region: Set Operation Nodes
/* ****************************************************************************************************************** */

/**
 * @see https://en.wikipedia.org/wiki/Union_type
 * @see https://en.wikipedia.org/wiki/Tagged_union
 */
export interface UnionNode extends Node, CompositeType {
  readonly kind: NodeKind.Union
  members: NodeSet<ValueNode>
  discriminants?: ObjectMember['name']
}

/**
 * @see https://en.wikipedia.org/wiki/Intersection_type
 */
export interface IntersectionNode extends Node, CompositeType {
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
export interface NullNode extends Node, UnitType {
  readonly kind: NodeKind.Null
}

// endregion


/* ****************************************************************************************************************** */
// region: Reference Node
/* ****************************************************************************************************************** */

/**
 * Reference to ReferenceableNamedNode (definition, object property, etc)
 * Note: To change target, use the replace() method
 * @see https://en.wikipedia.org/wiki/Reference_(computer_science)
 */
export interface ReferenceNode extends Node, ReferenceType {
  readonly kind: NodeKind.Reference
  targetBase: DefinitionNode        // Make these two private
  path: NamedNodeName[]
  /**
   * @notChild
   */
  target: ValueNode                 // getter / setter here which updates the private values
}

// endregion
