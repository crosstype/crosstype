import { Node, SourceFile } from '#ast';
import { Language } from '#language/language';
import { CrossTypeHost } from './host';
import { LanguagePackage } from './language-package';
import { NullableJsonValue } from '@crosstype/common';


/* ****************************************************************************************************************** */
// region: Type
/* ****************************************************************************************************************** */

export interface CompilerFunction {
  /**
   * Compile multiple output files
   */
  (
    files: SourceFile[],
    options?: Compiler.OptionsBase,
    hooks?: Compiler.HooksBase,
    host?: CrossTypeHost
  ): Map<SourceFile, string>
  /**
   * Compile multiple output files
   */
  (
    node: Node,
    options?: Compiler.OptionsBase,
    hooks?: Compiler.HooksBase,
    host?: CrossTypeHost
  ): string
}

export type Compiler<T extends CompilerFunction = CompilerFunction> = T & {
  pkg: LanguagePackage
}

// endregion


/* ****************************************************************************************************************** *
 * Namespace
 * ****************************************************************************************************************** */

export namespace Compiler {
  /* ********************************************************* */
  // region: Types
  /* ********************************************************* */

  export type OptionsBase = Record<string, NullableJsonValue>
  export interface HooksBase {
    [key:string]: NullableJsonValue
    // universal hooks here
  }

  export type AvailableLanguages = Language.CompilerLanguages
  export type AvailableOptions = { [K in AvailableLanguages['shortName']]: Language.GetLanguage<K>['CompileOptions'] }
  export type AvailableHooks = { [K in AvailableLanguages['shortName']]: Language.GetLanguage<K>['CompileHooks'] }

  // endregion


  /* ********************************************************* */
  // region: Utilities
  /* ********************************************************* */

  /**
   * Compile SourceFiles
   * @param languages - If not provided, it will be compiled to all available languages
   */
  export declare function compile(
    sourceFiles: SourceFile[],
    options?: AvailableOptions,
    hooks?: AvailableHooks,
    host?: CrossTypeHost,
    languages?: AvailableLanguages['shortName']
  ): SourceFile[]

  /**
   * Compile a single node to a single language
   */
  export declare function compileNode(
    node: Node,
    language: AvailableLanguages['shortName'],
    options?: AvailableOptions,
    hooks?: AvailableHooks,
    host?: CrossTypeHost,
  ): string
  /**
   * Compile a single node to multiple languages
   * @param languages - If not provided, it will be compiled to all available languages
   */
  export declare function compileNode<L extends Array<AvailableLanguages['shortName']> = Array<AvailableLanguages['shortName']>>(
    node: Node,
    languages?: L,
    options?: AvailableOptions,
    hooks?: AvailableHooks,
    host?: CrossTypeHost,
  ): { [K in L[number]]: string }

  // endregion
}
