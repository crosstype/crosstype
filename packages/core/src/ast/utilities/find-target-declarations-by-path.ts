import { Definition, EnumMemberDeclaration, NodeIndex, ObjectLikeMember, TypeParameterDeclaration } from '#ast';
import { Declaration, RootDeclaration } from '#ast/node-aliases';
import {
  isClassDeclaration, isDefinition, isEnumDeclaration, isFunctionDeclaration, isInterfaceDeclaration, isObjectLikeNode,
  isPropertyDeclaration, isTypeDeclaration, isTypeParameterDeclaration, isVariableDeclaration
} from '#ast/utilities/node-typeguards';
import { NodeMap } from '#ast/components';
import { accForEach } from '@crosstype/system';


/* ****************************************************************************************************************** */
// region: Config
/* ****************************************************************************************************************** */

findTargetDeclarationsByPath.priority = [
  isInterfaceDeclaration, isClassDeclaration, isTypeDeclaration, isVariableDeclaration, isEnumDeclaration,
  isFunctionDeclaration
];

// endregion

/* ****************************************************************************************************************** *
 * General Node Helpers
 * ****************************************************************************************************************** */

/**
 * @internal
 */
export function findTargetDeclarationsByPath(
  targetBase: Definition | TypeParameterDeclaration,
  paths: NodeIndex[],
  priority = findTargetDeclarationsByPath.priority
): Declaration[] | undefined {
  if (targetBase.name !== paths[0]) return void 0;

  const matches = new Map<RootDeclaration | TypeParameterDeclaration, Declaration>();

  /* Look for matches */
  const declarations = isDefinition(targetBase) ? targetBase.declarations.toArray() : [ targetBase ];
  if (paths.length === 1) declarations.forEach((d: RootDeclaration | TypeParameterDeclaration) => matches.set(d, d));
  else {
    // Iterate all declarations, looking for matches
    declarationLoop:
      for (const declaration of declarations) {
        /* Get applicable members NodeMap */
        // @formatter:off
        let members: NodeMap<ObjectLikeMember | EnumMemberDeclaration> | undefined =
          /* TypeDeclaration, VariableDeclaration with ObjectLikeNode value */
          (
            (isTypeDeclaration(declaration) || isVariableDeclaration(declaration)) && isObjectLikeNode(declaration.value)
          ) ? declaration.value.members :
            /* TypeParameterDeclaration with ObjectLikeNode constraint */
          (
            isTypeParameterDeclaration(declaration) && declaration.constraint && isObjectLikeNode(declaration.constraint)
          ) ? declaration.constraint.members :
            /* EnumDeclaration, ClassDeclaration, InterfaceDeclaration */
          (
            isEnumDeclaration(declaration) || isClassDeclaration(declaration) || isInterfaceDeclaration(declaration)
          ) ? declaration.members :
          void 0;
        // @formatter:on

        if (!members) continue;

        /* Check members */
        let node: ObjectLikeMember | EnumMemberDeclaration | undefined;
        for (let i = 1; i < paths.length; i++) {
          node = members.get(paths[i]);
          if (!node) continue declarationLoop;

          // If last key matches, it's an acceptable match
          if (i === (paths.length - 1)) {
            matches.set(declaration, node);
            continue declarationLoop;
          }
          // If more keys, continue looking if node can have sub-keys (property declarations with object-like value)
          else if (isPropertyDeclaration(node) && isObjectLikeNode(node.value)) members = node.value.members;
        }
      }
  }

  /* Handle single or no matches */
  if (!matches.size) return void 0;
  if (matches.size === 1) return [ ...matches.values() ];

  /* Prioritize multiple matches & return highest priority */
  const matchArray = [ ...matches.entries() ];
  return accForEach(priority, <Declaration[]>[], (predicate, res) => {
    const item = matchArray.find(([ root ]) => predicate(root))?.[1];
    if (item) res.push(item);
  });
}
