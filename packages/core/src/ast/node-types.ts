import {
  DecimalKind, DefinitionFlags, LinkedListFlags, ModifierFlags, NodeFlags, NodeKind, OrderKind, SignatureKind, TypeFlags
} from './enums';
import { CompileOptions, DefinitionCollection, NodeArray, NumberRange, SourceFileInfo } from '../types';
import { TagMap } from './components';
import { Language } from '../language/language';
import { CrossTypeLanguage } from '../language/crosstype-language';


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

/**
 * Base shape for Origin (each language has its own)
 */
export interface NodeOrigin {
  language: string
  sourceFileInfo?: SourceFileInfo
  sourceText?: string
  tags?: TagMap
  /**
   * Used by extensions to identify specific intrinsic types (ie. `undefined` and `null` in javascript would both
   * produce a NullNode. This property can be used to determine its origin kind)
   */
  specificKind?: number

  [k:string]: any // Additional properties allowed
}

export type NamedNodeName = string | number | SymbolLiteral

// endregion


/* ****************************************************************************************************************** */
// region: Group Aliases
/* ****************************************************************************************************************** */

/**
 * All valid Nodes
 */
type AnyNode =
  Node | ReferenceNode | StringNode | CharacterNode | Byte | RegExpNode | SymbolNode | BooleanNode | NumericNode |
  StringLiteral | TrueLiteral | FalseLiteral | RegExpLiteral | SymbolLiteral | NumericLiteral | FunctionNode |
  LambdaFunctionNode | SignatureNode | ParameterNode | IterableNode | EnumNode | TypeParameterNode | TypeArgumentNode |
  TupleNode | UnionNode | IntersectionNode | AnythingNode | NothingNode | NullNode | ModuleNode | ObjectNode |
  ClassNode | InterfaceNode | PropertyNode | MethodNode | DefinitionNode

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
  Node | ReferenceNode | StringNode | CharacterNode | Byte | RegExpNode | SymbolNode | BooleanNode | NumericNode |
  StringLiteral | TrueLiteral | FalseLiteral | RegExpLiteral | SymbolLiteral | NumericLiteral | FunctionNode |
  LambdaFunctionNode | IterableNode | EnumNode | TupleNode | UnionNode | IntersectionNode | AnythingNode |
  NothingNode | NullNode | ObjectNode | PropertyNode | MethodNode | DefinitionNode

// endregion


/* ****************************************************************************************************************** */
// region: Node Base
/* ****************************************************************************************************************** */

export interface Node {
  id: number
  parent: Node | undefined
  flags: NodeFlags
  typeFlags: TypeFlags
  kind: NodeKind
  origin: NodeOrigin
  modifiers: ModifierFlags
  compileOptions: CompileOptions

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
  forEachChild<T extends Node>(this: T, fn: (child: Node, parentPropertyKey: keyof T, index?: number) => void): void

  /**
   * Find nearest named parent node
   * @param name - If provided, will look for parent that matches name (string or regex)
   */
  findNamedParent(name?: string | RegExp): Node | undefined

  /**
   * Get parent DefinitionNode
   */
  getDefinition(): DefinitionNode | undefined

  /**
   * Get parent SourceFile (output file node)
   */
  getSourceFile(): SourceFile | undefined

  /**
   * @returns Array of children
   * @param deep - If true, deeply returns all descendants
   * @param matcher - If provided, filters returned nodes
   */
  getChildren<T extends Node = Node>(deep?: boolean, matcher?: (node: Node) => boolean): NodeArray<T> | undefined

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
   * @param inPlace - When specified, the same place in memory is used, causing any memory references to the node to be
   *                  retained. This should only be used if there's a good reason.
   *                  You do not need to use this flag to retain ReferenceNodes. They will be updated automatically.
   * @returns newNode (for chaining)
   */
  replace<T extends Node>(this: T, newNode: Node, reuseMemory?: boolean): T

