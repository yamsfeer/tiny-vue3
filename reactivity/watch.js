import { isFunction, isObject } from '../shared';
import { effect } from './effect';

function traverse(value, seen = new Set) {
  // 不是对象或已经被访问过
  if (!isObject(value) || seen.has(value)) return

  seen.add(value)
  for (const key in value) {
    traverse(value[key], seen)
  }
}

// source 是响应式对象或 getter 函数
export function watch(source, cb, options) {
  const getter = isFunction(source)
    ? source
    : () => traverse(source)

  let newValue, oldValue
  let cleanup

  // 用于注册过期回调，解决竞态问题
  function onInvalidate(fn) {
    cleanup = fn
  }

  const job = () => {
    newValue = effectFn()
    cleanup && cleanup() // 调用回调函数前，先调用过期回调

    cb(newValue, oldValue, onInvalidate)
    oldValue = newValue
  }

  const scheduler = () => {
    // pre、sync、post 意为组件更新前、时、后
    if (options.flush === 'post') {
      Promise.resolve().then(job) // 将副作用函数放到微任务中
    } else if (options.flush === 'pre') {
    } else {
      job() // 默认 flush 为 sync
    }
  }

  const effectFn = effect(
    () => getter(), // 递归访问目标的所有属性，触发依赖收集
    {
      lazy: true,
      scheduler // 属性变化时调用，即 trigger 才会调用
    }
  )

  if (options.immediate) {
    job()
  } else {
    oldValue = effectFn()
  }
}
