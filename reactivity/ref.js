import { track, trigger } from './effect.js'
import { reactive } from './reactive.js'
import { isObject } from '../shared/index.js'

export function ref(target) {
  if (isObject(target)) {
    target = reactive(target)
  }
  return shallowRef(target)
}

export function shallowRef(target) {
  let value = target
  const obj = {
    get value() {
      track(obj, 'value') // 收集依赖
      return value
    },
    set value(newVal) {
      if (newVal === value) {
        return
      }
      value = newVal
      trigger(obj, 'value') // 派发更新
    }
  }
  return obj
}
