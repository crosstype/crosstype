
/* ****************************************************************************************************************** *
 * Decorators
 * ****************************************************************************************************************** */

/**
 * (Decorator) Assign metadata
 */
export function meta<T>(data: T, keyName: string = "_metadata") {
  return (target: any, propertyKey?: string) => {
    Reflect.defineMetadata(keyName, data, target, <any>propertyKey);
  }
}
