/* ****************************************************************************************************************** */
// region: Helpers
/* ****************************************************************************************************************** */

function loadPackage<L extends { promise: () => Promise<any>, module: string }>(l: L):
  // @formatter:off
  ReturnType<L['promise']> extends PromiseLike<infer U> ?
    boolean extends (U extends any ? true : false) ? never : Omit<U, 'default'> :
  never
  // @formatter:on
function loadPackage({ module }: { module: string }): any {
  try {
    return require(module);
  } catch(e) {
    return void 0;
  }
}

// endregion


/* ****************************************************************************************************************** */
// region: Language Imports
/* ****************************************************************************************************************** */
// We're doing some trickery here to dynamically load optional dependency types. If not found, the type will be never.

const CtlTypeScript = {
  // @ts-ignore
  promise: () => import('@crosstype/ctl-typescript'),
  module: '@crosstype/ctl-typescript'
};
const CtlPython = {
  // @ts-ignore
  promise: () => import('@crosstype/ctl-python'),
  module: '@crosstype/ctl-python'
};
const CtlJsonSchema = {
  // @ts-ignore
  promise: () => import('@crosstype/ctl-json-schema'),
  module: '@crosstype/ctl-json-schema'
};

export const TypeScript = loadPackage(CtlTypeScript);
export const Python = loadPackage(CtlPython);
export const JsonSchema = loadPackage(CtlJsonSchema);

export type TypeScript = typeof TypeScript
export type Python = typeof Python
export type JsonSchema = typeof JsonSchema

// endregion
