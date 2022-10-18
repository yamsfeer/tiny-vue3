import { track, trigger } from './effect.js'
import { toReactive, isReadonly, isShallow } from './reactive.js'
import { isObject, hasChanged } from '../shared/index.js'

function createRef(rawValue, shallow = false) {
  if (isRef(rawValue)) {
    return rawValue
  }

  // 如果传入一个对象，直接转为 reactive
  let value = shallow ? value : toReactive(rawValue)

  const proxy = {
    get __v_isRef() {
      return true
    },
    get value() {
      track(proxy, 'value')
      return value
    },
    set value(newValue) {
      if (!hasChanged(newValue, value)) {
        return newValue
      }

      const useDirectValue = shallow || isShallow(newValue) || isReadonly(newValue)
      value = useDirectValue ? newValue : toReactive(newValue)

      trigger(proxy, 'value')
    }
  }

  return proxy
}

export function ref(value) {
  return createRef(value)
}

export function shallowRef(value) {
  return createRef(value, true /* isShallow */)
}

export function isRef(r) {
  return !!(r && r.__v_isRef === true)
}

/* toRef 和 toRefs 解决响应丢失问题 */
/* const obj = reactive({ foo: 1, bar: 2 })
   const newObj = {...obj} */
export function toRef(obj, key) {
  const value = obj[key]
  if (isRef(value)) {
    return value
  }
  return {
    get __v_isRef() {
      return true
    },
    get value() {
      return obj[key]
    },
    set value(newVal) {
      obj[key] = newVal
    }
  }
}

export function toRefs(obj) {
  const res = {}
  for (const key in obj) {
    res[key] = toRef(obj, key)
  }
  return res
}

/* 用代理处理一个响应式对象，使其自动脱 ref */
export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key, receiver) {
      return unref(Reflect.get(target, key, receiver))
    },
    set(target, key, value, receiver) {
      const oldValue = target[key]

      if (isRef(oldValue) && !isRef(value)) {
        oldValue.value = value
        return true
      } else {
        return Reflect.set(target, key, value, receiver)
      }
    }
  })
}

export function unref(ref) {
  return isRef(ref) ? ref.value : ref
}
