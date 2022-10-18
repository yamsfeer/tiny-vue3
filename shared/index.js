export function isObject(target) {
  return target !== null && typeof target === 'object'
}

export function isString(target) {
  return typeof target === 'string'
}

export function isFunction(target) {
  return typeof target === 'function'
}

export function isArray(target) {
  return Array.isArray(target)
}

export const EMPTY_OBJ = {}
export const EMPTY_ARR = []

export function NOOP() { }


export function hasChanged(value, oldValue) {
  return oldValue !== value && !(Number.isNaN(oldValue) && Number.isNaN(value))
}
