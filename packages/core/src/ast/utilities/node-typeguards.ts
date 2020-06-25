import {
  AnonymousClass, AnonymousFunctionNode, AnythingNode, ArrayNode, BooleanNode, BottomNode, ByteNode, CharacterNode,
  ClassDeclaration, ClassLikeNode, ComplexNumberNode, DateLikeNode, DateNode, DateTimeLiteral, DateTimeNode,
  DecimalLiteral, DecimalNode, Definition, EnumDeclaration, EnumMemberDeclaration, FalseLiteral, FunctionDeclaration,
  FunctionNode, GenericIterable, ImaginaryNumberLiteral, InfinityNode, IntegerLiteral, IntegerNode,
  InterfaceDeclaration, IntersectionNode, IterableNode, LinkedListNode, ListNode, MapNode, MethodDeclaration,
  ModuleNode, MultiSetNode, NamedNode, NamespaceNode, Node, NotANumberNode, NothingNode, NullNode, NumericNode,
  ObjectLikeMember, ObjectLikeNode, ObjectNode, ParameterNode, PropertyDeclaration, RealNumberLiteral, RealNumberNode,
  ReferenceNode, RegExpLiteral, RegExpNode, SetNode, SignatureNode, SourceFileNode, StringLiteral, StringNode,
  SymbolLiteral, SymbolNode, TopNode, TrueLiteral, TupleNode, TypeArgumentNode, TypeDeclaration,
  TypeParameterDeclaration, UnionNode, VariableDeclaration
} from '#ast/node-types';
import { NodeFlags, NodeKind, TypeFlags } from '#ast/enums';
import { NodeObject } from '#ast/node-object';
import { Declaration } from '#ast/node-aliases';


/* ****************************************************************************************************************** */
// region: Node TypeGuards
/* ****************************************************************************************************************** */

export const isNode = (v: any): v is Node => v instanceof NodeObject;
export const isNamedNode = (n: Node): n is NamedNode => !!(n.flags & NodeFlags.Named);
export const isDeclaration = (n: Node): n is Declaration => !!(n.flags & NodeFlags.Declaration);

export const isDefinition = (n: Node): n is Definition => !!(n.flags & NodeFlags.Definition);

export const isModuleNode = (n: Node): n is ModuleNode => !!(n.typeFlags & TypeFlags.Module);
export const isNamespaceNode = (n: Node): n is NamespaceNode => (n.kind === NodeKind.Namespace);
export const isSourceFileNode = (n: Node): n is SourceFileNode => (n.kind === NodeKind.SourceFile);

export const isStringNode = (n: Node): n is StringNode => (n.kind === NodeKind.String);
export const isCharacterNode = (n: Node): n is CharacterNode => (n.kind === NodeKind.Character);
export const isByteNode = (n: Node): n is ByteNode => (n.kind === NodeKind.Byte);
export const isRegExpNode = (n: Node): n is RegExpNode => (n.kind === NodeKind.RegExp);
export const isSymbolNode = (n: Node): n is SymbolNode => (n.kind === NodeKind.Symbol);
export const isBooleanNode = (n: Node): n is BooleanNode => (n.kind === NodeKind.Boolean);

export const isRealNumberNode = (n: Node): n is RealNumberNode => [ NodeKind.Integer, NodeKind.Decimal ].includes(n.kind);
export const isNumericNode = (n: Node): n is NumericNode => !!(n.typeFlags & TypeFlags.Numeric);
export const isIntegerNode = (n: Node): n is IntegerNode => (n.kind === NodeKind.Integer);
export const isDecimalNumberNode = (n: Node): n is DecimalNode => (n.kind === NodeKind.Decimal);
export const isComplexNumberNode = (n: Node): n is ComplexNumberNode => (n.kind === NodeKind.ComplexNumber);
export const isNotANumberNode = (n: Node): n is NotANumberNode => (n.kind === NodeKind.NotANumber);
export const isInfinityNode = (n: Node): n is InfinityNode => (n.kind === NodeKind.Infinity);

export const isStringLiteral = (n: Node): n is StringLiteral => (n.kind === NodeKind.StringLiteral);
export const isTrueLiteral = (n: Node): n is TrueLiteral => (n.kind === NodeKind.TrueLiteral);
export const isFalseLiteral = (n: Node): n is FalseLiteral => (n.kind === NodeKind.FalseLiteral);
export const isRegExpLiteral = (n: Node): n is RegExpLiteral => (n.kind === NodeKind.RegExpLiteral);
export const isDateTimeLiteral = (n: Node): n is DateTimeLiteral => (n.kind === NodeKind.DateTimeLiteral);
export const isSymbolLiteral = (n: Node): n is SymbolLiteral => (n.kind === NodeKind.SymbolLiteral);

