import { NodeFlags, NodeKind, TypeFlags } from '#ast/enums';
import { Node } from './node-types';


/* ****************************************************************************************************************** */
// region: Types
/* ****************************************************************************************************************** */

export interface NodeMetadata {
  childContainerProperties?: Map</* key */ string, { key: string, optional: boolean, validKinds: NodeKind }>
  baseFlags?: NodeFlags
  baseTypeFlags?: TypeFlags
}

// endregion


/* ****************************************************************************************************************** */
// region: Utilities
/* ****************************************************************************************************************** */

export function getNodeMetadata(node: Node): NodeMetadata {
  return nodeMetadata[node.kind];
}

// endregion


/* ****************************************************************************************************************** */
// region: Node Kind Metadata
/* ****************************************************************************************************************** */

// TODO - Make this auto-generated using JSDoc tags in interface

export const nodeMetadata: Record<NodeKind, NodeMetadata> = {
  [NodeKind.Reference]: {},
  [NodeKind.String]: {},
  [NodeKind.Character]: {},
  [NodeKind.Byte]: {},
  [NodeKind.RegExp]: {},
  [NodeKind.Symbol]: {},
  [NodeKind.Boolean]: {},
  [NodeKind.Integer]: {},
  [NodeKind.DecimalNumber]: {},
  [NodeKind.ComplexNumber]: {},
  [NodeKind.NotANumber]: {},
  [NodeKind.Infinity]: {},
  [NodeKind.StringLiteral]: {},
  [NodeKind.TrueLiteral]: {},
  [NodeKind.FalseLiteral]: {},
  [NodeKind.RegExpLiteral]: {},
  [NodeKind.SymbolLiteral]: {},
  [NodeKind.IntegerLiteral]: {},
  [NodeKind.DecimalLiteral]: {},
  [NodeKind.ImaginaryNumberLiteral]: {},
  [NodeKind.FunctionDeclaration]: {},
  [NodeKind.AnonymousFunction]: {},
  [NodeKind.Signature]: {},
  [NodeKind.Parameter]: {},
  [NodeKind.GenericIterable]: {},
  [NodeKind.Array]: {},
  [NodeKind.Set]: {},
  [NodeKind.MultiSet]: {},
  [NodeKind.Map]: {},
  [NodeKind.List]: {},
  [NodeKind.LinkedList]: {},
  [NodeKind.EnumDeclaration]: {},
  [NodeKind.EnumMemberDeclaration]: {},
  [NodeKind.TypeParameterDeclaration]: {},
  [NodeKind.TypeArgument]: {},
  [NodeKind.Tuple]: {},
  [NodeKind.Union]: {},
  [NodeKind.Intersection]: {},
  [NodeKind.Anything]: {},
  [NodeKind.Nothing]: {},
  [NodeKind.Null]: {},
  [NodeKind.Namespace]: {},
  [NodeKind.SourceFile]: {},
  [NodeKind.Object]: {},
  [NodeKind.ClassDeclaration]: {},
  [NodeKind.InterfaceDeclaration]: {},
  [NodeKind.PropertyDeclaration]: {},
  [NodeKind.MethodDeclaration]: {},
  [NodeKind.Definition]: {},
  [NodeKind.DateTimeLiteral]: {},
  [NodeKind.Date]: {},
  [NodeKind.DateTime]: {},
  [NodeKind.TypeDeclaration]: {},
  [NodeKind.VariableDeclaration]: {},
  [NodeKind.AnonymousClass]: {},
};

// endregion
