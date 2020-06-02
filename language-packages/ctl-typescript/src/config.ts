import { CompileOptions, Package, ParseOptions } from '@crosstype/core';


/* ****************************************************************************************************************** *
 * LanguagePackage Config
 * ****************************************************************************************************************** */

export = CtlTypeScript

namespace CtlTypeScript {
  export const active = true;
  export const shortName = 'ts';
  export const fullName = 'typescript';
  export const packageName = 'ctl-typescript';
  export const optionsConfig = {};
  export const optionsTypes = { CompileOptions: <CompileOptions>{}, ParseOptions: <ParseOptions>{} }
  export const parser = <any>undefined;
  export const compiler = undefined;

  export enum SpecificKind {
    Any,
    Unknown,
    Undefined,
    Null,
    ArrowFunction,
    Function
  }
}

Package.setupPackage(CtlTypeScript);
