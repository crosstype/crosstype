import { NodeMap, NodeSet } from '#ast/components';
import { NamedNode, Node } from '#ast/node-types';
import { isNode, isReferenceNode } from '#ast/utilities/node-typeguards';
import { nodeMetadata } from '#ast/node-metadata';
import { Declaration } from '#ast/node-aliases';


/* ****************************************************************************************************************** */
// region: Helpers
/* ****************************************************************************************************************** */

/**
 * Clones node (if not already in nodeMap) & updates nodeMap value for `node` with cloned node
 * Note: Added to cloneNode to allow direct testing
 * @internal
 */
cloneNode.copyNode = function(updatedNodes: Map<Node, Node | undefined>, node: Node): Node {
  if (updatedNodes.get(node) !== undefined) return updatedNodes.get(node)!;

  const descriptors = Object.getOwnPropertyDescriptors(node);
  const newNode: Node = Object.create(Object.getPrototypeOf(node));
  const { childContainerProperties } = nodeMetadata[node.kind];

  /* Clone items */
  for (const propKey of Object.keys(descriptors))
    if (descriptors[propKey].value)
      descriptors[propKey].value = cloneNode.cloneItem(updatedNodes, descriptors[propKey].value, !!childContainerProperties?.has(propKey));

  Object.defineProperties(newNode, descriptors);
  updatedNodes.set(node, newNode);

  return newNode;
}

/**
 * Clones individual item
 * Note: Added to cloneNode to allow direct testing
 * @internal
 */
cloneNode.cloneItem = function(updatedNodes: Map<Node, Node | undefined>, item: any, childContainer?: boolean): any {
  /* Handle Node or Node containers */
  if (NodeSet.isNodeSet(item)) {
    const nodes = item.toArray();
    return childContainer ? new NodeSet(nodes.map(node => cloneNode.copyNode(updatedNodes, node))) : new NodeSet(nodes);
  }
  if (NodeMap.isNodeMap(item)) {
    const nodes = item.toArray();
    return childContainer ? new NodeMap(nodes.map(node => cloneNode.copyNode(updatedNodes, node)) as NamedNode[]) : new NodeMap(nodes);
  }
  if (isNode(item)) return childContainer ? cloneNode.copyNode(updatedNodes, item) : item;

  /* Handle others */
  return (
    // No clone for non-objects
    ((item === null) || (typeof item !== 'object')) ? item :
    // Clone Array
    (Array.isArray(item)) ? item.map(item => cloneNode.cloneItem(updatedNodes, item)) :
    // Clone Map
    (item instanceof Map) ? new Map([ ...item.entries() ].map(([ k, v ]) => [ cloneNode.cloneItem(updatedNodes, k), cloneNode.cloneItem(updatedNodes, v) ])) :
    // Clone Set
    (item instanceof Set) ? new Set([ ...item ].map(setItem => cloneNode.cloneItem(updatedNodes, setItem))) :
    // Clone Object (methods / accessors may not work properly if custom constructor logic required to initialize)
    Object.create(Object.getPrototypeOf(item), Object.getOwnPropertyDescriptors(item))
  );
}

// endregion


/* ****************************************************************************************************************** */
// region: Utility
/* ****************************************************************************************************************** */

export function cloneNode<T extends Node>(node: T): T {
  const updatedNodes = new Map</* Old */ Node, /* New */ Node>();
  cloneNode.copyNode(updatedNodes, node);

  /* Update parent and references */
  for (const newNode of [ ...updatedNodes.values() ] as Node[]) {
    if (newNode.parent) newNode.updateProperties({ parent: updatedNodes.get(newNode.parent) });
    if (isReferenceNode(newNode) && updatedNodes.has(newNode.target))
      newNode.updateProperties({ target: updatedNodes.get(newNode.target) as Declaration });
  }

  return updatedNodes.get(node)! as T;
}

// endregion

