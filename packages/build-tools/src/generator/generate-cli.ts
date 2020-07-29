import minimist from 'minimist';
import * as fs from 'fs';
import { cliOptionKeys, repoBaseDir } from './config';
import { sys } from './sys';
import ts from 'typescript';
import runGenerators from './run';
import path from 'path';
import { pick } from '@crosstype/common';


/* ****************************************************************************************************************** *
 * Main
 * ****************************************************************************************************************** */

run(minimist(process.argv.slice(2)));

export function run(argv: minimist.ParsedArgs) {
  /* Load tsConfig */
  let tsConfigFile = sys.resolvePath(repoBaseDir, argv._[0]);

  const stat = fs.existsSync(tsConfigFile) ? fs.statSync(tsConfigFile) : void 0;
  if (stat?.isDirectory()) tsConfigFile = sys.resolvePath(tsConfigFile, 'tsconfig.json');
  else if (!stat?.isFile()) throw new Error(`Must supply a valid tsconfig file or path which contains one. (${tsConfigFile})`)

  const parsedCommandLine = ts.getParsedCommandLineOfConfigFile(tsConfigFile, {}, ts.sys as any)!;
  if (!parsedCommandLine) throw new Error(`Could not load config file: ${tsConfigFile}`);

  /* Get config & merge CLI options */
  const pluginConfig: any =
    parsedCommandLine.options.plugins?.find((p: any) => p.transform == '@crosstype/build-tools/dist/generator/run.js');
  Object.assign(pluginConfig, pick(argv, ...cliOptionKeys), { baseDir: path.dirname(tsConfigFile) });

  // Remove generator from plugins (prevents double action)
  parsedCommandLine.options.plugins?.forEach((p:any, i, arr) => {
    if (/generator\/run.js$/.test(p.transform)) arr.splice(i, 1);
  });

  /* Generate */
  const host = ts.createIncrementalCompilerHost(parsedCommandLine.options);
  const program = ts.createIncrementalProgram({ rootNames: parsedCommandLine.fileNames, options: parsedCommandLine.options });
  runGenerators(program.getProgram(), host, pluginConfig, { ts: <any>ts });
}
