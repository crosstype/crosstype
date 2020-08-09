import { EnumLike, hasKeys } from '@crosstype/common';
import { OptionsConfig } from '../types';
import { Compiler, CompilerFunction } from './compiler';
import { Parser, ParserFunction } from './parser';


/* ****************************************************************************************************************** */
// region: Type
/* ****************************************************************************************************************** */

export interface LanguagePackage extends LanguagePackage.Config, LanguagePackage.Types {}

// endregion


/* ****************************************************************************************************************** *
 * Namespace
 * ****************************************************************************************************************** */

export namespace LanguagePackage {
  /* ********************************************************* */
  // region: Types
  /* ********************************************************* */

  export interface Config {
    name: string
    experimental?: boolean
    shortName: string
    compiler?: Compiler
    parser?: Parser
    optionsConfig: { compileOptions?: OptionsConfig, parseOptions?: OptionsConfig }
    specialKind?: EnumLike
  }

  export interface Types {
    CompileOptions?: Compiler.OptionsBase
    CompileHooks?: Compiler.HooksBase
    ParseOptions?: Parser.OptionsBase
    ParseHooks?: Parser.HooksBase
  }

  // endregion


  /* ********************************************************* */
  // region: Utilities
  /* ********************************************************* */

  export function createLanguagePackage<TConfig extends Config, TTypes extends Types>(config: TConfig): TConfig & TTypes
  {
    return Object.assign({}, config) as TConfig & TTypes;
  }

  /**
   * Create a compiler for use with LanguagePackage
   */
  export function createCompiler<T extends CompilerFunction>(pkg: LanguagePackage, compilerFn: T): Compiler<T>
  {
    return Object.assign(compilerFn.bind(<any>void 0), { pkg }) as Compiler<T>;
  }

  /**
   * Create a compiler for use with LanguagePackage
   */
  export function createParser<T extends ParserFunction>(pkg: LanguagePackage, parserFn: T): Parser<T> {
    return Object.assign(parserFn, { pkg }) as Parser<T>;
  }

  // endregion


  /* ********************************************************* */
  // region: Internal Utilities
  /* ********************************************************* */

  /**
   * @internal
   */
  export const isLanguagePackage = (v: any): v is LanguagePackage =>
    hasKeys(v, [ 'name', 'shortName', 'optionsConfig', 'optionsTypes' ]);

  /**
   * @internal
   */
  export const isCompiler = (v: any): v is Compiler => (typeof v === 'function') && isLanguagePackage(v.pkg);

  /**
   * @internal
   */
  export const isParser = (v: any): v is Parser => (typeof v === 'function') && isLanguagePackage(v.pkg);

  // endregion
}
