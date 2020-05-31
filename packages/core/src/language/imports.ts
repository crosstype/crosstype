import { LanguagePackage } from '#package';


/* ****************************************************************************************************************** */
// region: Helpers
/* ****************************************************************************************************************** */
// @formatter:off

function loadPackage<F extends () => Promise<any>>(fn: F):
  Promise<
    ReturnType<F> extends PromiseLike<infer U> ?
      boolean extends (U extends any ? true : false) ? never : Omit<U, 'default'> :
    never
  >
function loadPackage(fn: () => Promise<LanguagePackage>): Promise<any> {
  return fn().then((pkg) => pkg, () => void 0);
}

// @formatter:on
// endregion


/* ****************************************************************************************************************** */
// region: Language Imports
/* ****************************************************************************************************************** */
// We're doing some trickery here to dynamically load optional dependency types. If not found, the type will be never

// @ts-ignore
const CtlTypeScript = () => import('@crosstype/ctl-typescript');
// @ts-ignore
const CtlPython = () => import('@crosstype/ctl-python');
// @ts-ignore
const CtlJsonSchema = () => import('@crosstype/ctl-json-schema');

export const TypeScript = await loadPackage(CtlTypeScript);
export const Python = await loadPackage(CtlPython);
export const JsonSchema = await loadPackage(CtlJsonSchema);

export type TypeScript = typeof TypeScript
export type Python = typeof Python
export type JsonSchema = typeof JsonSchema

// endregion
