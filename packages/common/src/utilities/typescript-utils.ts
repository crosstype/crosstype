import * as ts from 'typescript'
import {
  __String, BaseType, CheckFlags, ClassLikeDeclaration, CompilerHost, CompilerOptions, Declaration, emptyArray,
  getCheckFlags, getDeclarationModifierFlagsFromSymbol, getEffectiveImplementsTypeNodes, Identifier, ImportDeclaration,
  IndexKind, InterfaceType, IntrinsicType, ModifierFlags, ModuleDeclaration, NamedImports, Node, ObjectType, Program,
  Signature, SignatureKind, SourceFile, Symbol, SymbolFlags, SyntaxKind, Type, TypeChecker
} from 'typescript'
import { ConvertibleSet, getPackageDetail, hasProperties, normalizeAndJoinPaths, truthyStr } from '../index';
import path from 'path';
import fs from 'fs';


/* **************************************************************************************************************** */
// region: Types
/* **************************************************************************************************************** */

/**
 * Identifier Import location data (see getImportLocationForIdentifier())
 */
export interface IdentifierImportLocation {
  fileName: string
  moduleSpecifier: string
  name: __String
  propName?: __String
}

export interface SourceFileDetail {
  sourceFile: SourceFile,
  fileName: string,
  relativeFileName: string,
  packagePath: string | undefined,
  /** @schema { regex: /(@\w+?\/)*w+?$/ } */
  packageName: string
}

// endregion


/* **************************************************************************************************************** */
// region: Extended Types
/* **************************************************************************************************************** */

export interface CompilerHostWithCache extends CompilerHost {
  cache: Map<string, SourceFile>
}

// endregion


/* ****************************************************************************************************************** */
// region: Symbol
/* ****************************************************************************************************************** */

export const isSymbolExported = (
  symbol: ts.Symbol | undefined,
  moduleNode: SourceFile | ModuleDeclaration,
  checker: TypeChecker
) =>
  !!symbol && !!checker.getSymbolAtLocation(moduleNode)?.exports?.get(symbol.escapedName)

/**
 * Get package and path detail for a node's SourceFile
 */
export function getSourceFileDetail(symbol: Symbol): SourceFileDetail {
  const sourceFile = symbol.declarations[0].getSourceFile();
  const fileName = sourceFile.fileName;

  const { packagePath, packageData } = getPackageDetail(path.dirname(fileName));
  const packageName = (packageData?.name || '<unknown>');

  // Get relative path, normalize separators to forward slash
  const relativeFileName = truthyStr(packagePath, normalizeAndJoinPaths(path.relative(packagePath!, fileName)));

  return { fileName, packageName, packagePath, relativeFileName, sourceFile }
}

// Borrowed from TS source (edited out unnecessary bits)
export function isReadonlySymbol(symbol: Symbol): boolean {
    // The following symbols are considered read-only:
    // Properties with a 'readonly' modifier
    // Get accessors without matching set accessors
    // Enum members
    // Object.defineProperty assignments with writable false or no setter
    // Unions and intersections of the above (unions and intersections eagerly set isReadonly on creation)
    return !!(getCheckFlags(symbol) & CheckFlags.Readonly ||
        symbol.flags & SymbolFlags.Property && getDeclarationModifierFlagsFromSymbol(symbol) & ModifierFlags.Readonly ||
        symbol.flags & SymbolFlags.Accessor && !(symbol.flags & SymbolFlags.SetAccessor) ||
        symbol.flags & SymbolFlags.EnumMember
    );
}

// endregion


/* ****************************************************************************************************************** */
// region: Node
/* ****************************************************************************************************************** */

export const nodeIsKind = <T extends ts.Node = never>(node: ts.Node, ...kind: ts.SyntaxKind[]): node is T =>
  kind.some(k => node.kind === k);

