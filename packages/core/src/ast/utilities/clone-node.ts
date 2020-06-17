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
 */
function copyNode(updatedNodes: Map<Node, Node | undefined>, node: Node): Node {
  if (updatedNodes.get(node) !== undefined) return updatedNodes.get(node)!;

  const descriptors = Object.getOwnPropertyDescriptors(node);
  const newNode: Node = Object.create(Object.getPrototypeOf(node));
  const { childContainerProperties } = nodeMetadata[node.kind];

  /* Clone items */
  for (const propKey of Object.keys(descriptors))
    if (descriptors[propKey].value)
      descriptors[propKey].value = cloneItem(descriptors[propKey].value, !!childContainerProperties?.has(propKey));

  Object.defineProperties(newNode, descriptors);
  updatedNodes.set(node, newNode);

  return newNode;

  function cloneItem(item: any, childContainer?: boolean): any {
    /* Handle Node or Node containers */
    if (NodeSet.isNodeSet(item)) {
      const nodes = item.toArray();
      return childContainer ? new NodeSet(nodes.map(node => copyNode(updatedNodes, node))) : new NodeSet(nodes);
    }
    if (NodeMap.isNodeMap(item)) {
      const nodes = item.toArray();
      return childContainer ? new NodeMap(nodes.map(node => copyNode(updatedNodes, node)) as NamedNode[]) : new NodeMap(nodes);
    }
    if (isNode(item)) return childContainer ? copyNode(updatedNodes, item) : item;

    /* Handle others */
    const res = ((item === null) || (typeof item !== 'object')) ? item :     // No clone for non-objects
                (Array.isArray(item)) ? item.map(item => cloneItem(item)) :  // Clone array items
                Object.create(Object.getPrototypeOf(item), Object.getOwnPropertyDescriptors(item));  // Clone object

    /* Clone Map / Set items */
    if (item instanceof Map) [ ...item.entries() ].forEach(([ k, v ]) => res.set(cloneItem(k), cloneItem(v)));
    if (item instanceof Set) [ ...item.values() ].forEach(v => res.add(cloneItem(v)));

    return res;
  }
}

// endregion


/* ****************************************************************************************************************** */
// region: Utilities
/* ****************************************************************************************************************** */

export function cloneNode<T extends Node>(node: T): T {
  const updatedNodes = new Map</* Old */ Node, /* New */ Node>();
  copyNode(updatedNodes, node);

  /* Update parent and references */
  for (const newNode of [ ...updatedNodes.values() ] as Node[]) {
    if (newNode.parent) newNode.updateProperties({ parent: updatedNodes.get(newNode.parent) });
    if (isReferenceNode(newNode) && updatedNodes.has(newNode.target))
      newNode.updateProperties({ target: updatedNodes.get(newNode.target) as Declaration });
  }

  return updatedNodes.get(node)! as T;
}

// endregion

