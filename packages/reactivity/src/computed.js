import { isFunction, NOOP } from '@yamsvue/shared'
import { effect, track, trigger } from './effect.js'

/*
  const count = ref(0)
  const plus = computed(() => return ref.value + 1)

  const plusOne = computed({
    get: () => count.value + 1,
    set: (val) => {
      count.value = val - 1
    }
  })
 */

function normalize(getterOrOptions) {
  let getter, setter

  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions
    setter = NOOP // dev 环境下提供一个警告
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }

  return { getter, setter }
}

export function computed(getterOrOptions) {
  const { getter, setter } = normalize(getterOrOptions)

  let value // 缓存上一次计算的值
  let dirty = true // 是否需要重新计算

  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      dirty = true // 当依赖变化时，不直接求新值，而是将 dirty 改为 false
      trigger(obj, 'value')
    }
  })

  const obj = {
    get __v_isRef() { // computed 函数返回的是 ref 对象
      return true
    },
    get value() {
      if (dirty) {
        value = effectFn()
        dirty = false
      }

      track(obj, 'value') // 手动追踪依赖
      return value
    },
    set value(newValue) {
      setter(newValue)
    }
  }

  return obj
}
