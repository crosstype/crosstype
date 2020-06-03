import { SourceFileInfo } from '../types';
import { TagMap } from '#ast/components';
import { SymbolLiteral } from '#ast/node-types';


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

export type NamedNodeName = string | number | SymbolLiteral

// endregion
