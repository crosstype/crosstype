import { removeUndefinedFromArray } from '@crosstype/common';
import { JsonSchema, Python, TypeScript } from './imports';
import { Compiler, LanguagePackage, Parser } from '#main';


/* ****************************************************************************************************************** */
// region: Config
/* ****************************************************************************************************************** */

// Note: Keep all possible languages defined in this array
const allLanguages = removeUndefinedFromArray([ TypeScript, JsonSchema, Python ]);

// endregion


/* ****************************************************************************************************************** *
 * Language Namespace
 * ****************************************************************************************************************** */

export namespace Language {
  /* ********************************************************* */
  // region: Internal
  /* ********************************************************* */

  const languages = Object.freeze(allLanguages.filter(l => l.active));

  type AllLanguages = (typeof allLanguages)[number]

  export type Languages = Exclude<AllLanguages, { active: false }>

  // endregion

  /* ********************************************************* */
  // region: Properties
  /* ********************************************************* */

  export type ShortNames = Languages['shortName']
  export const ShortNames = languages.map(l => l.shortName) as ShortNames[];
  export type FullNames = Languages['fullName']
  export const FullNames = languages.map(l => l.fullName) as FullNames[];
  export type Names = ShortNames | FullNames
  export const Names = { ...ShortNames, ...FullNames };


  export const CompilerLanguages = languages.filter(l => l.compiler) as LanguagePackage[];
  export type CompilerLanguages = Exclude<Language.Languages, { compiler: undefined }>
  export const ParserLanguages = languages.filter(l => l.compiler) as LanguagePackage[];
  export type ParserLanguages = Exclude<Language.Languages, { parser: undefined }>

  // endregion


  /* ********************************************************* */
  // region: Utilities
  /* ********************************************************* */

  export const getLanguages = (): readonly LanguagePackage[] => <readonly LanguagePackage[]><unknown>languages;

  export function getCompilers(): readonly Compiler[] {
    const res: Compiler[] = [];
    for (const language of getLanguages())
      if (language.compiler) res.push(language.compiler);

    return Object.freeze(res);
  }

  export function getCompiler(name: Language.Names): Compiler | undefined {
    return getLanguage(name)?.compiler;
  }

  // export function getParsers(): readonly Parser[] {
  //   const res: Compiler[] = [];
  //   for (const language of getLanguages())
  //     if (language.parser) res.push(language.parser);
  //
  //   return Object.freeze(res);
  // }

  export function getParser(name: Language.Names): Parser | undefined {
    return getLanguage(name)?.parser;
  }

  export function getLanguage(name: Language.Names): LanguagePackage | undefined {
    return getLanguages().find(l => (name === l.shortName) || (name === l.name));
  }

  export type GetLanguage<N extends Language.Names | Language.ShortNames> =
    Extract<Languages, { fullName: N } | { shortName: N }>

  // endregion
}
