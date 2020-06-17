import * as fs from 'fs';
import { isJSONObjectString } from '@crosstype/system';
import { GeneratorConfig, GeneratorContext, sys } from './index'


/* ****************************************************************************************************************** */
// region: Types
/* ****************************************************************************************************************** */

export type WatchFilesStats = { [fileName: string]: /* timeStamp */ number }

// endregion


/* ****************************************************************************************************************** */
// region: Utilities
/* ****************************************************************************************************************** */

export function getWatchFileStats(statsFile: string, context?: GeneratorContext): WatchFilesStats {
  let data = context?.readFile(statsFile) ?? sys.readFile(statsFile) ?? '{}';
  if (!isJSONObjectString(data)) data = '{}';
  return JSON.parse(data) as WatchFilesStats;
}

/**
 * Update watch stats file with new timestamps
 * @param files - Files to update timestamps (if none provided, all will be updated)
 * @param stats - Current stats object (prevents reading file again)
 */
export function updateStatsFile(
  config: GeneratorConfig,
  context?: GeneratorContext,
  files?: string[],
  stats?: WatchFilesStats,
): WatchFilesStats {
  const { statsFile, baseDir: baseDir } = config;

  if (!stats) stats = getWatchFileStats(statsFile, context);
  if (!files) files = Object.keys(stats);

  for (const file of files) stats[file] = fs.statSync(sys.resolvePath(baseDir, file)).mtimeMs;

  (context || <any>sys).writeFile(statsFile, JSON.stringify(stats, null, 2));

  return stats;
}

// endregion
