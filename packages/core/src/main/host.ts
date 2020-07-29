import { SourceFile } from '#ast';
import { cast } from '@crosstype/common';


/* ****************************************************************************************************************** */
// region: Types
/* ****************************************************************************************************************** */

export interface CrossTypeHost {
  readFile(fileName: string): string
  writeFile(fileName: string): string
  fileExists(fileName: string): string
  emitFiles(files: SourceFile[]): void
}

// endregion


/* ****************************************************************************************************************** */
// region: Utilities
/* ****************************************************************************************************************** */

export function createCrossTypeHost(): CrossTypeHost {
  return cast<CrossTypeHost>();
}

// endregion
