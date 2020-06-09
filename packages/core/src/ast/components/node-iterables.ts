import { NamedNode, Node } from '#ast/node-types';
import { isNamedNode, isNode } from '#ast/utilities/node-typeguards';
import { accForEach } from '@crosstype/system';


/* ****************************************************************************************************************** */
// region: Helpers
/* ****************************************************************************************************************** */

const getValidNodes = (arr: any) => arr?.filter((i: any) => isNode(i));

function createFrom<T extends { new(nodes?: Node[]): any } | { new(nodes?: NamedNode[]): any }>
(cls: T, args: IArguments): InstanceType<T> {
  if (!args[0]) return new cls();

  // let context: TypeWalkerContext | undefined;
  let mapFn: (v: any, k: number) => any;
  let iterable: Iterable<any> | Array<any> | undefined;
  let items: any[];
  // if (isTypeWalkerContext(arguments[0])) {
  //   context = arguments[0];
  //   iterable = arguments[1];
  //   mapFn = arguments[2];
  // } else {
  iterable = args[0];
  mapFn = args[1];
  // }

  let resNodes: Node[] | undefined;
  if (iterable) {
    items = Array.from(iterable, mapFn);
    resNodes = items.map(/* context?.visit || */ (n => n));
  }

  return new cls(<any>resNodes);
}

// endregion

/* ****************************************************************************************************************** *
 * Readonly Types
 * ****************************************************************************************************************** */

export type ReadonlyNodeSet<T extends Node> = Omit<NodeSet<T>, Exclude<keyof Set<T>, keyof ReadonlySet<T>>>
export type ReadonlyNodeMap<T extends NamedNode> =
  Omit<NodeMap<T>, Exclude<keyof Map<T['name'], T>, keyof ReadonlyMap<T['name'], T>>>


/* ****************************************************************************************************************** *
 * NodeSet
 * ****************************************************************************************************************** */

/**
 * NodeSet is an iterable collection of nodes
 */
export class NodeSet<T extends Node> extends Set<T> {
  constructor(nodes?: T[]) {
    super(getValidNodes(nodes));
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

  /**
   * @returns Current set or undefined if no elements inside
   */
  orUndefinedIfEmpty(): NodeSet<T> | undefined {
    return this.isEmpty ? this : void 0;
  }

  /**
   * Remove invalid (non-node) members
   */
  prune(): void {
    [ ...this ].forEach(n => !isNode(n) && this.delete(n));
  }

  /**
   * Find member
   */
  find(predicate: (node: T) => boolean): T | undefined
  find(predicate: <T>(node: T) => node is T): T | undefined
  find(predicate: (node: T) => boolean): T | undefined {
    return this.toArray().find(predicate);
  }


  /* ********************************************************* *
   * Static Methods
   * ********************************************************* */

  static isNodeSet(v: any): v is NodeSet<Node> {
    return v instanceof NodeSet;
  }

  /* @formatter:off */
  /**
   * Create NodeSet from nodes (iterable of Node)
   */
  static from<R extends Node>(nodes: Iterable<R | undefined> | ArrayLike<R | undefined> | undefined): NodeSet<R>
  /**
   * Create NodeSet -> uses nodes returned by Map function (performed on iterable)
   */
  static from<R extends Node, T = any>
  (
    iterable: Iterable<T | undefined> | ArrayLike<T | undefined> | undefined,
    mapFn: (v: T, k: number) => R | undefined
  ): NodeSet<R>
  static from(): NodeSet<Node>
  /* @formatter:on */
  {
    return createFrom(NodeSet, arguments);
  }
}


/* ****************************************************************************************************************** *
 * NodeMap
 * ****************************************************************************************************************** */

/**
 * NodeMap is an iterable collection of nodes which all have names associated
 */
export class NodeMap<T extends NamedNode> extends Map<T['name'], T> {
  constructor(nodes?: T[] | NodeSet<T>) {
    super(getValidNodes(nodes));
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
  toArray<B>(undefinedIfEmpty?: B): Node[] | undefined | Array<any> {
    return (undefinedIfEmpty && this.isEmpty) ? void 0 : [ ...this.values() ];
  }

  /**
   * Convert to NodeSet
   */
  toNodeSet(): NodeSet<T> {
    return new NodeSet<T>(this.toArray());
  }

  /**
   * @returns Current set or undefined if no elements inside
   */
  orUndefinedIfEmpty(): NodeMap<T> | undefined {
    return this.isEmpty ? this : void 0;
  }

  /**
   * Remove invalid (non-node) members
   */
  prune(): void {
    [ ...this.entries() ].forEach(([ key, n ]) => !isNode(n) && this.delete(key));
  }

  /**
   * Find member
   */
  find(predicate: (node: Node) => boolean): T | undefined
  find<U extends Node>(predicate: (node: Node) => node is U): U | undefined
  find(predicate: (node: T) => boolean): T | undefined {
    return this.toArray().find(predicate);
  }

  /* ********************************************************* *
   * Static Methods
   * ********************************************************* */

  static isNodeMap<T extends NamedNode>(v: any): v is NodeMap<T> {
    return v instanceof NodeMap;
  }

  /* @formatter:off */
  /**
   * Create NodeMap from nodes (iterable of Node)
   */
  static from<R extends NamedNode>(nodes: Iterable<R | undefined> | ArrayLike<R | undefined> | undefined): NodeMap<R>
  /**
   * Create NodeMap -> uses nodes returned by Map function (performed on iterable)
   */
  static from<R extends NamedNode, T = any>
  (
    iterable: Iterable<T | undefined> | ArrayLike<T | undefined> | undefined,
    mapFn: (v: T, k: number) => R | undefined
  ): NodeMap<R>
  static from(): NodeMap<NamedNode>
  /* @formatter:on */
  {
    return createFrom(NodeMap, arguments);
  }
}

export namespace NodeMap {
  export type GetKeyType<T> = T extends NodeMap<infer U> ? U['name'] : never
}
