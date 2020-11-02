// noinspection ES6UnusedImports
import {} from 'ts-expose-internals';
import { createGenerator, GeneratorContext } from '@crosstype/build-tools';
import path from 'path';
import ts, {
  CompilerHost, InterfaceDeclaration, InterfaceType, Program, PropertyAssignment, QualifiedName, ScriptTarget,
  SourceFile, SyntaxKind, Type, TypeFlags, TypeNode
} from 'typescript';
import { PluginConfig, ProgramTransformerExtras } from 'ts-patch';
import { tsquery } from '@phenomnomnominal/tsquery';
import { getAllBaseTypes, getPrimaryDeclaration } from '@crosstype/ts-api-utils';


/* ****************************************************************************************************************** */
// region: Config
/* ****************************************************************************************************************** */

const targetFile = path.resolve(__dirname, '../src/ast/node-types.ts');
const baseNodeInterfaceName = 'Node';
const namedNodeInterfaceName = 'NamedNode';
const flagsHelperName = 'Flags';
const lookupHelperName = 'NodeForKind';

const outFiles = {
  nodeLookups: path.join(__dirname, '../generated/ast/node-lookups.ts'),
  nodeAliases: path.join(__dirname, '../generated/ast/node-aliases.ts'),
  nodeMetadata: path.join(__dirname, '../generated/ast/node-metadata.ts'),
}

const selectors = {
  interfaces: `SourceFile > InterfaceDeclaration`
}

// endregion


/* ****************************************************************************************************************** */
// region: Types
/* ****************************************************************************************************************** */

interface ASTDetail {
  baseNodeInterface: InterfaceDeclaration
  baseNodeInterfaceType: Type
  namedNodeInterfaceType: Type
  astFile: SourceFile
  nodeInterfaces: Map<InterfaceDeclaration, { typeFlags: string[], flags: string[] }>
  interfaceDeclarations: InterfaceDeclaration[]
}

// endregion


/* ****************************************************************************************************************** */
// region: Helpers
/* ****************************************************************************************************************** */

