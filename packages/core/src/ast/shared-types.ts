import { SourceFileInfo } from '../types';
import { TagMap } from '#ast/components';
import { SymbolLiteral } from '#ast/node-types';
import { NodeFlags, TypeFlags } from '#ast/enums';
import { Compiler } from '#system/compiler';


/* ****************************************************************************************************************** */
// region: Shared Types
/* ****************************************************************************************************************** */

/**
 * Base shape for Origin (each language has its own)
 */
export interface NodeOrigin {
  language: string
  sourceFileInfo?: SourceFileInfo
  sourceText?: string
  tags?: TagMap
  /**
   * Used by extensions to identify specific intrinsic types (ie. `undefined` and `null` in javascript would both
   * produce a NullNode. This property can be used to determine its origin kind)
   */
  specialKind?: number

  [k: string]: any // Additional properties allowed
}

export type NodeIndex = string | number | SymbolLiteral

export interface OutputFile<TOptions extends Compiler.OptionsBase = Compiler.OptionsBase> {
  fileName: string,
  language: string,
  compileOptions?: TOptions
}

export interface NodeMetadata {
  childContainerProperties?: Map</* key */ string, { key: string, optional: boolean }>
  baseFlags?: NodeFlags[]
  baseTypeFlags?: TypeFlags[]
  isNamedNode?: boolean
}

// endregion
