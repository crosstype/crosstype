import {
  DefinitionFlags, LinkedListFlags, ModifierFlags, NodeKind, OrderKind, SignatureKind, TypeFlags
} from './enums';
import { CompileOptions, DefinitionCollection, NodeArray, NodeOrigin, NumberRange, SourceFileInfo } from '../types';
import { TagMap } from './components';


/* ****************************************************************************************************************** */
// region: Types
/* ****************************************************************************************************************** */

interface VariableBitLength {
  bitLength?: number | number[] | NumberRange     // set length, array of possible lengths, or range
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
   * Used by extensions to identify specific intrinsic types (ie. `any` and `unknown` would both produce an EmptyNode,
   * so ctl-typescript will have both in its kind enum
   */
  specificKind?: number

  [k:string]: any // Additional properties allowed
}

// endregion


/* ****************************************************************************************************************** */
// region: Group Aliases
/* ****************************************************************************************************************** */

/**
 * All valid Nodes
 */
type AnyNode =
  Node | UnresolvedPointer | Pointer | StringNode | CharacterNode | Byte | RegExpNode | SymbolNode | BooleanNode |
  NumericNode | StringLiteral | TrueLiteral | FalseLiteral | RegExpLiteral | SymbolLiteral | NumericLiteral |
  FunctionNode | LambdaFunctionNode | SignatureNode | ParameterNode | IterableNode | EnumNode | TypeParameterNode |
  TypeArgumentNode | TupleNode | UnionNode | IntersectionNode | AnythingNode | NothingNode | EmptyNode | ModuleNode |
  ObjectNode | ClassNode | InterfaceNode | PropertyNode | MethodNode | DefinitionNode

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
  Node | UnresolvedPointer | Pointer | StringNode | CharacterNode | Byte | RegExpNode | SymbolNode | BooleanNode |
  NumericNode | StringLiteral | TrueLiteral | FalseLiteral | RegExpLiteral | SymbolLiteral | NumericLiteral |
  FunctionNode | LambdaFunctionNode | IterableNode | EnumNode | TupleNode | UnionNode | IntersectionNode |
  AnythingNode | NothingNode | EmptyNode | ObjectNode | PropertyNode | MethodNode | DefinitionNode

// endregion


/* ****************************************************************************************************************** */
// region: Internal Nodes
/* ****************************************************************************************************************** */

export interface Node {
  kind: NodeKind
  origin: NodeOrigin
  typeFlags: TypeFlags
  modifiers: ModifierFlags
  compileOptions: CompileOptions
}

// Note: During parser process, targetBase and path are set initially. Target is resolved as soon as possible,
// converting the node to a Pointer
export interface UnresolvedPointer extends Node {
  kind: NodeKind.UnresolvedPointer
  targetBase: DefinitionNode
  path: string[]
}

export interface Pointer extends Node {
  kind: NodeKind.Pointer
  targetBase: DefinitionNode
  path: string[]
  target: ValueNode
}

// endregion


/* ****************************************************************************************************************** */
// region: Non-Numeric Primitive Nodes
/* ****************************************************************************************************************** */

export interface StringNode extends Node {
  kind: NodeKind.String
}

export interface CharacterNode extends Node, VariableBitLength {
  kind: NodeKind.Character
}

export interface Byte extends Node, VariableBitLength {
  kind: NodeKind.Byte
}

export interface RegExpNode extends Node {
  kind: NodeKind.RegExp
}

export interface SymbolNode extends Node {
  kind: NodeKind.Symbol
}

export interface BooleanNode extends Node {
  kind: NodeKind.Boolean
}


// endregion


/* ****************************************************************************************************************** */
// region: Numeric Primitive Nodes
/* ****************************************************************************************************************** */

export type RealNumberNode = IntegerNode | FloatingPointNumberNode | FixedPointNumberNode
export type NumericNode =
  IntegerNode | FloatingPointNumberNode | FixedPointNumberNode | NotANumberNode | InfinityNode | ComplexNumberNode

interface NumberNodeBase extends Node, VariableBitLength {}

// tf: numeric, primitive
export interface IntegerNode extends NumberNodeBase {
  kind: NodeKind.Integer
}

// tf: numeric, primitive
export interface FloatingPointNumberNode extends NumberNodeBase {
  kind: NodeKind.FloatingPointNumber
}

// tf: numeric, primitive
export interface FixedPointNumberNode extends NumberNodeBase {
  kind: NodeKind.FixedPointNumber
  decimalPrecision?: number
}

// tf: number, primitive
// see: https://en.wikipedia.org/wiki/Complex_number
export interface ComplexNumberNode extends NumberNodeBase {
  kind: NodeKind.ComplexNumber
}

// tf: numeric, primitive
export interface NotANumberNode extends Node {
  kind: NodeKind.NotANumber
}

// tf: numeric, primitive
export interface InfinityNode extends Node {
  kind: NodeKind.Infinity
  negative: boolean
}

// endregion


/* ****************************************************************************************************************** */
// region: Non-Numeric Literal Nodes
/* ****************************************************************************************************************** */

// tf: unit
export interface StringLiteral extends Node {
  kind: NodeKind.StringLiteral
  value: string
}

// tf: unit
export interface TrueLiteral extends Node {
  kind: NodeKind.TrueLiteral
  value: true
}

// tf: unit
export interface FalseLiteral extends Node {
  kind: NodeKind.FalseLiteral
  value: false
}

export interface RegExpLiteral extends Node {
  kind: NodeKind.RegExpLiteral
  expression: string
  flags: string
}

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

export type RealNumberLiteral = IntegerLiteral | FloatingPointLiteral | FixedPointLiteral
export type NumericLiteral = IntegerLiteral | FloatingPointLiteral | FixedPointLiteral | ImaginaryNumberLiteral

// tf: unit, numeric
export interface IntegerLiteral extends Node {
  kind: NodeKind.IntegerLiteral
  value: string
}

// tf: unit, numeric
export interface FloatingPointLiteral extends Node {
  kind: NodeKind.FloatingPointLiteral
  value: string
}

// tf: unit, numeric
export interface FixedPointLiteral extends Node {
  kind: NodeKind.FixedPointLiteral
  value: string
}

/**
 * @see https://docs.python.org/2.0/ref/imaginary.html
 */
// tf: unit, numeric
export interface ImaginaryNumberLiteral extends Node {
  kind: NodeKind.ImaginaryNumberLiteral
  value: string
}

// endregion


/* ****************************************************************************************************************** */
// region: Function-Related Nodes
/* ****************************************************************************************************************** */

// tf: Function
export interface FunctionNode extends Node {
  kind: NodeKind.Function
  name?: string
  signatures: NodeArray<SignatureNode>
}

// tf: Function
export interface LambdaFunctionNode extends Node {
  kind: NodeKind.LambdaFunction
  name?: string
  signature: SignatureNode
}

export interface SignatureNode extends Node {
  kind: NodeKind.Signature
  signatureKind: SignatureKind
  returnType: ValueNode
  parameters?: NodeArray<ParameterNode>
  typeParameters?: NodeArray<TypeParameterNode>
}

export interface ParameterNode extends Node {
  kind: NodeKind.Parameter
  name: string
  type?: ValueNode
  initializer: ValueNode      // Must be unit type (literals, empty, etc)
  markedOptional: boolean
}

// endregion


/* ****************************************************************************************************************** */
// region: Iterable Nodes
/* ****************************************************************************************************************** */

export type IterableNode = GenericIterable | ArrayNode | MapNode | MultiSetNode | SetNode | ListNode | LinkedListNode

/**
 * Arrays, lists, linked lists, Map, Set
 * Anything with indextype -> keytype
 */
interface IterableNodeBase extends Node {
  orderKind: OrderKind
  uniqueMembers?: boolean
  indexType?: ValueNode
  valueType: ValueNode
  resizable?: boolean
}

/**
 * Used if no existing Iterable node configurations fit the type
 */
export interface GenericIterable extends IterableNodeBase {
  kind: NodeKind.GenericIterable
}

// Can be unique
export interface ArrayNode extends IterableNodeBase {
  kind: NodeKind.Array
  resizable: boolean
  orderBy: OrderKind.Index
  indexType: IntegerNode
}

export interface MapNode extends IterableNodeBase {
  kind: NodeKind.Map
  resizable: true
  orderBy: OrderKind.Index
  indexType: ValueNode
}

export interface MultiSetNode extends IterableNodeBase {
  kind: NodeKind.MultiSet
  uniqueMembers: false
}

export interface SetNode extends IterableNodeBase {
  kind: NodeKind.Set
  uniqueMembers: true
}

// This is essentially an Array that is always resizable
// See: https://www.quora.com/What-is-the-difference-between-an-ARRAY-and-a-LIST
export interface ListNode extends IterableNodeBase {
  kind: NodeKind.List
  resizable: true
  orderKind: OrderKind.Index
  indexType: IntegerNode
}

// LinkedList can have an index, but generally does not
// https://stackoverflow.com/questions/21964356/linkedlist-does-not-provide-index-based-access-so-why-does-it-have-getindex-m
export interface LinkedListNode extends IterableNodeBase {
  kind: NodeKind.LinkedList
  orderBy: OrderKind.Link
  linkedListFlags: LinkedListFlags
}

// endregion


/* ****************************************************************************************************************** */
// region: Un-categorized Nodes
/* ****************************************************************************************************************** */

// Type theory defines enum as 'tagged union' - Not sure how to classify by flags, etc.
// Note: ADA allows specifying bit length for enum
export interface EnumNode extends Node, VariableBitLength {
  kind: NodeKind.Enum
  keys?: string
  values: StringLiteral | RealNumberLiteral
}

export interface TypeParameterNode extends Node {
  kind: NodeKind.TypeParameter
  name: string
  constraint?: ValueNode
  default?: ValueNode
}

export interface TypeArgumentNode extends Node {
  kind: NodeKind.TypeArgument
  name: string            // Getter to _association.name
  type: ValueNode
  readonly _association: ParameterNode
}

// Type Theory: product type - https://en.wikipedia.org/wiki/Product_type
export interface TupleNode extends Node {
  kind: NodeKind.Tuple
  elements: NodeArray<ValueNode>
}

export interface UnionNode extends Node {
  kind: NodeKind.Union
  members: NodeArray<ValueNode>
}

export interface IntersectionNode extends Node {
  kind: NodeKind.Intersection
  members: NodeArray<ValueNode>
}

/**
 * @see https://en.wikipedia.org/wiki/Top_type
 */
export interface AnythingNode extends Node {
  kind: NodeKind.Anything
}

/**
 * @see https://en.wikipedia.org/wiki/Bottom_type
 */
export interface NothingNode extends Node {
  kind: NodeKind.Nothing
}

/**
 * Null, undefined, void, etc.
 * Specific type can be determined by intrinsicKind property in origin
 */
export interface EmptyNode extends Node {
  kind: NodeKind.Empty
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
  language: string
}

// endregion


/* ****************************************************************************************************************** */
// region: Object-Like Nodes
/* ****************************************************************************************************************** */

export type ObjectNodeKey = string | number | SymbolLiteral

export interface ObjectNodeBase extends Node {
  members: NodeArray<ValueNode>
  properties: NodeArray<ValueNode>      // getter proxy (filtered members)
  methods: NodeArray<ValueNode>         // getter proxy (filtered members)
  additionalProperties?: {
    indexType: StringNode | RealNumberNode | SymbolNode | NodeArray<StringLiteral | RealNumberLiteral | SymbolLiteral>
    valueType: ValueNode
  }
}

export interface ClassLikeNodeBase extends Node {
  heritage?: NodeArray<Pointer>         // Pointers to Class or Interface
  constructSignatures?: NodeArray<SignatureNode | Pointer>    // If no signature but heritage is used, point to heritage
  typeParameters?: NodeArray<TypeParameterNode>
}

export interface ObjectNode extends ObjectNodeBase {
  kind: NodeKind.Object
}

export interface ClassNode extends ClassLikeNodeBase {
  parent: DefinitionNode | undefined
  kind: NodeKind.Class
}

export interface InterfaceNode extends ClassLikeNodeBase {
  parent: DefinitionNode | undefined
  kind: NodeKind.Interface
  callSignatures?: NodeArray<SignatureNode>
}

// endregion


/* ****************************************************************************************************************** */
// region: Object-Member Nodes
/* ****************************************************************************************************************** */

export interface ObjectMemberBase extends Node {
  name: ObjectNodeKey
  optional: boolean
}

export interface PropertyNode extends ObjectMemberBase {
  kind: NodeKind.Property
  value: ValueNode
}

export interface MethodNode extends ObjectMemberBase {
  kind: NodeKind.Method
  signatures: NodeArray<SignatureNode>
}

// endregion


/* ****************************************************************************************************************** */
// region: Definition Nodes
/* ****************************************************************************************************************** */

export interface DefinitionNode extends Node {
  kind: NodeKind.Definition
  flags: DefinitionFlags
  outputs: OutputFile[]
  name: string
  declarationTypes: NodeArray<ValueNode>
  exported?: boolean
  typeArguments?: NodeArray<TypeArgumentNode>
  parentCollection?: DefinitionCollection
}

// endregion
