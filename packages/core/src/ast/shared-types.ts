import { CompileOptions, SourceFileInfo } from '../types';
import { TagMap } from '#ast/components';
import { SymbolLiteral } from '#ast/node-types';
import { NodeFlags, TypeFlags } from '#ast/enums';


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
  specificKind?: number

  [k: string]: any // Additional properties allowed
}

export type NodeIndex = string | number | SymbolLiteral

export interface OutputFile {
  fileName: string,
  language: string,
  compileOptions?: CompileOptions                 // Configure to override using Definition's compileOptions as a base
}

export interface NodeMetadata {
  childContainerProperties?: Map</* key */ string, { key: string, optional: boolean }>
  baseFlags?: NodeFlags[]
  baseTypeFlags?: TypeFlags[]
}

// endregion
