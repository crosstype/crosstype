import { GeneratorContext } from './generator';
import { ConvertibleSet, truthyStr } from '@crosstype/system';
import { sys } from './sys';
import { createConfig, createLogger, GeneratorConfig } from '.';
import { CompilerHost, Program } from '@crosstype/system/typescript';
import { PluginConfig, ProgramTransformerExtras } from 'ts-patch';
import { getWatchFileStats, updateStatsFile } from './stats';


/* ****************************************************************************************************************** */
// region: Helpers
/* ****************************************************************************************************************** */

let tsNodeIncluded = false;

function loadGenerators(config: GeneratorConfig): GeneratorContext[] {
  const { fileExists } = sys;

  return config.generators.map(fileName => {
    if (!fileExists(fileName)) throw new Error(`Could not load generator: ${fileName}. \nFile doesn't exist!`);

    /* Check if we need to include tsNode */
    if (!tsNodeIncluded && fileName.match(/\.ts$/)) {
      require('ts-node').register({
        transpileOnly: true,
        skipProject: true,
        compilerOptions: {
          target: 'ES2018',
          jsx: 'react',
          esModuleInterop: true,
          module: 'commonjs',
        },
      });
      tsNodeIncluded = true;
    }

    const imported = require(fileName);
    const generator: GeneratorContext = imported.default || imported;
    if (!generator.entry) throw new Error(`Could not load generator: ${fileName}. \nExport is not a valid Generator`);
    generator.config = config;

    return generator;
  })
}

const isProgramInstance = (v: any): v is Program => (typeof v['getSourceFiles'] === 'function');

// endregion


/* ****************************************************************************************************************** */
// region: Utilities
/* ****************************************************************************************************************** */

/**
 * Run Generators
 */
export default function run(
  program: Program,
  host: CompilerHost | undefined,
  pluginConfig: PluginConfig,
  extras: ProgramTransformerExtras
): Program {
  const config: GeneratorConfig = createConfig(program, <any>pluginConfig);
  const generators = new ConvertibleSet(loadGenerators(config));
  const logger = createLogger(config);

  logger.info(`Running generator build tool...`);
  logger.debug(`\nGenerators: [ ${generators.toArray().map(g => g.name).join(', ')} ]`)
  logger.verbose(`\nConfig: ${JSON.stringify(config, null, 2)}\n`);

  const stats = getWatchFileStats(config.statsFile);

  /* Iterate and run generators */
  let currentProgram = program;
  let ranGenerators:GeneratorContext[] = [];
  for (const generator of generators) {
    logger.debug(`\nLoaded generator ${generator.name}.\n`);
    logger.verbose(
      `- WatchFiles:\n  ${generator.getResolvedWatchFiles().join(',\n  ')} \n\n` +
      `- OutFiles:\n  ${generator.getResolvedOutFiles().join(',\n  ')} \n`
    );
    if (config.force || generator.check(stats)) {
      ranGenerators.push(generator);
      const res = generator.entry(currentProgram, host, pluginConfig, extras);
      if (isProgramInstance(res)) currentProgram = res;
    }
  }

  logger.info(ranGenerators.length ?
              `Ran ${ranGenerators.length} generator${truthyStr(ranGenerators.length > 1, 's')}.` :
              'No generators needed to run!'
  );

  /* Update stats file */
  updateStatsFile(
    config,
    undefined,
    new ConvertibleSet(ranGenerators.map(g => g.getResolvedWatchFiles(/* asRelative */ true)).flat()).toArray()
  );

  return currentProgram;
}

// endregion
