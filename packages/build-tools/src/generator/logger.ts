import { GeneratorConfig } from './config';
import { truthyStr } from '@crosstype/system';
import { GeneratorContext, isGenerator } from './generator';


/* ****************************************************************************************************************** */
// region: Types
/* ****************************************************************************************************************** */

export interface Logger {
  error: (msg: string) => void,
  warn: (msg: string) => void,
  info: (msg: string) => void,
  debug: (msg: string) => void,
  verbose: (msg: string) => void,
}

export enum LogLevel {
  // silent,
  error,
  warn,
  info,
  debug,
  verbose,
}

// endregion


/* ****************************************************************************************************************** */
// region: Factory
/* ****************************************************************************************************************** */

export function createLogger(context: GeneratorContext): Logger
export function createLogger(config: GeneratorConfig, name?: string): Logger
export function createLogger(contextOrConfig: GeneratorConfig | GeneratorContext, name?: string): Logger {
  const baseObject = !isGenerator(contextOrConfig) ? { config: contextOrConfig, name } : contextOrConfig;
  const log = (action: keyof typeof LogLevel, msg: string) => {
    const fn = (action === 'verbose') ? 'debug' :
               (action === 'info') ? 'log' :
               action;

    if (LogLevel[baseObject.config.logLevel] >= LogLevel[action])
      console[fn](truthyStr(baseObject.name, `[${baseObject.name}] `) + msg);
  }

  return ({
    error(msg: string) { return log('error', msg) },
    warn(msg: string) { return log('warn', msg) },
    info(msg: string) { return log('info', msg) },
    debug(msg: string) { return log('debug', msg) },
    verbose(msg: string) { return log('verbose', msg) },
  })
}


// endregion
