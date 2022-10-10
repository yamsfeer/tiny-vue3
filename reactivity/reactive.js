import { track, trigger } from './effect.js'
import { isObject } from '../shared/index.js'

export function reactive(target) {
  if (!isObject(target)) {
    return target
  }

  const observer = new Proxy(target, {
    get(target, key, receiver) {
      track(target, key)
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      const res = Reflect.set(target, key, value, receiver)
      trigger(target, key)
      return res
    },
    deleteProperty(target, key, receiver) {
      const res = Reflect.deleteProperty(target, key, receiver)
      trigger(target, key)
      return res
    }
  })

  return observer
}

export function shallowReactive() {}
