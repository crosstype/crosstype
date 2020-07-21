import {
  createClassDeclaration, createDefinition, createEnumDeclaration, createEnumMemberDeclaration,
  createFunctionDeclaration, createInterfaceDeclaration, createMethodDeclaration, createObjectNode,
  createPropertyDeclaration, createTypeDeclaration, createTypeParameterDeclaration, createVariableDeclaration,
  findTargetDeclarationsByPath, isClassDeclaration, isEnumDeclaration, isInterfaceDeclaration, isRootDeclaration,
  isTypeDeclaration, isTypeParameterDeclaration, isVariableDeclaration
} from '#ast/utilities';
import { NodeMap, NodeSet } from '#ast/components';
import { Declaration, RootDeclaration } from '#ast/node-aliases';


/* ****************************************************************************************************************** *
 * Node
 * ****************************************************************************************************************** */

// Object property structure (we clone this)
const objectProp = createPropertyDeclaration({
  name: '1_Prop',
  value: createObjectNode({
    members: NodeMap.from([
      createPropertyDeclaration({
        name: '2_Prop',
        value: createObjectNode({
          members: NodeMap.from([
            createMethodDeclaration({
              name: '3_Method',
              signatures: <any>null
            })
          ])
        })
      }),
      createMethodDeclaration({
        name: '2_Method',
        signatures: <any>null
      })
    ])
  })
});

/* Declaration Nodes */
const classNode = createClassDeclaration({ name: 'Def1', members: <any>void 0 });
const interfaceNode = createInterfaceDeclaration({ name: 'Def1', members: <any>void 0 });
const enumNode = createEnumDeclaration({ name: 'Def1', members: <any>void 0 });
const typeNode = createTypeDeclaration({ name: 'Def1', value: <any>void 0 });
const variableNode = createVariableDeclaration({ name: 'Def1', value: <any>void 0 });
const functionNode = createFunctionDeclaration({ name: 'Def1', signatures: <any>void 0 });
const typeParameterNode = createTypeParameterDeclaration({ name: 'TypeDef1', constraint: <any>void 0 });

const declarations = [ classNode, interfaceNode, typeNode, enumNode, variableNode, functionNode, typeParameterNode ];

/* Setup cloned properties */
declarations.forEach(d => {
  const clone = objectProp.clone(void 0);
  const [ key, value ] =
    (isTypeDeclaration(d) || isVariableDeclaration(d)) ? [ 'value', createObjectNode({ members: new NodeMap([ clone ]) }) ] :
    isTypeParameterDeclaration(d) ? [ 'constraint', createObjectNode({ members: new NodeMap([ clone ]) }).updateProperties({ parent: typeParameterNode }) ] :
    isEnumDeclaration(d) ? [ 'members', new NodeMap([ createEnumMemberDeclaration({ name: 'EnumMember' }) ]) ] :
    (isClassDeclaration(d) || isInterfaceDeclaration(d)) ? [ 'members', new NodeMap([ clone ]) ] :
      [ void 0, void 0 ];

  if (!key) return;
  d.updateProperties({ [key!]: value! });
});

/* Definition Node */
const primaryDefinition = createDefinition({
  name: 'Def1',
  primary: true,
  declarations: new NodeSet(declarations.filter(d => !isTypeParameterDeclaration(d)) as RootDeclaration[])
});


/* ****************************************************************************************************************** *
 * Config
 * ****************************************************************************************************************** */

const multiLevelDecs = {
  'Interface': isInterfaceDeclaration,
  'Class': isClassDeclaration,
  'Type': isTypeDeclaration,
  'Variable': isVariableDeclaration,
}


/* ****************************************************************************************************************** *
 * Tests
 * ****************************************************************************************************************** */

describe(`Node Util -> findTargetDeclarationsByPath()`, () => {
  let definition: typeof primaryDefinition;
  describe(`Multi-level Root Declarations`, () => {
    let res: Map<RootDeclaration, Declaration>;
    beforeAll(() => {
      definition = primaryDefinition.clone(void 0);
      res = new Map(findTargetDeclarationsByPath(definition, [ 'Def1', '1_Prop', '2_Prop', '3_Method' ])!.map(
        dec => [ dec.findParent(isRootDeclaration)!, dec ]
      ));
    });

    test(`Returns correct target declarations`, () => {
      expect(res.size).toBe(Object.keys(multiLevelDecs).length);
      res.forEach(dec => dec.name === '3_Method')
    });

    test.each(Object.entries(multiLevelDecs))(`Has Root Declaration: %s`, (label, predicate) => {
      expect([ ...res.keys() ].find(predicate)).not.toBeUndefined();
    });
  });

  test(`Finds multi-level property on TypeParameter`, () => {
    const res = findTargetDeclarationsByPath(typeParameterNode, [ 'TypeDef1', '1_Prop', '2_Prop', '3_Method' ])![0];
    expect(res).not.toBeUndefined();
    expect(res.name).toBe('3_Method');
    expect(res.findParent(isTypeParameterDeclaration)).toBe(typeParameterNode);
  });

  test(`Finds enum member`, () => {
    const res = findTargetDeclarationsByPath(definition, [ 'Def1', 'EnumMember' ])![0];
    expect(res).not.toBeUndefined();
    expect(res.name).toBe('EnumMember');
  });

  test(`Single path returns all declarations`, () => {
    const res = findTargetDeclarationsByPath(definition, [ 'Def1' ]);
    expect(res).toEqual(expect.arrayContaining(primaryDefinition.declarations.toArray()));
    expect(res).toHaveLength(primaryDefinition.declarations.size);
  });

  test(`Priority order is respected`, () => {
    const priority_predicates = findTargetDeclarationsByPath.priority;
    const priority_predicates_rev = priority_predicates.slice().reverse();
    const res = findTargetDeclarationsByPath(definition, [ 'Def1' ])!;
    const res_rev = findTargetDeclarationsByPath(definition, [ 'Def1' ], priority_predicates_rev)!;

    res.forEach((node, i) => expect(priority_predicates[i](node)).toBeTruthy());
    res_rev.forEach((node, i) => expect(priority_predicates_rev[i](node)).toBeTruthy());
  });
});
