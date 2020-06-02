import { NamedNode, NamedNodeName, Node } from '#ast/node-types';
import { isNamedNode } from '#ast/utilities/node-typeguards';
import { accForEach } from '@crosstype/system';


/* ****************************************************************************************************************** *
 * Readonly Types
 * ****************************************************************************************************************** */

export type ReadonlyNodeSet<T extends Node> = Omit<NodeSet<T>, Exclude<keyof Set<T>, keyof ReadonlySet<T>>>
export type ReadonlyNodeMap<T extends NamedNode<NamedNodeName>> =
  Omit<NodeMap<T>, Exclude<keyof Map<T['name'], T>, keyof ReadonlyMap<T['name'], T>>>


/* ****************************************************************************************************************** *
 * NodeSet
 * ****************************************************************************************************************** */

/**
 * Array of Nodes with special methods
 */
export class NodeSet<T extends Node> extends Set<T> {
  constructor(nodes?: T[]) {
    super(nodes);
  }

  /* ********************************************************* *
   * Properties
   * ********************************************************* */

  get isEmpty(): boolean {
    return !this.size;
  }

  /* ********************************************************* *
   * Methods
   * ********************************************************* */

  /**
   * Convert to array
   * @param undefinedIfEmpty - If specified, returns undefined if set is empty
   */
  toArray<B>(undefinedIfEmpty?: B): B extends true ? T[] | undefined : T[]
  toArray<B>(undefinedIfEmpty?: B): Node[] | undefined {
    return (undefinedIfEmpty && this.isEmpty) ? void 0 : [ ...this.values() ];
  }

  /**
   * Convert to NodeMap
   * Note: Only includes members which have a name property (NamedNode)
   */
  toNodeMap(): Node extends T ? NodeMap<NamedNode> : NodeMap<Extract<T, NamedNode>>
  toNodeMap(): NodeMap<any> {
    return accForEach(this, new NodeMap<NamedNode>(), (n: Node, acc) => {
      if (isNamedNode(n)) acc.set(n.name, n);
    });
  }

  /* ********************************************************* *
   * Static Methods
   * ********************************************************* */

  static isNodeSet(v: any): v is NodeSet<Node> {
    return v instanceof NodeSet;
  }
}


/* ****************************************************************************************************************** *
 * NodeMap
 * ****************************************************************************************************************** */

/**
 * Array of Nodes with special methods
 */
export class NodeMap<T extends NamedNode<NamedNodeName>> extends Map<T['name'], T> {
  constructor(nodes?: T[] | NodeSet<T>) {
    super();
    if (nodes) for (const node of nodes) this.set(node.name, node);
  }

  /* ********************************************************* *
   * Properties
   * ********************************************************* */

  get isEmpty(): boolean {
    return !this.size;
  }

  /* ********************************************************* *
   * Methods
   * ********************************************************* */

  /**
   * Convert to array of nodes
   * @param undefinedIfEmpty - If specified, returns undefined if set is empty
   */
  toArray<B>(undefinedIfEmpty?: B): B extends true ? T[] | undefined : T[]
  toArray<B>(undefinedIfEmpty?: B): Node[] | undefined {
    return (undefinedIfEmpty && this.isEmpty) ? void 0 : [ ...this.values() ];
  }

  /**
   * Convert to NodeSet
   */
  toNodeSet(): NodeSet<T> {
    return new NodeSet<T>(this.toArray());
  }

  /* ********************************************************* *
   * Static Methods
   * ********************************************************* */

  static isNodeMap<T extends NamedNode>(v: any): v is NodeMap<T> {
    return v instanceof NodeMap;
  }
}
