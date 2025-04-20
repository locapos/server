// Overload signatures
export function createLoggerProxy<T extends object>(typeName: string, target: T): T;
export function createLoggerProxy<T extends object>(target: T): T;

// Implementation
export function createLoggerProxy<T extends object>(
  arg1: string | T,
  arg2?: T
): T {
  let target: T;
  let typeName: string;

  if (typeof arg1 === 'string' && arg2) {
    typeName = arg1;
    target = arg2;
  } else if (typeof arg1 === 'object' && arg1 !== null) {
    target = arg1 as T;
    typeName = target.constructor.name || 'UnknownType'; // Fallback if constructor.name is not available
  } else {
    throw new Error('Invalid arguments for createLoggerProxy');
  }

  return new Proxy(target, {
    get(target, propKey, receiver) {
      const originalValue = target[propKey as keyof T];

      // Do not wrap the 'fetch' function
      if (propKey === 'fetch' && typeof originalValue === 'function') {
        return originalValue.bind(target);
      }

      if (typeof originalValue === 'function') {
        return function (...args: any[]) {
          console.log(`[${typeName}] Calling method: ${String(propKey)}`); // Log with type name
          console.log(`[${typeName}] Arguments:`, args);

          // eslint-disable-next-line @typescript-eslint/ban-types
          const result = (originalValue as Function).apply(target, args);

          console.log(`[${typeName}] Return value:`, result);
          return result;
        };
      } else {
        // Log property access if needed
        // console.log(`[${typeName}] Accessing property: ${String(propKey)}`);
        return Reflect.get(target, propKey, receiver);
      }
    },
  });
}
