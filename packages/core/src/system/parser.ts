import { SourceFile } from '#ast';
import { Language } from '#language/language';
import { CrossTypeHost } from './host';
import { LanguagePackage } from './language-package';
import { NullableJsonValue } from '@crosstype/common';


/* ****************************************************************************************************************** */
// region: Types
/* ****************************************************************************************************************** */

export interface ParserFunction {
  /**
   * Parse sourceText
   */
    <O extends Parser.OptionsBase, H extends Parser.HooksBase>(
    sourceText: string,
    options?: O,
    hooks?: H,
    host?: CrossTypeHost
  ): SourceFile[]
  /**
   * Parse files (from array of file paths)
   */
  <O extends Parser.OptionsBase, H extends Parser.HooksBase>(
    fileNames: string[],
    options?: O,
    hooks?: H,
    host?: CrossTypeHost
  ): SourceFile[]
  /**
   * Parse files (object of { [filename]: sourceText })
   */
  <O extends Parser.OptionsBase, H extends Parser.HooksBase>(
    files: { [fileName: string]: /* SourceText */ string },
    options?: O,
    hooks?: H,
    host?: CrossTypeHost
  ): SourceFile[]
  /**
   * Parse files in package file
   */
  <O extends Parser.OptionsBase, H extends Parser.HooksBase>(
    packageFile: string,
    options?: O,
    hooks?: H,
    host?: CrossTypeHost
  ): SourceFile[]
}

export type Parser<T extends ParserFunction = ParserFunction> = T & {
  pkg: LanguagePackage
}

// endregion


/* ****************************************************************************************************************** *
 * Namespace
 * ****************************************************************************************************************** */

export namespace Parser {
  /* ********************************************************* */
  // region: Types
  /* ********************************************************* */

  type ParserOptionsValue = NullableJsonValue | undefined

  export interface OptionsBase {
    /**
     * Root directory for project files (defaults to cwd)
     */
    rootDir: string

    [p:string]: ParserOptionsValue
  }

  export interface HooksBase {
    [key:string]: NullableJsonValue
    // universal hooks here
  }

  export type AvailableLanguages = Language.ParserLanguages
  export type AvailableOptions = { [K in AvailableLanguages['shortName']]: Language.GetLanguage<K>['ParseOptions'] }
  export type AvailableHooks = { [K in AvailableLanguages['shortName']]: Language.GetLanguage<K>['ParseHooks'] }

  // endregion


  /* ********************************************************* */
  // region: Utilities
  /* ********************************************************* */

  // TODO - Universal parse() which allows specifying language

  // endregion
}
