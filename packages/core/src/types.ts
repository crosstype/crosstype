import { Language } from '#language/language';


/* ****************************************************************************************************************** */
// region: General
/* ****************************************************************************************************************** */

export interface SourceFileInfo {
  fileName: string,
  packageName?: string,
  packagePath?: string
}

export type NumberRange = { min: number, max?: number }

// endregion


/* ****************************************************************************************************************** */
// region: Placeholders
/* ****************************************************************************************************************** */
// Will be replaced

export type OptionsConfig = any

type CompilerLanguageCodes = Language.CompilerLanguages['shortName']
type ParserLanguageCodes = Language.ParserLanguages['shortName']

export type CompileOptionsSet = {
  [K in CompilerLanguageCodes]: Language.GetLanguage<K>['optionsTypes']['CompileOptions']
}

export type ParseOptionsSet = {
  [K in ParserLanguageCodes]: Language.GetLanguage<K>['optionsTypes']['ParseOptions']
}

// endregion
