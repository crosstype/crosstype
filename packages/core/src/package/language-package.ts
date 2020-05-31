import { OptionsConfigSet, OptionsTypesSet } from '../types';
import { Parser } from './parser';
import { Compiler } from './compiler';


/* ****************************************************************************************************************** */
// region: Types
/* ****************************************************************************************************************** */

export interface LanguagePackage {
  active: boolean
  shortName: string
  fullName: string
  packageName: string
  SpecificKind?: any
  optionsConfig: OptionsConfigSet
  optionsTypes: OptionsTypesSet
  parser?: Parser
  compiler?: Compiler
}

// endregion


/* ****************************************************************************************************************** */
// region: Class
/* ****************************************************************************************************************** */

/**
 * This is a class, because we may add methods later
 */
export class LanguagePackage {
  constructor(config: LanguagePackage) {
    Object.assign(this, config);
  }
}

// endregion

