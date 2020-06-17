import ts, { Node, ObjectFlags, SourceFile, TupleType, Type, TypeReference } from '@crosstype/system/typescript';
import { updateType } from '@crosstype/system';


/* ****************************************************************************************************************** */
// region: Types
/* ****************************************************************************************************************** */

/**
 * MetaData returned from unwrapReference
 */
export interface TypeReferenceMeta {
  referenceType: TypeReference
  resolvedType: Type
  typeArguments: Type[] | undefined
  propertyKeys: string[] | undefined
}

/**
 * (see notes on extendSourceFile())
 */
export interface ExtendedSourceFile extends SourceFile {
  localTypeParameters: string[]
  modified: boolean
}

/**
 * (see notes on extendSourceFile())
 */
export interface ExtendedNode extends Node {
  parent: ExtendedNode
  localTypeParameters: string[]
}

/**
 * Special TypeReference extension for wrapped references
 */
export interface WrappedTypeReference extends TypeReference {
  aliasTypeArguments: [ Type, TypeReference, TupleType ]
}

// endregion

export const isWrappedReference = (type: Type, wrapperName: string): type is WrappedTypeReference => (
  ((type as TypeReference).objectFlags === ObjectFlags.Reference) &&
  ((type as TypeReference).aliasSymbol?.getName() === wrapperName)
);

export function unwrapReference(wrappedType: WrappedTypeReference): TypeReferenceMeta {
  const [ resolvedType, referenceType ] = wrappedType.aliasTypeArguments;
  const indexArg = wrappedType.aliasTypeArguments[2] as TupleType | undefined;

  /* Extract type info */
  const typeArguments = referenceType.typeArguments as Type[] | undefined;
  const targetIndexes = indexArg?.typeArguments?.map(({ value }: any) => value as string);

  // Modify the TS type hierarchy with our unwrapped type (useful for those inspecting SchemaNode.origin on AST nodes)
  // Note: This may have to change, as it might break things if running Watch instance, etc. re-visit later
  updateType(wrappedType, resolvedType);

  return ({ resolvedType, referenceType, typeArguments, propertyKeys: targetIndexes });
}

/**
 * Convert Node into ExtendedNode (see notes on extendSourceFile)
 */
export function extendNode(node: Node): ExtendedNode {
  return Object.defineProperty(node, 'localTypeParameters', {
    configurable: true,

    get: function getLocalTypeParams(this: ExtendedNode) {
      let node: ExtendedNode = this;
      while (node) {
        if (Object.getOwnPropertyDescriptors(node).localTypeParameters.value) break;
        node = node.parent;
      }

      return !node ? [] : node.localTypeParameters;
    },

    set: function setLocalTypeParams(this: ExtendedNode, value: string[]) {
      Object.defineProperty(this, 'localTypeParameters', { value });
    }
  })
}

/**
 * Set parents & turn Nodes into ExtendedNode
 *
 * Note:
 *   For performance reasons, we load only a very basic AST without semantic information for our ReferenceWrapper phase
 *   of the File Walker. This method provides the bare minimal extra information on each Node during parsing.
 */
export function extendSourceFile(rootNode: Node) {
  Object.assign(rootNode, <Omit<ExtendedSourceFile, keyof SourceFile>>{
    localTypeParameters: [],
    modified: false
  });

  let parent: Node = rootNode;
  ts.forEachChild(rootNode, visitNode);
  return;

  function visitNode(n: Node): void {
    extendNode(n);

    // walk down setting parents that differ from the parent we think it should be.
    if (n.parent !== parent) {
      n.parent = parent;

      const saveParent = parent;
      parent = n;
      ts.forEachChild(n, visitNode);
      if (ts.hasJSDocNodes(n)) {
        for (const jsDoc of n.jsDoc!) {
          jsDoc.parent = n;
          parent = jsDoc;
          ts.forEachChild(jsDoc, visitNode);
        }
      }
      parent = saveParent;
    }
  }
}
