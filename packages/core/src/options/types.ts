import { Language } from '../language/language';


/* ****************************************************************************************************************** */
// region: Option Sets
/* ****************************************************************************************************************** */

type CompilerLanguageCodes = Language.CompilerLanguages['shortName']
type ParserLanguageCodes = Language.ParserLanguages['shortName']

export type CompileOptionsSet = {
  [K in CompilerLanguageCodes]: Language.GetLanguage<K>['optionsTypes']['CompileOptions']
}

export type ParseOptionsSet = {
  [K in ParserLanguageCodes]: Language.GetLanguage<K>['optionsTypes']['ParseOptions']
}

// endregion
