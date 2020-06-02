import { CompileOptions, Package, ParseOptions } from '@crosstype/core';


/* ****************************************************************************************************************** *
 * LanguagePackage Config
 * ****************************************************************************************************************** */

export = CtlPython

namespace CtlPython {
  export const active = false;
  export const shortName = 'python';
  export const fullName = 'python';
  export const packageName = 'ctl-python';
  export const optionsConfig = {};
  export const optionsTypes = { CompileOptions: <CompileOptions>{}, ParseOptions: <ParseOptions>{} }
  export const parser = undefined;
  export const compiler = undefined;
}

Package.setupPackage(CtlPython);