export const isRealNumberLiteral = (n: Node): n is RealNumberLiteral => [ NodeKind.IntegerLiteral, NodeKind.DecimalLiteral ].includes(n.kind);
export const isIntegerLiteral = (n: Node): n is IntegerLiteral => (n.kind === NodeKind.IntegerLiteral);
export const isDecimalLiteral = (n: Node): n is DecimalLiteral => (n.kind === NodeKind.DecimalLiteral);
export const isImaginaryNumberLiteral = (n: Node): n is ImaginaryNumberLiteral => (n.kind === NodeKind.ImaginaryNumberLiteral);

export const isIterableNode = (n: Node): n is IterableNode => !!(n.typeFlags & TypeFlags.Iterable);
export const isGenericIterable = (n: Node): n is GenericIterable => (n.kind === NodeKind.GenericIterable);
export const isArrayNode = (n: Node): n is ArrayNode => (n.kind === NodeKind.Array);
export const isMapNode = (n: Node): n is MapNode => (n.kind === NodeKind.Map);
export const isMultiSetNode = (n: Node): n is MultiSetNode => (n.kind === NodeKind.MultiSet);
export const isSetNode = (n: Node): n is SetNode => (n.kind === NodeKind.Set);
export const isListNode = (n: Node): n is ListNode => (n.kind === NodeKind.List);
export const isLinkedListNode = (n: Node): n is LinkedListNode => (n.kind === NodeKind.LinkedList);

export const isEnumDeclaration = (n: Node): n is EnumDeclaration => (n.kind === NodeKind.EnumDeclaration);
export const isEnumMemberDeclaration = (n: Node): n is EnumMemberDeclaration => (n.kind === NodeKind.EnumMemberDeclaration);

export const isTupleNode = (n: Node): n is TupleNode => (n.kind === NodeKind.Tuple);

export const isObjectLikeNode = (n: Node): n is ObjectLikeNode => !!(n.typeFlags & TypeFlags.ObjectLike);
export const isClassLikeNode = (n: Node): n is ClassLikeNode => !!(n.typeFlags & TypeFlags.ClassLike);
export const isObjectNode = (n: Node): n is ObjectNode => (n.kind === NodeKind.Object);
export const isClassDeclaration = (n: Node): n is ClassDeclaration => (n.kind === NodeKind.ClassDeclaration);
export const isAnonymousClass = (n: Node): n is AnonymousClass => (n.kind === NodeKind.AnonymousClass);
export const isInterfaceDeclaration = (n: Node): n is InterfaceDeclaration => (n.kind === NodeKind.InterfaceDeclaration);

export const isObjectLikeMember = (n: Node): n is ObjectLikeMember => !!(n.typeFlags & TypeFlags.ObjectLikeMember);
export const isPropertyDeclaration = (n: Node): n is PropertyDeclaration => (n.kind === NodeKind.PropertyDeclaration);
export const isMethodDeclaration = (n: Node): n is MethodDeclaration => (n.kind === NodeKind.MethodDeclaration);

export const isDateLikeNode = (n: Node): n is DateLikeNode => [ NodeKind.Date, NodeKind.DateTime ].includes(n.kind);
export const isDateNode = (n: Node): n is DateNode => (n.kind === NodeKind.Date);
export const isDateTimeNode = (n: Node): n is DateTimeNode => (n.kind === NodeKind.DateTime);

export const isFunctionNode = (n: Node): n is FunctionNode => !!(n.typeFlags & TypeFlags.Function);
export const isFunctionDeclaration = (n: Node): n is FunctionDeclaration => (n.kind === NodeKind.FunctionDeclaration);
export const isAnonymousFunctionNode = (n: Node): n is AnonymousFunctionNode => (n.kind === NodeKind.AnonymousFunction);
export const isSignatureNode = (n: Node): n is SignatureNode => (n.kind === NodeKind.Signature);
export const isParameterNode = (n: Node): n is ParameterNode => (n.kind === NodeKind.Parameter);

export const isTypeParameterDeclaration = (n: Node): n is TypeParameterDeclaration => (n.kind === NodeKind.TypeParameterDeclaration);
export const isTypeArgumentNode = (n: Node): n is TypeArgumentNode => (n.kind === NodeKind.TypeArgument);

export const isTypeDeclaration = (n: Node): n is TypeDeclaration => (n.kind === NodeKind.TypeDeclaration);
export const isVariableDeclaration = (n: Node): n is VariableDeclaration => (n.kind === NodeKind.VariableDeclaration);

export const isUnionNode = (n: Node): n is UnionNode => (n.kind === NodeKind.Union);
export const isIntersectionNode = (n: Node): n is IntersectionNode => (n.kind === NodeKind.Intersection);

export const isTopNode = (n: Node): n is TopNode => (n.kind === NodeKind.Anything);
export const isBottomNode = (n: Node): n is BottomNode => (n.kind === NodeKind.Nothing);
export const isAnythingNode = (n: Node): n is AnythingNode => (n.kind === NodeKind.Anything);
export const isNothingNode = (n: Node): n is NothingNode => (n.kind === NodeKind.Nothing);
export const isNullNode = (n: Node): n is NullNode => (n.kind === NodeKind.Null);

export const isReferenceNode = (n: Node): n is ReferenceNode => (n.kind === NodeKind.Reference);

// endregion
