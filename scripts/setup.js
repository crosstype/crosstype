const fs = require('fs');
const path = require('path');
const glob = require('glob');
const shelljs = require('shelljs');
const tsPatch = require('ts-patch');


/* ****************************************************************************************************************** *
 * Config
 * ****************************************************************************************************************** */

const rootDir = path.resolve(__dirname, '..');
const cacheDir = path.resolve(rootDir, '.yarn-cache');
const packagesDir = path.resolve(rootDir, 'packages');


/* ****************************************************************************************************************** *
 * Tasks
 * ****************************************************************************************************************** */

/* Ensure build-tools is built */
if (!fs.existsSync(path.resolve(packagesDir, 'build-tools/index.js'))) {
  shelljs.exec('yarn workspace @type-schema/build-tools build');
}


/* Ensure typescript is patched (to support transformers) */
if (!fs.existsSync(path.resolve(rootDir, 'node_modules/typescript/lib-backup'))) {
  const baseDirs = new Set([
      rootDir,
      ...glob
        .sync('**/typescript/lib/@(typescript|tsc).js', { cwd: cacheDir })
        .map(f => path.resolve(cacheDir, path.dirname(f)))
    ]
  );

  for (const dir of baseDirs)
    tsPatch.patch( [ 'tsc.js', 'typescript.js' ], { basedir: dir });
}
