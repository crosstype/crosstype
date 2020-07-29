import { normalizePath } from 'typescript';
import * as path from 'path';
import * as fs from 'fs';
import { GeneratorContext } from './generator';
import { Logger } from './logger';


/* ****************************************************************************************************************** */
// region: System Helpers
/* ****************************************************************************************************************** */

export namespace sys {
  /**
   * Normalize and resolve path
   */
  export function resolvePath(this: GeneratorContext | void | typeof sys, baseDir: string, p: string): string {
    return normalizePath(path.resolve(baseDir, p));
  }

  export function readFile(this: GeneratorContext | void | typeof sys, fileName: string): string | undefined {
    return (this || <any>sys).fileExists(fileName) ? fs.readFileSync(fileName, 'utf-8') : void 0;
  }

  export function fileExists(this: GeneratorContext | void | typeof sys, fileName: string): boolean {
    return fs.existsSync(fileName);
  }

  /**
   * Write file to disk
   */
  export function writeFile(this: GeneratorContext | void | typeof sys, fileName: string, data: string) {
    const dir = path.dirname(fileName);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const logger: Logger | undefined = this && (<any>this).logger;
    logger?.debug(`Writing file: ${fileName}`);
    fs.writeFileSync(fileName, data);
  }
}

// endregion