  /**
   * Get compiled source text for node
   */
  compile(language: Language.Names): string
  compile(language: Language.Code): string


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

export interface NamedNode<T extends NamedNodeName = string> extends Node {
  name: T
}

export interface ReferenceableNamedNode<T extends NamedNodeName = string> extends NamedNode<T> {
  /**
   * Get all ReferenceNodes in collection which refer to this node
   */
  getReferencesToThisNode(): NodeArray<ReferenceNode> | undefined
}


// endregion


/* ****************************************************************************************************************** */
// region: Definition Node
/* ****************************************************************************************************************** */

export interface DefinitionNode extends ReferenceableNamedNode {
  kind: NodeKind.Definition
  definitionFlags: DefinitionFlags
  outputs: OutputFile[]
  name: string
  declarationTypes: NodeArray<ValueNode>
  exported?: boolean
  typeArguments?: NodeArray<TypeArgumentNode>
  collection?: DefinitionCollection
}

// endregion


/* ****************************************************************************************************************** */
// region: Module Nodes
/* ****************************************************************************************************************** */

export type ModuleNode = Namespace | SourceFile

interface ModuleBase extends Node {
  name: string
  exported?: boolean
  definitions: NodeArray<DefinitionNode>
  namespaces: NodeArray<Namespace>
}

export interface Namespace extends ModuleBase {
  kind: NodeKind.Namespace
  exported?: boolean
}

export interface SourceFile extends ModuleBase {
  kind: NodeKind.SourceFile
  fileName: string
  readonly language: CrossTypeLanguage
}

// endregion


/* ****************************************************************************************************************** */
// region: Non-Numeric Primitive Nodes
/* ****************************************************************************************************************** */

/**
 * @see https://en.wikipedia.org/wiki/String_(computer_science)
 */
export interface StringNode extends Node {
  kind: NodeKind.String
}

/**
 * @see https://en.wikipedia.org/wiki/Character_(computing)
 */
export interface CharacterNode extends Node, VariableBitLength {
  kind: NodeKind.Character
}

/**
 * @see https://en.wikipedia.org/wiki/Byte
 */
export interface Byte extends Node, VariableBitLength {
  kind: NodeKind.Byte
}

/**
 * @see https://en.wikipedia.org/wiki/Regular_expression
 */
export interface RegExpNode extends Node {
  kind: NodeKind.RegExp
}

/**
 * @see https://en.wikipedia.org/wiki/Symbol_(programming)
 */
export interface SymbolNode extends Node {
  kind: NodeKind.Symbol
}

/**
 * @see https://en.wikipedia.org/wiki/Boolean_data_type
 */
export interface BooleanNode extends Node {
  kind: NodeKind.Boolean
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
export interface IntegerNode extends NumberNodeBase {
  kind: NodeKind.Integer
}

/**
 * Real number with decimal
 * @see https://en.wikipedia.org/wiki/Decimal_data_type
 * @see https://en.wikipedia.org/wiki/Decimal_floating_point
 * @see https://en.wikipedia.org/wiki/Fixed-point_arithmetic
 */
export interface DecimalNumberNode extends NumberNodeBase {
  kind: NodeKind.DecimalNumber
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
export interface ComplexNumberNode extends NumberNodeBase {
  kind: NodeKind.ComplexNumber
}

/**
 * @see https://en.wikipedia.org/wiki/NaN
 */
export interface NotANumberNode extends Node {
  kind: NodeKind.NotANumber
}

/**
 * @see https://en.wikipedia.org/wiki/Infinity
 */
export interface InfinityNode extends Node {
  kind: NodeKind.Infinity
  negative: boolean
}

// endregion


/* ****************************************************************************************************************** */
// region: Non-Numeric Literal Nodes
/* ****************************************************************************************************************** */

/**
 * Unit type containing an exact string value
 */
export interface StringLiteral extends Node {
  kind: NodeKind.StringLiteral
  value: string
}

/**
 * Unit type containing: true
 */
export interface TrueLiteral extends Node {
  kind: NodeKind.TrueLiteral
  value: true
}

/**
 * Unit type containing: false
 */
export interface FalseLiteral extends Node {
  kind: NodeKind.FalseLiteral
  value: false
}

/**
 * Unit type containing an exact Regular Expression
 */
export interface RegExpLiteral extends Node {
  kind: NodeKind.RegExpLiteral
  expression: string
  regexFlags?: string
}

/**
 * Unit type containing an exact symbol (may or may not be always unique - see notes for alwaysUnique property)
 */
export interface SymbolLiteral extends Node {
  kind: NodeKind.SymbolLiteral
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
export interface IntegerLiteral extends Node {
  kind: NodeKind.IntegerLiteral
  value: string
}

/**
 * Unit type containing exact decimal value
 */
export interface DecimalLiteral extends Node {
  kind: NodeKind.DecimalLiteral
  value: string
}

/**
 * Unit type containing exact imaginary number value
 * @see https://docs.python.org/2.0/ref/imaginary.html
 */
export interface ImaginaryNumberLiteral extends Node {
  kind: NodeKind.ImaginaryNumberLiteral
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
export interface GenericIterable extends IterableNodeBase {
  kind: NodeKind.GenericIterable
}

/**
 * @see https://en.wikipedia.org/wiki/Array_data_type
 */
export interface ArrayNode extends IterableNodeBase {
  kind: NodeKind.Array
  resizable: boolean
  orderBy: OrderKind.Index
  indexType: IntegerNode
}

/**
 * @see https://en.wikipedia.org/wiki/Associative_array
 */
export interface MapNode extends IterableNodeBase {
  kind: NodeKind.Map
  resizable: true
  orderBy: OrderKind.Index
  indexType: ValueNode
}

/**
 * @see https://en.wikipedia.org/wiki/Set_(abstract_data_type)
 */
export interface MultiSetNode extends IterableNodeBase {
  kind: NodeKind.MultiSet
  uniqueMembers: false
}

/**
 * @see https://en.wikipedia.org/wiki/Set_(abstract_data_type)
 */
export interface SetNode extends IterableNodeBase {
  kind: NodeKind.Set
  uniqueMembers: true
}

/**
 * Essentially an Array that is always resizable
 * @see https://www.quora.com/What-is-the-difference-between-an-ARRAY-and-a-LIST
 */
export interface ListNode extends IterableNodeBase {
  kind: NodeKind.List
  resizable: true
  orderKind: OrderKind.Index
  indexType: IntegerNode
}

/**
 * @see https://en.wikipedia.org/wiki/Linked_list
 */
export interface LinkedListNode extends IterableNodeBase {
  kind: NodeKind.LinkedList
  orderBy: OrderKind.Link
  linkedListFlags: LinkedListFlags
}

// endregion


/* ****************************************************************************************************************** */
// region: Enum-Related Nodes
/* ****************************************************************************************************************** */

/**
 * Enumerated Type (tagged union)
 * @see https://en.wikipedia.org/wiki/Enumerated_type
 * Note: ADA allows specifying bit length for enum
 */
export interface EnumNode extends Node, VariableBitLength {
  kind: NodeKind.Enum
  members: NodeArray<EnumMemberNode>

