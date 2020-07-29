import { NamedNode, Node } from '#ast/node-types';
import { isNamedNode, isNode } from '#ast/utilities/node-typeguards';
import { accForEach, mixin } from '@crosstype/common';


/* ****************************************************************************************************************** */
// region: Types
/* ****************************************************************************************************************** */
// The following types are composed using declaration merging (interface, class, and namespace sharing a name)

export interface NodeSet<T extends Node> extends NodeIterable<T>, Set<T> { }

export interface NodeMap<T extends NamedNode> extends NodeIterable<T>, Map<T['name'], T> { }

export interface ReadonlyNodeSet<T extends Node> extends
  Omit<NodeSet<T>, Exclude<keyof Set<T>, keyof ReadonlySet<T>>> { }

export interface ReadonlyNodeMap<T extends NamedNode> extends
  Omit<NodeMap<T>, Exclude<keyof Map<T['name'], T>, keyof ReadonlyMap<T['name'], T>>> { }

// endregion


/* ****************************************************************************************************************** */
// region: Helpers
/* ****************************************************************************************************************** */

function getIterableCreateParam<T extends Node>(cls: typeof NodeMap | typeof NodeSet, nodes: T[] | NodeSet<T> | undefined):
  any[]
{
  if (!nodes) return [];

  const arr = (nodes instanceof NodeSet ? nodes.toArray() : nodes as Node[])
    .filter((i: any) => isNode(i) && ((cls === NodeSet) || isNamedNode(i)));

  return (cls === NodeMap) ? (<NamedNode<any>[]>arr).map(n => [ n.name, n ]) :
         arr;
}

// NOTE: This logic will be cleaned up and changed when parser logic is implemented.
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


/* ****************************************************************************************************************** */
// region: Node Iterable Base (Mixin)
/* ****************************************************************************************************************** */

type MapOrSet = Set<any> | Map<any, any>

/**
 * Mixin for node iterables
 */
abstract class NodeIterable<T extends Node> {
  getValueByIndex(this: MapOrSet, index: number) {
    // noinspection SuspiciousTypeOfGuard
    if (typeof index !== 'number') throw new TypeError(`Index must be a number!`);
    let i = 0;
    for (const item of this.values()) if (i++ === index) return item;
    throw new RangeError(`Index ${index} out of bounds! [0-${i-1}]`);
  }

  get isEmpty(): boolean { return !(<any>this).size }

  /**
   * Convert to array of nodes
   * @param undefinedIfEmpty - If specified, returns undefined if set is empty
   */
  toArray<B extends boolean | undefined = undefined>(undefinedIfEmpty?: B):
    B extends true ? T[] | undefined : T[]
  toArray(this: this & MapOrSet, undefinedIfEmpty?: boolean): Node[] | undefined {
    return (undefinedIfEmpty && this.isEmpty) ? void 0 : [ ...this.values() ];
  }

  /**
   * @returns this or undefined if no members
   */
  orUndefinedIfEmpty(): this | undefined { return !this.isEmpty ? this : void 0 }

  /**
   * Remove invalid (non-node) members
   */
  prune(this: MapOrSet): void {
    if (this instanceof Set) [ ...this ].forEach(n => !isNode(n) && this.delete(n))
    else [ ...this.entries() ].forEach(([k, n]) => !isNode(n) && (<Map<any,any>>this).delete(k));
  }

  /**
   * Find node
   */
  find<U extends Node>(predicate: (node: U) => boolean): U | undefined
  find<U extends Node>(predicate: (node: U) => node is U): U | undefined
  find(predicate: (node: Node) => boolean): Node | undefined {
    return this.toArray()?.find(predicate);
  }

  /**
   * Add a node
   */
  add(node: T): this
  add(this: this & MapOrSet, node: Node): this {
    if (this instanceof Set) Set.prototype.add.call(this, node);
    else this.set((<NamedNode<any>>node).name, node);

    return this;
  }
}

// endregion


/* ****************************************************************************************************************** */
// region: Classes
/* ****************************************************************************************************************** */

@mixin(NodeIterable)
export class NodeSet<T extends Node> extends Set<T> {
  constructor(nodes?: T[]) {
    super(getIterableCreateParam(NodeSet, nodes));
  }

  /**
   * Convert NodeSet to NodeMap
   * Note: Only includes members which have a name property (NamedNode)
   */
  toNodeMap(): Extract<NodeSet.GetNodeType<this>, NamedNode> extends never ? NodeMap<NamedNode> : NodeMap<Extract<NodeSet.GetNodeType<this>, NamedNode>>
  toNodeMap(): NodeMap<any> {
    return accForEach(this, new NodeMap<NamedNode>(), (n: Node, res) => {
      if (isNamedNode(n)) res.set(n.name, n);
    });
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

@mixin(NodeIterable)
export class NodeMap<T extends NamedNode> extends Map<T['name'], T> {
  [idx:number]: any

  constructor(nodes?: T[]) {
    super(getIterableCreateParam(NodeMap, nodes));
  }

  /**
   * Convert NodeMap to NodeSet
   */
  toNodeSet(): NodeSet<T> { return new NodeSet(this.toArray()) as any }

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

// endregion


/* ****************************************************************************************************************** */
// region: Namespace Extensions
/* ****************************************************************************************************************** */

export namespace NodeMap {
  export type GetIndexType<T> = T extends NodeMap<infer U> ? U['name'] : never
  export type GetNodeType<T> = T extends NodeMap<infer U> ? U : never
}

export namespace NodeSet {
  export type GetNodeType<T> = T extends NodeSet<infer U> ? U : never
}

// endregion
