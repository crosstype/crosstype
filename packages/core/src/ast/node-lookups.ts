import { NodeKind } from '#ast/enums';
import {
  AnonymousFunctionNode, AnythingNode, ArrayNode, BooleanNode, ByteNode, CharacterNode, ClassNode, ComplexNumberNode,
  DateNode, DateTimeLiteralNode, DateTimeNode, DecimalLiteral, DecimalNumberNode, DefinitionNode, EnumMemberNode,
  EnumNode, FalseLiteral, FunctionNode, GenericIterable, ImaginaryNumberLiteral, InfinityNode, IntegerLiteral,
  IntegerNode, InterfaceNode, IntersectionNode, LinkedListNode, ListNode, MapNode, MethodNode, MultiSetNode,
  NamespaceNode, NotANumberNode, NothingNode, NullNode, ObjectNode, ParameterNode, PropertyNode, ReferenceNode,
  RegExpLiteral, RegExpNode, SetNode, SignatureNode, SourceFileNode, StringLiteral, StringNode, SymbolLiteral,
  SymbolNode, TrueLiteral, TupleNode, TypeArgumentNode, TypeParameterNode, UnionNode
} from '#ast/node-types';

// TODO - Make this auto-generated using `node-types.ts` (Anything with kind specified gets an entry)


/* ****************************************************************************************************************** */
// region: Node Lookups
/* ****************************************************************************************************************** */

/**
 * Get Node for Kind
 */
export type NodeForKind<K extends NodeKind> =
  K extends NodeKind.Reference ? ReferenceNode :
  K extends NodeKind.String ? StringNode :
  K extends NodeKind.Character ? CharacterNode :
  K extends NodeKind.Byte ? ByteNode :
  K extends NodeKind.RegExp ? RegExpNode :
  K extends NodeKind.Symbol ? SymbolNode :
  K extends NodeKind.Boolean ? BooleanNode :
  K extends NodeKind.Integer ? IntegerNode :
  K extends NodeKind.DecimalNumber ? DecimalNumberNode :
  K extends NodeKind.ComplexNumber ? ComplexNumberNode :
  K extends NodeKind.NotANumber ? NotANumberNode :
  K extends NodeKind.Infinity ? InfinityNode :
  K extends NodeKind.StringLiteral ? StringLiteral :
  K extends NodeKind.TrueLiteral ? TrueLiteral :
  K extends NodeKind.FalseLiteral ? FalseLiteral :
  K extends NodeKind.RegExpLiteral ? RegExpLiteral :
  K extends NodeKind.SymbolLiteral ? SymbolLiteral :
  K extends NodeKind.IntegerLiteral ? IntegerLiteral :
  K extends NodeKind.DecimalLiteral ? DecimalLiteral :
  K extends NodeKind.ImaginaryNumberLiteral ? ImaginaryNumberLiteral :
  K extends NodeKind.Function ? FunctionNode :
  K extends NodeKind.AnonymousFunction ? AnonymousFunctionNode :
  K extends NodeKind.Signature ? SignatureNode :
  K extends NodeKind.Parameter ? ParameterNode :
  K extends NodeKind.GenericIterable ? GenericIterable :
  K extends NodeKind.Array ? ArrayNode :
  K extends NodeKind.Set ? SetNode :
  K extends NodeKind.MultiSet ? MultiSetNode :
  K extends NodeKind.Map ? MapNode :
  K extends NodeKind.List ? ListNode :
  K extends NodeKind.LinkedList ? LinkedListNode :
  K extends NodeKind.Enum ? EnumNode :
  K extends NodeKind.EnumMember ? EnumMemberNode :
  K extends NodeKind.TypeParameter ? TypeParameterNode :
  K extends NodeKind.TypeArgument ? TypeArgumentNode :
  K extends NodeKind.Tuple ? TupleNode :
  K extends NodeKind.Union ? UnionNode :
  K extends NodeKind.Intersection ? IntersectionNode :
  K extends NodeKind.Anything ? AnythingNode :
  K extends NodeKind.Nothing ? NothingNode :
  K extends NodeKind.Null ? NullNode :
  K extends NodeKind.Namespace ? NamespaceNode :
  K extends NodeKind.Date ? DateNode :
  K extends NodeKind.DateTime ? DateTimeNode :
  K extends NodeKind.DateTimeLiteral ? DateTimeLiteralNode :
  K extends NodeKind.SourceFile ? SourceFileNode :
  K extends NodeKind.Object ? ObjectNode :
  K extends NodeKind.Class ? ClassNode :
  K extends NodeKind.Interface ? InterfaceNode :
  K extends NodeKind.Property ? PropertyNode :
  K extends NodeKind.Method ? MethodNode :
  K extends NodeKind.Definition ? DefinitionNode : never;

// endregion
