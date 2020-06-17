const shell = require('shelljs');
const path = require('path');
const fs = require('fs');


/* ****************************************************************************************************************** */
// region: Config
/* ****************************************************************************************************************** */

const generatedOutDir = path.resolve(__dirname, '../dist/generated');
const srcOutDir = path.resolve(__dirname, '../dist/src');
const outDir = path.resolve(__dirname, '../dist');

// endregion


/* ****************************************************************************************************************** */
// region: Action
/* ****************************************************************************************************************** */

(function run() {
  /* Merge generated and src output directories */
  if (fs.existsSync(generatedOutDir)) shell.cp('-R', path.join(generatedOutDir, '*'), outDir);
  if (fs.existsSync(srcOutDir)) shell.cp('-R', path.join(srcOutDir, '*'), outDir);
  shell.rm('-rf', generatedOutDir, srcOutDir);
})();

// endregion
