import fs from 'fs';
import path from 'path';
import { IfAny } from './type-helpers';


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

/**
 * Require a package if it exists (This function is synchronous and uses require)
 * @param importFn - Function wrapped import promise which allows us to infer module type (see example)
 *
 * @example
 * // This will have the type of the 'typescript' module
 * // @ts-ignore - disable missing module warning
 * const foundModule = requireIfExists('typescript', () => import('typescript'));
 *
 * // This will have type: never
 * // @ts-ignore - disable missing module warning
 * const missingModule = requireIfExists('missing-module', () => import('missing-module'));
 */
export function requireIfExists<T extends () => Promise<any>>(moduleName: string, importFn: T):
  ReturnType<T> extends PromiseLike<infer U> ? IfAny<U, never, Omit<U, 'default'>> : never
export function requireIfExists(moduleName: string): any {
  try { return require(moduleName) }
  catch { return void 0 }
}