  keys: string[] | undefined                      // Getter only (reads from members)
  values: (StringLiteral | RealNumberLiteral)[]   // Getter only (reads from members)
}

/**
 * Member of Enumerated Type (Always has value, may or may not have key depending on the language)
 * @see https://en.wikipedia.org/wiki/Enumerated_type
 */
export interface EnumMemberNode extends Node {
  kind: NodeKind.EnumMember
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
export interface TupleNode extends Node {
  kind: NodeKind.Tuple
  elements: NodeArray<ValueNode>
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
  members: NodeArray<ValueNode>
  additionalProperties?: {
    indexType: StringNode | RealNumberNode | SymbolNode | NodeArray<StringLiteral | RealNumberLiteral | SymbolLiteral>
    valueType: ValueNode
  }

  properties: NodeArray<ValueNode>      // getter proxy (filtered members)
  methods: NodeArray<ValueNode>         // getter proxy (filtered members)

  /**
   * Get property or method by name
   * @param name - Name of property or method
   */
  getMember(name: ObjectNodeKey): ValueNode | undefined
}

export interface ClassLikeNodeBase extends ReferenceableNamedNode {
  heritage?: NodeArray<ReferenceNode>                             // References to Class or Interface
  constructSignatures?: NodeArray<SignatureNode | ReferenceNode>  // Reference to heritage signature if none present
  typeParameters?: NodeArray<TypeParameterNode>
}

/**
 * Non-class based Object-literal type
 * @see https://en.wikipedia.org/wiki/Object_type_(object-oriented_programming)
 */
export interface ObjectNode extends ObjectNodeBase {
  kind: NodeKind.Object
}

/**
 * @see https://en.wikipedia.org/wiki/Class_(computer_programming)
 */
export interface ClassNode extends ClassLikeNodeBase {
  parent: DefinitionNode | undefined
  kind: NodeKind.Class
}

/**
 * Any Interface is essentially the same as a class without the implementation. As a result, it can also contain call
 * signatures, where classes cannot.
 * @see https://www.iitk.ac.in/esc101/05Aug/tutorial/java/concepts/interface.html
 * @see https://www.typescriptlang.org/docs/handbook/interfaces.html
 */
export interface InterfaceNode extends ClassLikeNodeBase {
  parent: DefinitionNode | undefined
  kind: NodeKind.Interface
  callSignatures?: NodeArray<SignatureNode>
}

// endregion


/* ****************************************************************************************************************** */
// region: Object-Member Nodes
/* ****************************************************************************************************************** */

export interface ObjectMemberBase extends ReferenceableNamedNode<ObjectNodeKey> {
  optional: boolean
}

/**
 * Property of an ObjectLikeNode
 * @see https://en.wikipedia.org/wiki/Property_(programming)
 */
export interface PropertyNode extends ObjectMemberBase {
  kind: NodeKind.Property
  value: ValueNode
  /**
   * Indicates property is implemented as accessors (able to determine getter/setter by ReadOnly/WriteOnly modifiers)
   */
  isAccessor?: boolean
}

/**
 * Method of an ObjectLikeNode
 * @see https://en.wikipedia.org/wiki/Method_(computer_programming)
 */
export interface MethodNode extends ObjectMemberBase {
  kind: NodeKind.Method
  signatures: NodeArray<SignatureNode>
}

// endregion


/* ****************************************************************************************************************** */
// region: Function-Related Nodes
/* ****************************************************************************************************************** */

/**
 * Named function, allows multiple (overload) signatures
 * @see https://en.wikipedia.org/wiki/Subroutine
 */
export interface FunctionNode extends NamedNode {
  kind: NodeKind.Function
  signatures: NodeArray<SignatureNode>
}

/**
 * Anonymous (un-named) Function
 * @see https://en.wikipedia.org/wiki/Lambda_function_(computer_programming)
 */
export interface LambdaFunctionNode extends Node {
  kind: NodeKind.LambdaFunction
  signature: SignatureNode
}

/**
 * @see https://en.wikipedia.org/wiki/Type_signature
 */
export interface SignatureNode extends Node {
  kind: NodeKind.Signature
  signatureKind: SignatureKind
  returnType: ValueNode
  parameters?: NodeArray<ParameterNode>
  typeParameters?: NodeArray<TypeParameterNode>
}

/**
 * @see https://en.wikipedia.org/wiki/Parameter_(computer_programming)
 */
export interface ParameterNode extends NamedNode {
  kind: NodeKind.Parameter
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
 */
export interface TypeParameterNode extends ReferenceableNamedNode {
  kind: NodeKind.TypeParameter
  name: string
  constraint?: ValueNode
  default?: ValueNode
}

/**
 * Argument which corresponds to a TypeParameter
 * @see https://en.wikipedia.org/wiki/TypeParameter
 */
export interface TypeArgumentNode extends NamedNode {
  kind: NodeKind.TypeArgument
  name: string            // Getter to _association.name
  type: ValueNode
  readonly _association: ParameterNode
}

// endregion


/* ****************************************************************************************************************** */
// region: Set Operation Nodes
/* ****************************************************************************************************************** */

interface SetOperationBase extends Node {
  members: NodeArray<ValueNode>
  /**
   * Some languages may have custom methodology for joining types. When set, this value represents the final resolved
   * type for the members. If not present, common logic should be applied on members
   */
  resolvedType?: ValueNode
}

/**
 * @see https://en.wikipedia.org/wiki/Union_type
 */
export interface UnionNode extends SetOperationBase {
  kind: NodeKind.Union
}

/**
 * @see https://en.wikipedia.org/wiki/Intersection_type
 */
export interface IntersectionNode extends SetOperationBase {
  kind: NodeKind.Intersection
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
  kind: NodeKind.Anything
}

/**
 * Bottom Type
 * @see https://en.wikipedia.org/wiki/Bottom_type
 */
export interface NothingNode extends Node {
  kind: NodeKind.Nothing
}

/**
 * @see https://en.wikipedia.org/wiki/Null_pointer
 * Specific type can be determined in specificKind (useful in cases like JS which has null and undefined)
 */
export interface NullNode extends Node {
  kind: NodeKind.Null
}

// endregion


/* ****************************************************************************************************************** */
// region: Reference Node
/* ****************************************************************************************************************** */

/**
 * Reference to ReferenceableNamedNode (definition, object property, etc)
 * @see https://en.wikipedia.org/wiki/Reference_(computer_science)
 */
export interface ReferenceNode extends Node {
  kind: NodeKind.Reference
  targetBase: DefinitionNode
  path: NamedNodeName[]
  target: ValueNode
}

// endregion
