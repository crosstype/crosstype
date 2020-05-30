import { Compiler } from './compiler';
import { Parser } from './parser';
import { CrossTypeLanguage } from '../language/crosstype-language';
import { Language } from '../language/language';


/* ****************************************************************************************************************** */
// region: Types
/* ****************************************************************************************************************** */

export interface LanguagePackage {
  language: CrossTypeLanguage
  compiler?: Compiler
  parser?: Parser
}

// endregion


/* ****************************************************************************************************************** *
 * Package Namespace
 * ****************************************************************************************************************** */

export namespace Package {

  /* ********************************************************* */
  // region: Utilities
  /* ********************************************************* */

  export function isLanguagePackage(pkg: any): pkg is LanguagePackage {
    return true;
  }

  export function createCompiler(): Compiler {
    return <any>null;
  }

  export function createParser(): Parser {
    return <any>null;
  }

  export function createLanguagePackage(
    languageCode: Language.Code,
    compiler: Compiler | undefined,
    parser: Parser | undefined
  ): LanguagePackage {
    return <any>null;
  }

  // endregion
}
