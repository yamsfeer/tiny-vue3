import { track, trigger } from './effect.js'
import { isRef } from './ref.js'
import { isObject, hasChanged } from '../shared/index.js'

export const ReactiveFlags = {
  IS_REACTIVE: '__v_isReactive',
  IS_READONLY: '__v_isReadonly',
  IS_SHALLOW: '__v_isShallow',
}

const proxyMap = new WeakMap() // plainObj => reactive(plainObj) 防止重复响应式处理同一对象

function createReactiveObject(target, isShallow = false, isReadonly = false) {
  // 非对象、reactive 对象、已经响应式处理过的对象、readonly 对象，都直接返回
  if (!isObject(target)) return target
  if (isReactive(target)) return target
  if (isReadonly(target)) return target

  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }

  const observer = new Proxy(target, {
    get(target, key, receiver) {
      // 代理而不真正挂载属性，用于判断 isReactive 等
      if (key === ReactiveFlags.IS_REACTIVE) return true
      if (key === ReactiveFlags.IS_READONLY) return isReadonly
      if (key === ReactiveFlags.IS_SHALLOW) return isShallow

      if (!isReadonly) { // 只读对象不需要追踪变化
        track(target, key)
      }

      const res = Reflect.get(target, key, receiver)

      // isRef 判断要在 isObject 之前，因为 res 是对象
      if (isRef(res)) return res.value
      // shallow 直接返回
      if (isShallow) return res
      // 否则转为响应式
      if (isObject(res)) return isReadonly ? readonly(res) : reactive(res)

      return res
    },
    set(target, key, value, receiver) {
      if (isReadonly) return true

      const oldValue = target[key]

      if (!hasChanged(value, oldValue)) { // 只有值改变的情况下才执行 trigger
        return value
      }

      if (isRef(oldValue) && !isRef(value)) {
        oldValue.value = value
        return true
      }

      // 要先设置新值，然后派发更新
      const res = Reflect.set(target, key, value, receiver)
      trigger(target, key)

      return res
    },
    deleteProperty(target, key, receiver) { },
    has() { },
    ownKeys() { },
  })

  proxyMap.set(target, observer)

  return observer
}

export function reactive(target) {
  return createReactiveObject(target, false /* isShallow */)
}

export function isReactive(value) {
  return !!(value && value[ReactiveFlags.IS_REACTIVE])
}

export function isReadonly(value) {
  return !!(value && value[ReactiveFlags.IS_READONLY])
}

export function isShallow(value) {
  return !!(value && value[ReactiveFlags.IS_SHALLOW])
}

export function toReactive(value) {
  return isObject(value) ? reactive(value) : value
}

export function shallowReactive(target) {
  return createReactiveObject(target, true /* isShallow */)
}

export function readonly(target) {
  return createReactiveObject(target, false /* isShallow */, true /* isReadonly */)
}

export function shallowReadonly(target) {
  return createReactiveObject(target, true /* isShallow */, true /* isReadonly */)
}
