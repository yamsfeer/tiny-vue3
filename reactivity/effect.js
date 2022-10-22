const effectStack = []
let activeEffect = null

export function effect(fn, options = {}) {
  function effectFn() {
    cleanup(effectFn) // cleanup: 清空旧副作用函数

    activeEffect = effectFn // 设置当前的 activeEffect
    effectStack.push(effectFn)

    const res = fn()

    activeEffect = effectStack.pop() // 恢复 effect

    return res
  }

  effectFn.deps = [] // cleanup: 用来存储包含当前 effectFn 的依赖集合，用于 cleanup

  if (options.scheduler) {
    effectFn.scheduler = options.scheduler
  }

  if (!options.lazy) { // computed 的 lazy 为 true
    effectFn()
  }

  return effectFn
}

// 执行副作用函数前，需要清空旧的副作用函数，避免副作用函数遗留
/* effect(() => obj.ok ? obj.text : 'text')
   ok => Set(effectFn)
   text => Set(effectFn)
   当 ok 为 false 时，对 text 的响应式依赖是不必要的 */
function cleanup(effectFn) {
  effectFn.deps.forEach(deps => deps.delete(effectFn)) // 清空依赖集合对 effectFn 的引用
  effectFn.deps.length = 0 // 清空 effectFn 对依赖集合的引用
}

/*
targetMap: { // 所有 reactive 的对象
  target: { // 一个 reactive 的所有 key
    key: [effect1, effect2] // 一个 key 的所有 effect
  }
}
*/
const targetMap = new WeakMap

export function track(target, key) {
  if (!activeEffect) return

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map))
  }

  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set))
  }

  deps.add(activeEffect)

  // cleanup: deps 是与当前 effectFn 存在联系的依赖集合
  activeEffect.deps.push(deps)
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return // 没有当前对象的订阅者

  const effects = depsMap.get(key)
  if (!effects) return // 没有当前 key 的订阅者

  /* cleanup: 构造新的集合来遍历执行 effectFn 可以避免无限执行的问题
     forEach 遍历 set 集合时，如果一个值已被访问过但又重新添加到集合
     且遍历还未结束，该值会被重新访问
     每次调用 effectFn 都会先 cleanup 删除 effectFn，然后重新收集，形成循环 */
  const effectsToRun = new Set()

  effects && effects.forEach(effectFn => {
    /* 如果当前副作用函数正在被收集依赖，则不能执行
       const obj = reactive({ foo: 1 })
       obj.foo++ 既读取又设置 foo 的值
       读取时将副作用函数添加到依赖集合，设置时又执行该副作用函数
       但该副作用函数正在执行，这会形成递归调用自己 */
    // if (activeEffect !== effectFn) {
    effectsToRun.add(effectFn)
    // }
  })

  effectsToRun.forEach(effectFn => {
    if (effectFn.scheduler) {
      effectFn.scheduler()
    } else {
      effectFn()
    }
  })
}
