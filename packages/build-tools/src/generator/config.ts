// noinspection ES6UnusedImports
import {} from 'ts-expose-internals';
import * as glob from 'glob';
import * as path from 'path';
import { LogLevel, sys } from './index';
import { normalizePath, Program } from 'typescript';
import isGlob from 'is-glob';
import { findLikelyTsConfigFile, pick } from '@crosstype/common';


/* ****************************************************************************************************************** */
// region: Constants
/* ****************************************************************************************************************** */

export const generatorRoot = path.resolve(__dirname, '../generators');
export const repoBaseDir = path.resolve(__dirname, '../../../../');

export const defaultConfig = ({
  statsFile: 'generator.stats.json',
  logLevel: 'normal',
  generators: []
});

export const cliOptionKeys:(keyof GeneratorConfig)[] = [ 'logLevel', 'statsFile', 'force', 'baseDir' ];
const configKeys: readonly (keyof GeneratorConfig)[] = <const>[ 'baseDir', 'logLevel', 'statsFile', 'generators', 'force' ];

// endregion


/* ****************************************************************************************************************** */
// region: Types
/* ****************************************************************************************************************** */

export interface GeneratorConfig {
  /**
   * Specify base directory
   */
  baseDir: string

  /**
   * Enable debug logging
   */
  logLevel: keyof typeof LogLevel

  /**
   * Path to output stats file
   * @default '<cwd>/generator.stats.json'
   */
  statsFile: string

  /**
   * Generator files, path or glob (relative to generatorRoot)
   */
  generators: string[]

  /**
   * Force generators to run
   */
  force?: boolean
}

// endregion


/* ****************************************************************************************************************** */
// region: Utilities
/* ****************************************************************************************************************** */

export function createConfig(program: Program, initialConfig: Partial<GeneratorConfig>): GeneratorConfig {
  const config = Object.assign({}, defaultConfig, pick(initialConfig, ...configKeys));

  /* Get baseDir */
  let dir = config.baseDir; // Get from config if possible
  if (!dir) {
    /* Try to determine from Program, fall back to cwd */
    const cfgFile = findLikelyTsConfigFile(program);
    dir = cfgFile ? path.dirname(cfgFile) : program.getCurrentDirectory();
  }
  const baseDir = normalizePath(dir);

  /* Resolve paths */
  Object.assign(config, {
    baseDir,
    statsFile: sys.resolvePath(baseDir, config.statsFile),
    generators: config
      .generators
      .map(g => isGlob(g) ? glob.sync(g, { cwd: baseDir }) : sys.resolvePath(baseDir, g))
      .flat()
  });

  return config as GeneratorConfig;
}

// endregion
