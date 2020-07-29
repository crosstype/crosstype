import { Node, SourceFile } from '#ast';
import { DefinitionCollection } from '../types';
import { Language } from '#language/language';
import { CrossTypeHost } from './host';
import { LanguagePackage } from './language-package';
import { NullableJsonValue } from '@crosstype/common';


/* ****************************************************************************************************************** */
// region: Type
/* ****************************************************************************************************************** */

export interface Parser {
  pkg: LanguagePackage

  /**
   * Parse files (from array of file paths)
   */
  (
    fileNames: string[],
    options?: Parser.OptionsBase,
    hooks?: Parser.HooksBase,
    host?: CrossTypeHost
  ): DefinitionCollection
  /**
   * Parse files (object of { [filename]: sourceText })
   */
  (
    files: { [fileName: string]: /* SourceText */ string },
    options?: Parser.OptionsBase,
    hooks?: Parser.HooksBase,
    host?: CrossTypeHost
  ): DefinitionCollection
  /**
   * Parse sourceText
   */
  (
    sourceText: string,
    options?: Parser.OptionsBase,
    hooks?: Parser.HooksBase,
    host?: CrossTypeHost
  ): DefinitionCollection
}

// endregion


/* ****************************************************************************************************************** *
 * Namespace
 * ****************************************************************************************************************** */

export namespace Parser {
  /* ********************************************************* */
  // region: Types
  /* ********************************************************* */

  export type OptionsBase = Record<string, NullableJsonValue>

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

  /**
   * Compile a DefinitionCollection
   * @param languages - If not provided, it will be compiled to all available languages
   */
  export declare function parse(
    definitions: DefinitionCollection,
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
