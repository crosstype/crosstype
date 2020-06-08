
/* ****************************************************************************************************************** */
// region: Flags
/* ****************************************************************************************************************** */

/**
 * The following represent broad categorized for language-agnostic types. More specific types are implemented in
 * NodeKinds
 */
export enum TypeFlags {
  None = 0,

  /* Classification */
  Unit = 1 << 0,
  Primitive = 1 << 1,
  Composite = 1 << 2,         // see: https://en.wikipedia.org/wiki/Data_type#Composite_types
  Abstract = 1 << 3,

  /* Type Grouping */
  Literal = 1 << 4,
  Numeric = 1 << 5,
  Module = 1 << 6,
  Iterable = 1 << 7,
  Function = 1 << 8,
  Tuple = 1 << 9,
  Object = 1 << 10,
  Class = 1 << 11,
  Interface = 1 << 12,
  Reference = 1 << 13,
  Enum = 1 << 14,
  Property = 1 << 15,
  Method = 1 << 29,           // Note: Keep last item value: 29 as a marker (29 is the maximum value v8 allows)

  ObjectLike = Object | Class | Interface,
  ClassLike = Class | Interface,
  ObjectLikeMember = Property | Method,
}

export enum ModifierFlags {
  None = 0,

  ReadOnly = 1 << 1,
  WriteOnly = 1 << 2,
  Public = 1 << 3,
  Private = 1 << 4,
  Protected = 1 << 5,
  Internal = 1 << 6,
  Unpublished = 1 << 29,      // Indicates unpublished in the public API scope - Example, TypeScript parser may have
                              // an option to add this modifier for items tagged with the JSDoc @internal tag
                              // (see: https://martinfowler.com/bliki/PublishedInterface.html)
}

export enum NodeFlags {
  None = 0,

  Named = 1 << 0,             // Node has name property
  Specific = 1 << 1,          // Has Language-specific node kind information in origin
  Declaration = 1 << 2,
  Definition = 1 << 3,
  Nested = 1 << 29,
}

export enum DefinitionFlags {
  None = 0,

  /* Declaration Types */
  Function = 1 << 0,
  Variable = 1 << 1,
  Class = 1 << 2,
  Interface = 1 << 3,
  Type = 1 << 4,

  /* Modifiers */
  HasMultipleDeclarations = 1 << 5,
  Parameterized = 1 << 29       // Instance of a generic with supplied type-arguments (combined with Class or Interface)
}

export enum LinkedListFlags {
  Single = 1 << 0,
  Double = 1 << 1,
  Multiple = 1 << 2,
  Circular = 1 << 3,
  HasSentinel = 1 << 4,
  HashLinking = 1 << 29
}

// endregion


/* ****************************************************************************************************************** */
// region: Kinds
/* ****************************************************************************************************************** */

export enum NodeKind {
  /* Reference */
  Reference,

  /* Non-Numeric Primitives */
  String,
  Character,
  Byte,
  RegExp,
  Symbol,
  Boolean,

  /* Number-Like Primitives */
  Integer,
  DecimalNumber,
  ComplexNumber,
  NotANumber,
  Infinity,

  /* Non-Numeric Literals */
  StringLiteral,
  TrueLiteral,
  FalseLiteral,
  RegExpLiteral,
  SymbolLiteral,
  DateTimeLiteral,

  /* Numeric Literals */
  IntegerLiteral,
  DecimalLiteral,
  ImaginaryNumberLiteral,

  /* Abstract Data Types */
  Date,
  DateTime,

  /* Function-Related */
  FunctionDeclaration,
  AnonymousFunction,
  Signature,
  Parameter,

  /* Iterable */
  GenericIterable,
  Array,
  Set,
  MultiSet,
  Map,
  List,
  LinkedList,

  /* Enum-Related */
  EnumDeclaration,
  EnumMemberDeclaration,

  /* TypeParameter-Related */
  TypeParameterDeclaration,
  TypeArgument,

  /* Other Declarations */
  TypeDeclaration,
  VariableDeclaration,

  /* Tuple */
  Tuple,

  /* Set Operations */
  Union,
  Intersection,

  /* Special Types */
  Anything,
  Nothing,
  Null,

  /* Module */
  Namespace,
  SourceFile,

  /* Object-Like */
  Object,
  ClassDeclaration,
  AnonymousClass,
  InterfaceDeclaration,

  /* Object-Like Member */
  PropertyDeclaration,
  MethodDeclaration,

  /* Definition */
  Definition
}

export enum OrderKind {
  Insertion,
  Index,
  Link,
  Calculated
}

export enum SignatureKind {
  Call,
  Construct
}

export enum DecimalKind {
  Float,
  Fixed,
  Either
}

// endregion
