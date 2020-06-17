import { DefinitionNode, NamedNode, Node, ReferenceNode, SourceFileNode } from '#ast/node-types';
import { ModifierFlags, NodeFlags, NodeKind, TypeFlags } from '#ast/enums';
import { CompileOptionsSet } from '#options/types';
import { Language } from '#language/language';
import { accForEach } from '@crosstype/system';
import { NodeMap, NodeSet, ReadonlyNodeSet } from '#ast/components';
import { isDefinitionNode, isNamedNode, isNode, isSourceFileNode } from '#ast/utilities/node-typeguards';
import { cloneNode } from '#ast/utilities/clone-node';
import { NodeMetadata, NodeOrigin } from '#ast/shared-types';
import { nodeMetadata } from '#ast/node-metadata';


/* ****************************************************************************************************************** *
 * NodeObject
 * ****************************************************************************************************************** */

export class NodeObject implements Node {
  public readonly id!: number
  public readonly parent: Node
  public readonly flags: NodeFlags
  public readonly typeFlags: TypeFlags
  public readonly kind: NodeKind
  public readonly origin: NodeOrigin // May be undefined if node was created manually, but we don't want to require boom
  public readonly modifiers: ModifierFlags
  public readonly compileOptions: CompileOptionsSet
  private _metadata: NodeMetadata
  public _referencesToThis: NodeSet<ReferenceNode>

  constructor(kind: NodeKind, origin: NodeOrigin | undefined, compileOptions: CompileOptionsSet | undefined) {
    this.parent = undefined!;
    this.flags = NodeFlags.None;
    this.typeFlags = TypeFlags.None;
    this.kind = kind;
    this.origin = origin!;
    this.modifiers = ModifierFlags.None;
    this.compileOptions = compileOptions ||
      accForEach(Language.CompilerLanguages, <Record<string, any>>{}, ({ shortName }, acc) => acc[shortName] = {}) as CompileOptionsSet;

    this._referencesToThis = new NodeSet();
    this._metadata = nodeMetadata[kind];
  }

  /* ********************************************************* *
   * Documented Methods
   * ********************************************************* */

  getLineage(): Node[] | undefined {
    if (!this.parent) return undefined;

    const res: Node[] = [];
    for (let node = this.parent; node; node = node.parent) res.push(node);
    return res;
  }

  getChildren<T extends Node = Node>(deep?: boolean, predicate?: (node: Node) => boolean): NodeSet<T> | undefined {
    const res = new NodeSet<Node>();
    this.forEachChild(child => {
      if (!predicate || predicate(child)) res.add(child);
      if (deep) child.getChildren(true, predicate);
    });

    return res.orUndefinedIfEmpty() as NodeSet<T> | undefined;
  }

  forEachChild<T extends Node>(
    this: T,
    cb: <K extends keyof T>(child: Node, parentPropertyKey: K, nodeMapKey?: NodeMap.GetKeyType<T[K]>) => void
  ): void {
    const childContainerKeys = (<NodeObject><unknown>this)._metadata.childContainerProperties?.keys() as Iterable<keyof T>;
    if (!childContainerKeys) return;

    for (const propKey of childContainerKeys) {
      const prop = this[propKey];
      if (isNode(prop)) cb(prop, propKey);
      else if (NodeSet.isNodeSet(prop)) prop.forEach(n => cb(n, propKey));
    }
  }

  findParent<T extends Node = Node>(matcher: (node: Node) => boolean): T | undefined {
    for (let node = this.parent; node; node = node.parent)
      if (matcher(node)) return node as T;
  }

  getNamedParent(name?: string | RegExp): NamedNode | undefined {
    return this.findParent(isNamedNode);
  }

  getDefinition(): DefinitionNode | undefined {
    return this.findParent(isDefinitionNode);
  }

  getSourceFile(): SourceFileNode | undefined {
    return this.findParent(isSourceFileNode);
  }

  delete(brokenReferenceReplacer?: (node: Node) => Node) {
    this._referencesToThis.forEach(ref => {
      ref.target = undefined!;

      // See if it can resolve a new target, otherwise call brokenReferenceReplacer
      if (!ref.target && brokenReferenceReplacer) {
        const newNode = brokenReferenceReplacer(ref);
        if (newNode !== ref) ref.replace(newNode);
      }
    });

    this.removeThisFromParent();
    this.getChildren(/* deep */ true)?.forEach(n => n.delete(brokenReferenceReplacer));

    Object.setPrototypeOf(this, null);
    for (const key in this) if (this.hasOwnProperty(key)) delete this[key];
  }

  clone<T extends Node>(this: T, parent: Node | undefined): T {
    return cloneNode(this);
  }

  replace<T extends Node>(newNode: T, brokenReferenceReplacer?: (node: Node) => Node, reuseMemory?: boolean): T {
    this.removeThisFromParent(/* replacementNode */ newNode);
    this.getChildren(/* deep */ true)?.forEach(n => n.delete(brokenReferenceReplacer));

    if (reuseMemory) {
      (<Node>newNode).updateProperties({ parent: this.parent });

      for (const key in this) if (this.hasOwnProperty(key)) delete this[key];  // Clear old properties
      Object.setPrototypeOf(this, Object.getPrototypeOf(newNode));             // Replace prototype
      Object.assign(this, newNode);                                            // Copy new properties

      return this as any;
    }

    this.delete(brokenReferenceReplacer);
    return newNode;
  }

  compile<T extends Language.Names>(language: T, options?: Language.GetLanguage<T>['optionsTypes']['CompileOptions']): string {
    // TODO after compiler structure built
    return '';
  }

  getReferencesToThisNode(): ReadonlyNodeSet<ReferenceNode> {
    return this._referencesToThis;
  }

  /* ********************************************************* *
   * Undocumented Methods
   * ********************************************************* */

  updateProperties<T extends Node>(this: T, props: { [P in keyof T]?: T[P] }): T {
    return Object.assign(this, props) as T;
  }

  cleanup() {
    /* Cleanup properties containing children */
    this._metadata.childContainerProperties?.forEach(({ key, optional }) => {
      const item = (<any>this)[key];
      if (NodeMap.isNodeMap(item) || NodeSet.isNodeSet(item)) {
        if (optional && !item.size) (<any>this)[key] = void 0;
        item.prune();
      } else if (optional && !isNode(item)) (<any>this)[key] = void 0;
    });

    // Clean references to this
    this._referencesToThis.prune();
  }


  /* ********************************************************* *
   * Internal Methods
   * ********************************************************* */

  /**
   * Remove this child node from parent
   * @param replacementNode - Optionally, replace reference with another node
   */
  private removeThisFromParent(replacementNode?: Node): void {
    this.parent.forEachChild((child, parentKey, nodeMapKey) => {
      if (child === this) {
        if (this.parent[parentKey] === child)
          return this.parent.updateProperties({ [parentKey]: replacementNode });

        const container = this.parent[parentKey];

        if (NodeMap.isNodeMap(container)) {
          if (!replacementNode) container.delete(nodeMapKey!);
          else container.set(nodeMapKey!, <NamedNode>replacementNode);
        } else if (NodeSet.isNodeSet(container)) {
          container.delete(this);
          if (replacementNode) container.add(replacementNode);
        }
      }
    })
  }
}
