import { Compiler } from './compiler';
import { Parser } from './parser';
import { LanguagePackage } from './language-package';


/* ****************************************************************************************************************** *
 * Package Namespace
 * ****************************************************************************************************************** */

export namespace Package {

  /* ********************************************************* */
  // region: Utilities
  /* ********************************************************* */

  export const isLanguagePackage = (pkg: any): pkg is LanguagePackage =>
    LanguagePackage.prototype.isPrototypeOf(pkg);

  export function createCompiler(parent: LanguagePackage): Compiler {
    return {
      parent
    }
  }

  export function createParser(parent: LanguagePackage): Parser {
    return {
      parent
    }
  }

  export function setupPackage<T extends LanguagePackage>(config: T) {
    Object.setPrototypeOf(config, LanguagePackage);
  }

  // endregion
}
