import { Compiler, LanguagePackage, Parser } from '#package';
import { removeUndefined } from '@crosstype/system';
import { JsonSchema, Python, TypeScript } from './imports';


/* ****************************************************************************************************************** */
// region: Config
/* ****************************************************************************************************************** */

// Note: Keep all possible languages defined in this array
const allLanguages = removeUndefined([ TypeScript, JsonSchema, Python ]);

// endregion


/* ****************************************************************************************************************** *
 * Language Namespace
 * ****************************************************************************************************************** */

export namespace Language {
  /* ********************************************************* */
  // region: Internal
  /* ********************************************************* */

  const languages = Object.freeze(allLanguages.filter(l => l.active));

  /**
   * Internal union of LanguageConfig for each language
   */
  type AllLanguages = (typeof allLanguages)[number]
  type Languages = Exclude<AllLanguages, { active: false }>

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

  // endregion


  /* ********************************************************* */
  // region: Utilities
  /* ********************************************************* */

  export const getLanguages = (): readonly LanguagePackage[] => languages;

  export function getCompilers(): readonly Compiler[] {
    const res: Compiler[] = [];
    for (const language of getLanguages())
      if (language.compiler) res.push(language.compiler);

    return Object.freeze(res);
  }

  export function getCompiler(name: Language.Names): Compiler | undefined {
    return getLanguage(name)?.compiler;
  }

  export function getParsers(): readonly Parser[] {
    const res: Compiler[] = [];
    for (const language of getLanguages())
      if (language.parser) res.push(language.parser);

    return Object.freeze(res);
  }

  export function getParser(name: Language.Names): Parser | undefined {
    return getLanguage(name)?.parser;
  }

  export function getLanguage(name: Language.Names): LanguagePackage | undefined {
    return getLanguages().find(l => (name === l.shortName) || (name === l.fullName));
  }

  export type GetLanguage<N extends Language.Names> = Extract<Languages, { fullName: N } | { shortName: N }>

  // endregion
}
