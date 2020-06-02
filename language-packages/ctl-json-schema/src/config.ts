import { CompileOptions, Package, ParseOptions } from '@crosstype/core';


/* ****************************************************************************************************************** *
 * JsonSchema Config
 * ****************************************************************************************************************** */

export = CtlJsonSchema;

namespace CtlJsonSchema {
  export const active = true;
  export const shortName = 'python';
  export const fullName = 'python';
  export const packageName = 'ctl-python';
  export const optionsConfig = {};
  export const optionsTypes = { CompileOptions: <CompileOptions>{}, ParseOptions: <ParseOptions>{} }
  export const parser = undefined;
  export const compiler = <any>undefined;
}

Package.setupPackage(CtlJsonSchema);
