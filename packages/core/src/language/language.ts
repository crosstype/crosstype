import { CrossTypeLanguage } from './crosstype-language';
import { Compiler } from '../package/compiler';
import { Parser } from '../package/parser';
import { SpecificKind } from './specific-kind';


/* ****************************************************************************************************************** */
// region: Types
/* ****************************************************************************************************************** */

export interface LanguageDetail {
  short: string
  full: string
  code: number
  packageName: string
  specificKinds: any
}

// endregion


/* ****************************************************************************************************************** *
 * Language Namespace
 * ****************************************************************************************************************** */

/**
 * Supported CrossType Languages
 * Note: To preserve compatibility, names and codes should not ever change
 */
export namespace Language {
  /* ********************************************************* */
  // region: Codes
  /* ********************************************************* */

  export enum Code {
    TypeScript = 0,
    JsonSchema = 1,
    Python = 2,
  }

  // endregion

  /* ********************************************************* */
  // region: Languages
  /* ********************************************************* */

  const tsDetail = <const>{
    short: 'ts',
    full: 'typescript',
    code: Code.TypeScript,
    packageName: 'ctl-typescript',
    specificKinds: SpecificKind.TS
  }
  export const TypeScript = new CrossTypeLanguage(tsDetail);
  export type TypeScript = typeof tsDetail;

  const pythonDetail = <const>{
    short: 'python',
    full: 'python',
    code: Code.Python,
    packageName: 'ctl-python',
    specificKinds: SpecificKind.Python
  }
  export const Python = new CrossTypeLanguage(pythonDetail);
  export type Python = typeof pythonDetail;

  const jsonSchemaDetail = <const>{
    short: 'json',
    full: 'json-schema',
    code: Code.JsonSchema,
    packageName: 'ctl-json-schema',
    specificKinds: SpecificKind.JsonSchema
  }
  export const JsonSchema = new CrossTypeLanguage(jsonSchemaDetail);
  export type JsonSchema = typeof jsonSchemaDetail;

  // endregion

  /* ********************************************************* */
  // region: Internal
  /* ********************************************************* */

  /**
   * Internal array of all languages
   */
  const languages = Object.freeze([ TypeScript, JsonSchema, Python ]);

  /**
   * Internal union of LanguageDetail for each language
   */
  type Languages = TypeScript | Python | JsonSchema

  // endregion

  /* ********************************************************* */
  // region: Properties
  /* ********************************************************* */

  export type ShortNames = Languages['short']
  export const ShortNames = languages.map(l => l.short) as ShortNames[];

  export type FullNames = Languages['full']
  export const FullNames = languages.map(l => l.full) as FullNames[];

  export type Names = ShortNames | FullNames
  export const Names = { ...ShortNames, ...FullNames };

  // endregion


  /* ********************************************************* */
  // region: Utilities
  /* ********************************************************* */

  export function getLanguages(): readonly CrossTypeLanguage[] {
    return languages;
  }

  export function getCompilers(): readonly Compiler[] {
    const res: Compiler[] = [];
    for (const language of languages)
      if (language.package?.compiler) res.push(language.package?.compiler);

    return Object.freeze(res);
  }

  export function getParsers(): readonly Parser[] {
    const res: Compiler[] = [];
    for (const language of languages)
      if (language.package?.parser) res.push(language.package?.parser);

    return Object.freeze(res);
  }

  export function findLanguage(name: Language.Names): CrossTypeLanguage | undefined
  export function findLanguage(code: Code): CrossTypeLanguage | undefined
  export function findLanguage(nameOrCode: Names | Code): CrossTypeLanguage | undefined {
    const name = (typeof nameOrCode === 'string') && nameOrCode.toLowerCase();

    return languages.find(l =>
      name ? (name === l.short) || (name === l.full) :
      l.code === nameOrCode
    );
  }

  // endregion
}
