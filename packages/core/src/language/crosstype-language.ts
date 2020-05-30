import { LanguageDetail } from './language';
import { LanguagePackage, Package } from '../package/package';
import isLanguagePackage = Package.isLanguagePackage;


/* ****************************************************************************************************************** *
 * CrossTypeLanguage
 * ****************************************************************************************************************** */

export class CrossTypeLanguage {
  public loaded: boolean = false;
  public package?: LanguagePackage

  public short: string
  public full: string
  public code: number
  public packageName: string
  public specificKinds: any

  constructor(detail: LanguageDetail) {
    this.short = detail.short;
    this.full = detail.full;
    this.code = detail.code;
    this.packageName = detail.packageName;
    this.specificKinds = detail.specificKinds;

    Object.freeze(this);
  }

  private get fullPackageName(): string {
    return `@crosstype/${this.packageName}`;
  }

  get isInstalled(): boolean {
    try {
      require.resolve(this.fullPackageName);
      return true;
    } catch {
      return false;
    }
  }

  load(): void {
    if (!this.isInstalled) throw new Error(`Cannot find language package: ${this.packageName}.`);

    const pkg = require(this.fullPackageName);
    if (!isLanguagePackage(pkg))
      throw new Error(
        `Cannot recognize ${this.fullPackageName} as a valid CrossType Language Package. Check to make sure that `+
        `you're using the latest versions of the language packages and CrossType.`
      );

    this.package = pkg;
    this.loaded = true;
  }
}
