import fs from 'fs';
import path from 'path';


/* ****************************************************************************************************************** *
 * Constants
 * ****************************************************************************************************************** */

const resolvedPkgCache: Record<string, any> = {};


/* ****************************************************************************************************************** *
 * Utilities
 * ****************************************************************************************************************** */

/**
 * Find and parse nearest package.json
 */
export function getPackageDetail(baseDir: string) {
  /* Walk up directories in search */
  return (function walk(dir: string): { packagePath: string | undefined, packageData: any | undefined } {
    if (!(dir in resolvedPkgCache)) {
      try {
        resolvedPkgCache[dir] = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
      }
      catch {
        let parent = path.resolve(dir, '..');
        if (parent === dir) return { packagePath: void 0, packageData: void 0 };
        return walk(parent);
      }
    }

    return ({ packagePath: dir, packageData: resolvedPkgCache[dir] });
  })(path.resolve(baseDir));
}
