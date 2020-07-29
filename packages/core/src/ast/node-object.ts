import { Definition, NamedNode, Node, ReferenceNode, SourceFile } from '#ast/node-types';
import { ModifierFlags, NodeFlags, NodeKind, TypeFlags } from '#ast/enums';
import { CompileOptionsSet } from '#options/types';
import { Language } from '#language/language';
import { accForEach, reverseMap } from '@crosstype/common';
import { NodeMap, NodeSet, ReadonlyNodeSet } from '#ast/components';
import { isDefinition, isNamedNode, isNode, isSourceFile } from '#ast/utilities/node-typeguards';
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

  get kindString(): string {
    return NodeKind[this.kind];
  }

  /* ********************************************************* *
   * Documented Methods
   * ********************************************************* */

  getLineage(): Node[] | undefined {
    if (!this.parent) return undefined;
    const seenParents = new NodeSet();

    for (let node = this.parent; node; node = node.parent) {
      if (seenParents.has(node)) throw new Error(`Error, parent chain is broken. Circular reference.`);
      seenParents.add(node);
    }
    return seenParents.toArray();
  }

  getChildren<T extends Node = Node>(deep?: boolean, predicate?: (node: Node) => boolean): NodeSet<T> | undefined {
    const res = new NodeSet<Node>();

    const addChild = (child: Node) => {
      if (!predicate || predicate(child)) res.add(child);
      if (deep) child.getChildren(true, predicate)?.forEach(addChild);
    };
    this.forEachChild(addChild);

    return res.orUndefinedIfEmpty() as NodeSet<T> | undefined;
  }

  forEachChild<T extends Node>(
    this: T,
    cb: <K extends keyof T>(child: Node, parentPropertyKey: K) => void
  ): void {
    const childContainerKeys = (<NodeObject><unknown>this)._metadata.childContainerProperties?.keys() as Iterable<keyof T>;
    if (!childContainerKeys) return;

    for (const propKey of childContainerKeys) {
      const prop = this[propKey] as any as Node | NodeMap<NamedNode> | NodeSet<Node>;
      if (!prop) continue;

      if (isNode(prop)) cb(prop, propKey);
      else prop.forEach((n: Node) => cb(n, propKey));
    }
  }

  findParent<T>(matcher: (node: T) => node is T): T | undefined
  findParent<T>(matcher: (node: T) => unknown): T | undefined
  findParent(matcher: (node: unknown) => boolean): unknown | undefined {
    const seenParents = new NodeSet();
    for (let node = this.parent; node; node = node.parent) {
      if (seenParents.has(node)) throw new Error(`Error, parent chain is broken. Circular reference.`);
      seenParents.add(node);
      if (matcher(node)) return node;
    }
  }

  getNamedParent(name?: string | RegExp): NamedNode | undefined {
    if (!name) return this.findParent(isNamedNode);
    return this.findParent(n =>
      isNamedNode(n) &&
      ((name instanceof RegExp) ? ((typeof n.name === 'string') ? name.test(n.name) : false) : n.name === name)
    );
  }

  getDefinition(): Definition | undefined {
    return this.findParent(isDefinition);
  }

  getSourceFile(): SourceFile | undefined {
    return this.findParent(isSourceFile);
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

    for (const key in this) if (this.hasOwnProperty(key)) delete this[key];
    Object.setPrototypeOf(this, null);
  }

  clone<T extends Node>(this: T, parent: Node | undefined): T {
    return (cloneNode(this) as Node).updateProperties({ parent }) as T;
  }

  replace<T extends Node>(newNode: T, brokenReferenceReplacer?: (node: Node) => Node, reuseMemory?: boolean): T {
    if (reuseMemory) {
      (<Node>newNode).updateProperties({ parent: this.parent });

      for (const key in this) if (this.hasOwnProperty(key)) delete this[key];   // Clear old properties
      Object.defineProperties(this, Object.getOwnPropertyDescriptors(newNode)); // Replace with new

      return this as any;
    } else {
      this.delete(brokenReferenceReplacer);
      return newNode;
    }
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

  /**
   * Cleans up child containing properties & internal references set
   * Removes any non-nodes, sets optional properties that contain empty iterables to undefined
   */
  cleanup() {
    /* Cleanup properties containing children */
    this._metadata.childContainerProperties?.forEach(({ key, optional }) => {
      const item = (<any>this)[key];
      if (item instanceof NodeMap || item instanceof NodeSet) {
        if (optional && !item.size) (<any>this)[key] = void 0;
        else if (item.size) item.prune();
      }
      else if (!isNode(item)) (<any>this)[key] = void 0;
    });

    // Clean references to this
    this._referencesToThis.prune();
  }

  /**
   * Fix node
   * Runs cleanup() and ensures proper parent set on this node and all descendants
   */
  fixup() {
    (function fixNode(node: Node, parent: Node) {
      node.cleanup();
      node.updateProperties({ parent });
      node.getChildren()?.forEach(n => fixNode(n, node));
    })(this, this.parent);
  }


  /* ********************************************************* *
   * Internal Methods
   * ********************************************************* */

  /**
   * Remove this child node from parent
   * @param replacementNode - Optionally, replace reference with another node
   */
  private removeThisFromParent(replacementNode?: Node): void {
    this.parent?.forEachChild((child, parentKey) => {
      if (child === this) {
        if (this.parent[parentKey] === child)
          return this.parent.updateProperties({ [parentKey]: replacementNode });

        const container = this.parent[parentKey] as any;

        if (container instanceof NodeMap) {
          const key = (<NamedNode>child).name;
          if (!replacementNode) container.delete(key);
          else container.set(key!, <NamedNode>replacementNode);
        } else if (container instanceof NodeSet) {
          container.delete(this);
          if (replacementNode) container.add(replacementNode);
        }
      }
    })
  }

  /**
   * Update name on parent containers (called after updating NamedNode's name in order to update the key in NodeMap)
   * @internal
   */
  updateNameOnParentContainer(this: NamedNode & NodeObject): void {
    const newKey = this.name;

    this.parent?.forEachChild((child, parentKey) => {
      if (child === this) {
        const prop = this.parent[parentKey];
        if (prop instanceof NodeMap) {
          const oldKey = reverseMap(prop).get(this);
          if (oldKey !== newKey) {
            prop.delete(oldKey);
            prop.set(newKey, this);
          }
        }
      }
    });

    /* TypeArguments may be associated in the definition. In that case, we update those maps as well */
    if (this.kind === NodeKind.TypeParameterDeclaration) {
      const typeArguments = this.getDefinition()?.typeArguments;
      if (!typeArguments) return;

      [ ...typeArguments.entries() ].forEach(([ key, node ]) => {
        const { association } = node;
        if ((association === this) && (key !== newKey)) {
          typeArguments.delete(key);
          typeArguments.set(<string>newKey, node);
        }
      })
    }
  }
}
