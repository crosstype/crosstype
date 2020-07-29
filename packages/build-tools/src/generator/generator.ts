import { PluginConfig, ProgramTransformerExtras } from 'ts-patch';
import { CompilerHost, normalizePath, Program } from 'typescript';
import { createLogger, Logger } from './logger';
import { GeneratorConfig } from './config';
import { sys } from './sys';
import path from 'path';
import fs from 'fs';
import * as glob from 'glob';
import { getWatchFileStats, WatchFilesStats } from './stats';
import { hasProperties } from '@crosstype/common';


/* ****************************************************************************************************************** */
// region: Types
/* ****************************************************************************************************************** */

export interface GeneratorContext extends Generator {
  config: GeneratorConfig
  logger: Logger
  writeFile(this: GeneratorContext, fileName: string, data: string): void
  readFile(this: GeneratorContext, fileName: string): string | undefined
  fileExists(this: GeneratorContext, fileName: string): boolean
  resolvePath(this: GeneratorContext, baseDir: string, p: string): string
  /**
   * Check watch files for modifications
   * @returns Array of modified files
   */
  checkWatchFiles(this: GeneratorContext, stats?: WatchFilesStats): string[]
  /**
   * Check if outFiles are missing
   * @returns Array of missing files
   */
  checkOutFiles(this: GeneratorContext): string[]
  getResolvedWatchFiles(this: GeneratorContext, asRelative?: boolean): string[]
  getResolvedOutFiles(this: GeneratorContext): string[]
  check(this: GeneratorContext, stats?: WatchFilesStats): boolean
}

type GeneratorEntry = (
  this: GeneratorContext,
  program: Program,
  host: (CompilerHost | undefined),
  config: PluginConfig,
  extras: ProgramTransformerExtras
) => Program

export interface Generator {
  name: string,
  watchFiles: string[]
  outFiles: string[]
  entry: GeneratorEntry
}

// endregion


/* ****************************************************************************************************************** */
// region: Utilities
/* ****************************************************************************************************************** */

export const isGenerator = (v: any): v is GeneratorContext =>
  hasProperties(v, [ 'name', 'entry', 'watchFiles', 'outFiles' ]);

export function createGenerator(generator: Generator) {
  let ctx = <GeneratorContext>{};
  Object.assign(ctx, generator, {
    logger: createLogger(ctx),
    writeFile: sys.writeFile.bind(ctx),
    readFile: sys.readFile.bind(ctx),
    fileExists: sys.fileExists.bind(ctx),
    resolvePath: sys.resolvePath.bind(ctx),
    entry: generator.entry.bind(ctx),
    checkWatchFiles: checkWatchFiles.bind(ctx),
    checkOutFiles: checkOutFiles.bind(ctx),
    getResolvedWatchFiles: getResolvedWatchFiles.bind(ctx),
    getResolvedOutFiles: getResolvedOutFiles.bind(ctx),
    check: check.bind(ctx)
  });

  return ctx;

  function checkWatchFiles(this: GeneratorContext, stats?: WatchFilesStats): string[] {
    this.logger.verbose(`Checking watch-files: ${this.watchFiles.join(', ')}`);
    if (!stats) stats = getWatchFileStats(this.config.statsFile);

    let res: string[] = [];
    for (const fileName of this.getResolvedWatchFiles()) {
      const relativePath = normalizePath(path.relative(this.config.baseDir, fileName));
      if (!stats[relativePath] || (stats[relativePath] < fs.statSync(fileName).mtimeMs))
        res.push(fileName);
    }

    return res;
  }

  function checkOutFiles(this: GeneratorContext): string[] {
    this.logger.verbose(`Checking output-files: ${this.outFiles.join(', ')}`);

    return this
      .getResolvedOutFiles()
      .filter(f => !this.fileExists(f));
  }

  function getResolvedWatchFiles(this: GeneratorContext, asRelative: boolean = false): string[] {
    return this
      .watchFiles
      .map(f => glob.sync(this.resolvePath(this.config.baseDir, f)))
      .flat()
      .map(f => normalizePath(asRelative ? path.relative(this.config.baseDir, f) : f));
  }

  function getResolvedOutFiles(this: GeneratorContext): string[] {
    return this
      .outFiles
      .map(f => this.resolvePath(this.config.baseDir, f));
  }

  function check(this: GeneratorContext, stats?: WatchFilesStats): boolean {
    const missingOutFiles = this.checkOutFiles();
    if (missingOutFiles.length) {
      this.logger.info(`Regenerate required... Missing Generated Files:\n  ${missingOutFiles.join(',\n  ')}\n`);
      return true;
    }

    const updatedWatchFiles = this.checkWatchFiles(stats);
    if (updatedWatchFiles.length) {
      this.logger.info(`Regenerate required... Updated Watch Files:\n  ${updatedWatchFiles.join(',\n  ')}\n`);
      return true
    }

    return false;
  }
}

// endregion
