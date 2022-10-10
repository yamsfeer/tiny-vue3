// targetMap: { target: { key: [cb1, cb2] } }
const targetMap = new WeakMap()
let activeEffect = null

export function track(target, key) {
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }

  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
  }
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  depsMap.get(key).forEach(effect => effect && effect())
}

export function effect(handler, options = {}) {
  function __effect(...args) {
    activeEffect = __effect
    return handler(...args)
  }

  if (!options.lazy) {
    __effect()
  }

  return __effect
}
