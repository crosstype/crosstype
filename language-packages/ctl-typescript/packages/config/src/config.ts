import { Compiler, Parser } from '@crosstype/core';
import { cast, requireIfExists } from '@crosstype/common';
import { SpecialKind } from './types';


/* ****************************************************************************************************************** */
// region: Optional Imports
/* ****************************************************************************************************************** */

const { compiler, parser } = requireIfExists(
  '@crosstype/ctl-typescript/dist/tools',
  // @ts-ignore
  () => import('@crosstype/ctl-typescript/dist/tools')
);

// endregion


/* ****************************************************************************************************************** */
// region: Config
/* ****************************************************************************************************************** */

export const Config = {
  name: 'typescript',
  shortName: 'ts',
  experimental: true,
  optionsConfig: {},
  compiler,
  parser,
  specialKind: SpecialKind,

  // Type only
  CompileOptions: cast<Compiler.OptionsBase>(),
  CompileHooks: cast<Compiler.HooksBase>(),
  ParseOptions: cast<Parser.OptionsBase>(),
  ParseHooks: cast<Parser.HooksBase>(),
}

// endregion