export function getDeclarationSignatures(declaration: Declaration, checker: TypeChecker) {
  const type = checker.getTypeAtLocation(declaration);
  const callSignatures = checker.getSignaturesOfType(type, SignatureKind.Call) as Signature[];
  const constructSignatures = checker.getSignaturesOfType(type, SignatureKind.Construct) as Signature[];

  return { callSignatures, constructSignatures };
}

/**
 * Find import detail for Identifier if one exists (relies on Node.locals)
 */
// TODO - revise with better logic using Symbol
export function getImportLocationForIdentifier(node: Identifier): IdentifierImportLocation | undefined {
  const typeName = node.escapedText;
  if (!typeName) return void 0;

  /* Find import statement */
  const symbol = node.getSourceFile().locals!.get(typeName);
  if (!symbol) return void 0;

  const dec = (symbol?.getDeclarations() || [])[0];
  let importStatement: ImportDeclaration | undefined;
  for (let n = dec.parent; n && !importStatement; n = n.parent)
    if (ts.isImportDeclaration(n)) importStatement = n;
  if (!importStatement) return void 0;

  /* Get import detail */
  const moduleSpecifier = importStatement.moduleSpecifier.getText().replace(/^['"](.+)['"]$/, '$1');

  const bindingElement = (importStatement.importClause?.namedBindings as NamedImports)?.elements
    .find(({ symbol: s }) => symbol === s);

  const name = bindingElement?.name.escapedText || typeName;
  const propertyName = bindingElement?.propertyName?.escapedText;

  return {
    fileName: node.getSourceFile().fileName,
    moduleSpecifier: moduleSpecifier,
    name,
    ...(propertyName && { propertyName: typeName })
  }
}

// endregion


/* ****************************************************************************************************************** */
// region: Type
/* ****************************************************************************************************************** */

export const isErrorType = (type: Type) => (type as IntrinsicType).intrinsicName === 'error';

export const isReadonlyArrayType = (type: Type) =>
  type.checker.isArrayLikeType(type) && !!type.checker.getIndexInfoOfType(type, IndexKind.Number)?.isReadonly

export const isType = (v: any): v is Type => v.hasOwnProperty('getConstraint');

export const isSymbol = (v: any): v is Symbol => hasProperties(v, [ 'escapedName', 'declarations', 'flags' ]);

export const getSymbolForType = (type: Type): Symbol | undefined => type.aliasSymbol || type.getSymbol();

export function getImplementsTypes(type: InterfaceType): BaseType[] {
  const { checker } = type;
  let resolvedImplementsTypes: BaseType[] = emptyArray;

  for (const declaration of type.symbol.declarations) {
    const implementsTypeNodes = getEffectiveImplementsTypeNodes(declaration as ClassLikeDeclaration);
    if (!implementsTypeNodes) continue;
    for (const node of implementsTypeNodes) {
      const implementsType = checker.getTypeFromTypeNode(node);
      if (!isErrorType(implementsType)) {
        if (resolvedImplementsTypes === emptyArray) {
          resolvedImplementsTypes = [<ObjectType>implementsType];
        }
        else {
          resolvedImplementsTypes.push(implementsType);
        }
      }
    }
  }
  return resolvedImplementsTypes;
}

/**
 * Walk up inheritance types and aggregate all
 */
export function getAllBaseTypes(type: InterfaceType): Type[] {
  const { checker } = type;
  let baseTypes = <Type[]>[];
  (function addBaseTypes(type: InterfaceType) {
    try {
      checker.getBaseTypes(type)?.forEach(t => {
        baseTypes.push(t);
        addBaseTypes(<InterfaceType>t);
      })
    } catch {}
  })(type);

  return baseTypes;
}

/**
 * Get all heritage types (including implements)
 */
export const getHeritageTypes = (type: InterfaceType): Type[] => {
  return new ConvertibleSet((type.getBaseTypes() || []).concat(getImplementsTypes(type))).toArray();
};

/**
 * Updates SRC type with DEST type (modifies in place)
 */
export function updateType(dest: Type, src: Type) {
  const id = dest.id;
  for (const key of Object.getOwnPropertyNames(dest)) delete (dest as any)[key];
  Object.setPrototypeOf(dest, Object.getPrototypeOf(src));
  Object.defineProperties(dest, Object.getOwnPropertyDescriptors(src));
  dest.id = id;
}

// endregion


/* ****************************************************************************************************************** */
// region: Mixed
/* ****************************************************************************************************************** */

export function getPrimaryDeclaration<TReturn extends Node = Declaration>(type: Type): TReturn
export function getPrimaryDeclaration<TReturn extends Node = Declaration>(node: Node): TReturn
export function getPrimaryDeclaration<TReturn extends Node = Declaration>(symbol: Symbol): TReturn
export function getPrimaryDeclaration<TReturn extends Node = Declaration>(typeOrNodeOrSymbol: Type | Node | Symbol): Node | undefined {
  const symbol = (typeof (typeOrNodeOrSymbol as any)['getDeclarations'] === 'function') ? typeOrNodeOrSymbol as Symbol :
                 ts.isNode(typeOrNodeOrSymbol as Node) ? (typeOrNodeOrSymbol as Node).symbol :
                 getSymbolForType(typeOrNodeOrSymbol as Type);

  if (!symbol) return undefined;
  return (symbol.getDeclarations() || [])[0];
}

export function hasPrivateModifier(type: Type): boolean
export function hasPrivateModifier(symbol: Symbol): boolean
export function hasPrivateModifier(typeOrSymbol: Type | Symbol): boolean {
  const symbol = isType(typeOrSymbol) ? getSymbolForType(typeOrSymbol as Type) : typeOrSymbol;

  return Boolean(symbol?.valueDeclaration.modifiers?.some(
    mod => mod.kind === SyntaxKind.PrivateKeyword
  ));
}

/**
 * Get JSDoc tags from target as array of tuples
 */
// TODO - convert to named tuples after upgrade to TS 4
export function getTags(target: Symbol | Type | Declaration | Node):
  Array<[ /* name: */ string, /* value: */ (string | undefined) ]> | undefined
{
  const tags = isType(target) ? getSymbolForType(target)?.getJsDocTags() :
               isSymbol(target) ? target.getJsDocTags() :
               ts.isDeclaration(target) ? ts.JsDoc.getJsDocTagsFromDeclarations([ target ]) :
               target.symbol?.getJsDocTags();

  if (!tags) return void 0;

  return tags.map(({ name, text }) => [ name, text ]);
}

// endregion


/* **************************************************************************************************************** */
// region: Custom Utilities
/* **************************************************************************************************************** */

export function createCompilerHostWithCache(
  options: CompilerOptions,
  setParentNodes?: boolean,
  cacheFiles?: SourceFile[] | readonly SourceFile[]
): CompilerHostWithCache
{
  const cache = new Map<string, SourceFile>((cacheFiles as SourceFile[])?.map(f => [ f.fileName, f ]) || []);
  const compilerHost = ts.createCompilerHost(options, setParentNodes);
  const originalGetSourceFile = compilerHost.getSourceFile as Function;

  return Object.assign(compilerHost, {
    cache,
    getSourceFile(fileName: string, languageVersion: ts.ScriptTarget) {
      if (this.cache.has(fileName)) return this.cache.get(fileName);

      const sourceFile = originalGetSourceFile(...arguments);
      this.cache.set(fileName, sourceFile);

      return sourceFile;
    }
  });
}

// TODO - Redo with better logic
/**
 * Check common source directory and walk up until it finds tsconfig.json
 * @param program
 */
export function findLikelyTsConfigFile(program: Program): string | undefined {
  let dir = program.getCommonSourceDirectory();

  while(fs.existsSync(dir)) {
    const fileName = path.resolve(dir, 'tsconfig.json');
    if (fs.existsSync(fileName)) return fileName;
    dir = path.resolve(dir, '..');
  }
}

// endregion