function getASTDetail(program: Program): ASTDetail {
  const checker = program.getTypeChecker();

  const astFile: any = program.getSourceFile(targetFile);

  /* Find interfaces & get types */
  const interfaceDeclarations = tsquery.query(astFile, selectors.interfaces) as InterfaceDeclaration[];
  const baseNodeInterface = interfaceDeclarations.find(node => node.name.text === baseNodeInterfaceName)!;
  const baseNodeInterfaceType = checker.getTypeAtLocation(baseNodeInterface)!;
  const namedNodeInterface = interfaceDeclarations.find(node => node.name.text === namedNodeInterfaceName)!;
  const namedNodeInterfaceType = checker.getTypeAtLocation(namedNodeInterface)!;

  /* Get node interfaces & corresponding flags */
  const nodeInterfaces = new Map<InterfaceDeclaration, { typeFlags: string[], flags: string[] }>();
  for (const node of interfaceDeclarations) getInterfaceNodes(node);

  // Remove interfaces without explicit kind (filters to only proper Nodes)
  for (const node of nodeInterfaces.keys())
    if (!node.members?.some(m => ts.isPropertySignature(m) && (<any>m).name.text === 'kind'))
      nodeInterfaces.delete(node);

  return ({
    interfaceDeclarations,
    baseNodeInterface,
    baseNodeInterfaceType,
    namedNodeInterfaceType,
    nodeInterfaces,
    astFile
  });

  function getInterfaceNodes(declaration: InterfaceDeclaration): { typeFlags: string[], flags: string[] } | undefined {
    const isNodeBasedInterface = (declaration: InterfaceDeclaration): boolean =>
      (declaration !== baseNodeInterface) &&
      checker.isTypeAssignableTo(checker.getTypeAtLocation(declaration), baseNodeInterfaceType);
    const res: { typeFlags: string[], flags: string[] } = { typeFlags: [], flags: [] };
    const addFlags = (kind: 'type' | 'node', flags: string | undefined | string[]) => {
      if (!flags) return;
      const target = (kind === 'type') ? 'typeFlags' : 'flags';

      if (typeof flags === 'string') res[target].push(...flags.split(/\s*\|\s*/));
      else res[target].push(...flags);
    }

    if (nodeInterfaces.has(declaration)) return nodeInterfaces.get(declaration);

    /* Check that declaration is node-based */
    if (!isNodeBasedInterface(declaration)) return;

    /* Get flags from heritage clause */
    const heritageTypes = declaration.heritageClauses?.[0]?.types;
    if (!heritageTypes || !heritageTypes.length) return;

    for (const node of heritageTypes) {
      /* Get direct heritage flags */
      if (ts.isExpressionWithTypeArguments(node) && ts.isIdentifier(node.expression) && node.expression.text === flagsHelperName) {
        const flagGroup = node.typeArguments![0].getText();
        const flagTags = node.typeArguments![1].getText();
        const newFlags = flagTags.replace(/['"](\w+)['"]/g, `${flagGroup}.$1`);
        addFlags(flagGroup === 'NodeFlags' ? 'node' : 'type', newFlags);
        continue;
      }

      /* Find Node-based heritage interfaces & append those flags */
      const type = checker.getTypeAtLocation(node);
      const typeDeclaration = getPrimaryDeclaration(type);
      if (ts.isInterfaceDeclaration(typeDeclaration) && isNodeBasedInterface(typeDeclaration)) {
        const subNodeFlags = getInterfaceNodes(typeDeclaration);
        addFlags('type', subNodeFlags?.typeFlags)
        addFlags('node', subNodeFlags?.flags);
      }
    }
    nodeInterfaces.set(declaration, res);
    return res;
  }
}

const formatJSDocComment = (msg: string, maxLength: number = 120) => {
  let res = '/**';
  const len = maxLength - 3;
  for (let i = 0; i < msg.length; i += len) res += `\n * ${msg.substr(i, len)}`;

  return res + '\n */\n';
}

const createImportsDeclaration = (names: string[], from: string = '#ast') =>
  ts.createImportDeclaration(/* decorators */ undefined, /* modifiers */ undefined,
    ts.createImportClause(undefined,
      ts.createNamedImports(names.map(name => ts.createImportSpecifier(undefined, ts.createIdentifier(name)))),
      false
    ),
    ts.createStringLiteral(from)
  );

// endregion


/* ****************************************************************************************************************** */
// region: Generator
/* ****************************************************************************************************************** */

/**
 * ts-patch Plugin entry point
 */
function entry(
  this: GeneratorContext,
  program: Program,
  host: CompilerHost | undefined,
  config: PluginConfig,
  extras: ProgramTransformerExtras
): Program {
  const tsInstance = extras.ts as unknown as typeof ts;
  const checker = program.getTypeChecker();
  const detail = getASTDetail(program);
  const printer = ts.createPrinter();

  generateNodeLookups(this);
  generateNodeAliases(this);
  generateNodeMetadata(this);

  /* Update Program instance & return (ensures generated files are added & up-to-date + prevents false errors) */
  const compilerOptions = program.getCompilerOptions();
  const rootFileNames = new Set(program.getRootFileNames());
  Object.values(outFiles).forEach(f => rootFileNames.add(f));

  return tsInstance.createProgram(
    [ ...rootFileNames ],
    compilerOptions,
    tsInstance.createIncrementalCompilerHost(compilerOptions)
  );

  /**
   * Generates node-lookups.ts
   */
  function generateNodeLookups(context: GeneratorContext) {
    const importDeclaration = createImportsDeclaration([
      'NodeKind',
      ...[ ...detail.nodeInterfaces.keys() ].map(node => node.name.text)
    ]);

    /* Generate conditional type AST from Node interfaces */
    let typeNode: TypeNode = ts.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword);
    for (const node of [ ...detail.nodeInterfaces.keys() ].reverse()) {
      const qualifiedName = (<any>node.members).find((m: any) => m.name.text === 'kind')!.type.typeName as QualifiedName;
      typeNode = ts.createConditionalTypeNode(
        /* checkType */ ts.createTypeReferenceNode(ts.createIdentifier('K'), undefined),
        /* extendsType */ ts.createTypeReferenceNode(qualifiedName, undefined),
        /* trueType */ ts.createTypeReferenceNode(node.name, undefined),
        /* falseType */ typeNode
      );
    }

    /* Generate helper type declaration */
    const declaration =
      ts.createTypeAliasDeclaration(
        /* decorators */ undefined,
        /* modifiers */ [ ts.createModifier(ts.SyntaxKind.ExportKeyword) ],
        /* Name */ ts.createIdentifier(lookupHelperName),
        /* typeParameters */ [
          ts.createTypeParameterDeclaration(
            ts.createIdentifier('K'),
            ts.createTypeReferenceNode(ts.createIdentifier('NodeKind'), undefined),
            undefined
          )
        ],
        /* type */ typeNode
      );

    /* Create SourceFile & write */
    const sourceFile = ts.createSourceFile(outFiles.nodeLookups, '', ScriptTarget.ES2017);
    sourceFile.statements = ts.createNodeArray([ importDeclaration, declaration ]);
    const sourceText = printer.printFile(sourceFile).replace(/(K extends [\w.]+? \? \w+ : )/g, `\n  $1`);

    context.writeFile(outFiles.nodeLookups, sourceText);
  }

  /**
   * Generates node-aliases.ts
   */
  function generateNodeAliases(context: GeneratorContext) {
    const createAliasDeclaration = (name: string, nodes: string[]) =>
      ts.createTypeAliasDeclaration(
        /* decorators */ undefined,
        /* modifiers */ [ ts.createModifier(ts.SyntaxKind.ExportKeyword) ],
        /* name */ ts.createIdentifier(name),
        /* typeParams */ undefined,
        /* type */ ts.createUnionTypeNode(nodes.map(name => ts.createTypeReferenceNode(name, undefined)))
      );

    /* Sort Nodes into categories */
    const nodeNames: Record<string, string[]> = {
      any: [],
      nonValue: [],
      value: [],
      declaration: [],
      rootDeclaration: []
    }

    for (const [ node, { typeFlags, flags } ] of detail.nodeInterfaces.entries()) {
      const name = node.name.text;

      nodeNames.any.push(name);

      if (
        typeFlags.includes('TypeFlags.Module') ||
        flags.includes('NodeFlags.Nested') ||
        flags.includes('NodeFlags.Declaration') ||
        flags.includes('NodeFlags.Definition')
      ) nodeNames.nonValue.push(name);
      else nodeNames.value.push(name);

      if (flags.includes('NodeFlags.Declaration')) {
        nodeNames.declaration.push(name);
        if (!flags.includes('NodeFlags.Nested')) nodeNames.rootDeclaration.push(name);
      }
    }

    /* Create SourceFile & AST declarations for group aliases */
    const sourceFile = ts.createSourceFile(outFiles.nodeAliases, '', ScriptTarget.ES2017);
    sourceFile.statements = ts.createNodeArray([
      createImportsDeclaration(nodeNames.any),
      createAliasDeclaration('AnyNode', nodeNames.any),
      createAliasDeclaration('ValueNode', nodeNames.value),
      createAliasDeclaration('NonValueNode', nodeNames.nonValue),
      createAliasDeclaration('Declaration', nodeNames.declaration),
      createAliasDeclaration('RootDeclaration', nodeNames.rootDeclaration)
    ]);

    /* Print and add JSDoc */
    const sourceText = printer
      .printFile(sourceFile)
      .replace(/(^export type AnyNode =)/m, formatJSDocComment(`All valid nodes`) + '$1')
      .replace(/(^export type NonValueNode =)/m,
        formatJSDocComment(`Nodes which cannot be used in the general value position (must have a specific parent)`) + '$1'
      )
      .replace(/(^export type ValueNode =)/m,
        formatJSDocComment(`Nodes that can be used in the general value position (can have any parent)`) + '$1'
      )

    // Write File
    context.writeFile(outFiles.nodeAliases, sourceText);
  }

  /**
   * Generates node-metadata.ts
   */
  function generateNodeMetadata(context: GeneratorContext) {
    const isValidChildContainerType = (type: Type) =>
      // Include if single Node
      (checker.isTypeAssignableTo(type, detail.baseNodeInterfaceType)) ||
      // Include if non-readonly Node Iterable
      ([ 'NodeMap', 'NodeSet' ].includes(type.symbol?.getEscapedName().toString()));

    const propertyAssignments = [ ...detail.nodeInterfaces.entries() ].map(([ node, { typeFlags, flags } ]) => {
        const nodeKindName = (<any>node.members).find((m: any) => m.name.text === 'kind')!.type.typeName as QualifiedName;
        const childContainers: { key: string, optional: boolean }[] = [];
        const nodeType = checker.getTypeAtLocation(node);

        /* Iterate members & find child container keys */
        for (const propSymbol of nodeType.getProperties()) {
          const m = propSymbol.valueDeclaration;
          if (!ts.isPropertySignature(m) || !m.type) continue;

          const name = m.name.getText();
          const type = checker.getTypeAtLocation(m.type);
          const isReadonly = !!m.modifiers?.some(modifier => modifier.kind === SyntaxKind.ReadonlyKeyword);
          const isOptional = !!m.questionToken;

          // Do not proceed if tagged @notChild or readonly
          if (m.symbol.getJsDocTags().some(t => t.name.toLowerCase() === 'notchild') || isReadonly) continue;

          if ((type.isUnion() && type.types.every(isValidChildContainerType)) || isValidChildContainerType(type))
            childContainers.push({ key: name, optional: isOptional });
        }

        const objectPropertes: PropertyAssignment[] = [];

        /* Add childContainerProperties field */
        if (childContainers.length) objectPropertes.push(ts.createPropertyAssignment(
          ts.createIdentifier('childContainerProperties'),
          ts.createNew(ts.createIdentifier('Map'), undefined, [
            ts.createArrayLiteral(
              childContainers.map(c => ts.createArrayLiteral([
                ts.createStringLiteral(c.key),
                ts.createObjectLiteral([
                  ts.createPropertyAssignment(ts.createIdentifier('key'), ts.createStringLiteral(c.key)),
                  ts.createPropertyAssignment(ts.createIdentifier('optional'), c.optional ? ts.createTrue() : ts.createFalse())
                ], false)
              ])),
              true
            )
          ])
        ));

        /* Add baseTypeFlags field */
        if (typeFlags.length) objectPropertes.push(ts.createPropertyAssignment(
          ts.createIdentifier('baseTypeFlags'),
          ts.createArrayLiteral(typeFlags.map(f => ts.createIdentifier(f)))
        ));

        /* Add baseFlags field */
        if (flags.length) objectPropertes.push(ts.createPropertyAssignment(
          ts.createIdentifier('baseFlags'),
          ts.createArrayLiteral(flags.map(f => ts.createIdentifier(f)))
        ));

        /* Add isNamedNode field */
        if (getAllBaseTypes(<InterfaceType>nodeType).find(t => (<any>t).target === detail.namedNodeInterfaceType))
          objectPropertes.push(ts.createPropertyAssignment(
            ts.createIdentifier('isNamedNode'),
            ts.createTrue()
          ));

        /* Create main Property PropertyAssignment */
        return ts.createPropertyAssignment(
          ts.createComputedPropertyName(
            ts.createPropertyAccess(ts.createIdentifier(nodeKindName.left.getText()), nodeKindName.right)
          ),
          ts.createObjectLiteral(objectPropertes, true)
        )
      }
    );

    /* Create primary exported statement (ie. export const nodeMetadata ...) */
    const metadataStatement = ts.createVariableStatement(
      [ ts.createModifier(ts.SyntaxKind.ExportKeyword) ],
      ts.createVariableDeclarationList([
          ts.createVariableDeclaration(
            /* name */ ts.createIdentifier('nodeMetadata'),
            /* type */ ts.createTypeReferenceNode(
              ts.createIdentifier('Record'),
              [
                ts.createTypeReferenceNode(ts.createIdentifier('NodeKind'), undefined),
                ts.createTypeReferenceNode(ts.createIdentifier('NodeMetadata'), undefined)
              ]
            ),
            ts.createObjectLiteral(propertyAssignments, true)
          )
        ],
        ts.NodeFlags.Const
      )
    );

    // NodeKind NodeMetadata

    /* Create SourceFile */
    const sourceFile = ts.createSourceFile(outFiles.nodeAliases, '', ScriptTarget.ES2017);
    sourceFile.statements = ts.createNodeArray([
      createImportsDeclaration([ 'NodeKind', 'NodeMetadata', 'NodeFlags', 'TypeFlags' ]),
      metadataStatement
    ]);

    /* Print & Write File */
    const sourceText = printer.printFile(sourceFile);
    context.writeFile(outFiles.nodeMetadata, sourceText);
  }
}

const generator = createGenerator({
  name: 'AST',
  watchFiles: [
    path.join(__dirname, '../src/ast/node-types.ts')
  ],
  outFiles: Object.values(outFiles),
  entry
});

export default generator;

// endregion
