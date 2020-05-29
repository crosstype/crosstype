
/* ****************************************************************************************************************** */
// region: Specifics
/* ****************************************************************************************************************** */

export enum SpecificKindTS {
  Any,
  Unknown
}

export enum SpecificKindPython {
}

// endregion


/* ****************************************************************************************************************** */
// region: Utilities
/* ****************************************************************************************************************** */

export type GetSpecificEnumForLanguage<L extends string> =
  L extends 'ts' ? SpecificKindTS :
  L extends 'python' ? SpecificKindPython : never

// endregion
