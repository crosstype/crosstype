import fs from 'fs';


/* ****************************************************************************************************************** */
// region: Types
/* ****************************************************************************************************************** */

export interface CrossTypeHost {
  readFile(fileName: string): string
  writeFile(fileName: string, data: string | Buffer): void
  readFiles(fileNames: string[]): Map</* fileName */ string, /* data */ string>
  writeFiles(files: { [fileName:string]: string }): void
  fileExists(fileName: string): boolean
  // emitFiles(files: SourceFile[]): void
}

// endregion


/* ****************************************************************************************************************** */
// region: Utilities
/* ****************************************************************************************************************** */

export function createCrossTypeHost(): CrossTypeHost {
  return {
    readFile: (fileName: string) => fs.readFileSync(fileName, 'utf8'),
    writeFile: (fileName: string, data: any) => fs.writeFileSync(fileName, data),
    fileExists: (fileName: string) => fs.existsSync(fileName),
    readFiles(this: CrossTypeHost, filesNames: string[]) {
      return new Map<string, string>(filesNames.map(f => [ f, this.readFile(f) ]));
    },
    writeFiles(this: CrossTypeHost, files: { [p: string]: string }) {
      Object.entries(files).forEach(f => this.writeFile(f[0], f[1]));
    }
  }
}

// endregion
