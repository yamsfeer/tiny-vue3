import { isFunction, isObject } from '../shared';
import { ShapeFlags } from '../shared/shapeFlag';
import { createAppContext } from './apiCreateApp';

const emptyAppContext = createAppContext()
let uid = 0

// 创建组件实例
export function createComponentInstance(vnode, parent) {
  const type = vnode.type
  const appContext =
    (parent ? parent.appContext : vnode.appContext) || emptyAppContext

  const instance = {
    uid: uid++,
    vnode,
    type,
    parent,
    appContext,
    root: null, // to be immediately set
    next: null,
    subTree: null, // will be set synchronously right after creation
    effect: null,
    update: null, // will be set synchronously right after creation
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,

    // state
    // lifecycle hooks
    // ...
  }

  instance.root = parent ? parent.root : instance

  return instance
}

// 设置组件实例，主要针对 stateful 组件
export function setupComponent(instance) {
  const { props, children } = instance.vnode
  const isStateful = isStatefulComponent(instance)

  // initProps(instance, props, isStateful)
  // initSlots(instance, children)

  const setupResult = isStateful
    ? setupStatefulComponent(instance)
    : undefined
  return setupResult
}

export function isStatefulComponent(instance) {
  return instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT
}

// 处理 setup 函数
export function setupStatefulComponent(instance) {
  const Component = instance.type

  // 创建渲染代理的属性访问缓存
  instance.accessCache = {}
  // 创建渲染上下文代理，get、set、has、defineProperty
  // 类似 this._data.msg => this.msg
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers)

  // 处理 setup 函数
  const { setup } = Component

  setup
    ? startComponentSetup(instance, setup)
    : finishComponentSetup(instance)
}

function startComponentSetup(instance, setup) {
  // 如果 setup 带参数，则创建一个 setupContext
  const setupContext
    = instance.setupContext
    = setup.length > 1
      ? createSetupContext(instance)
      : null

  // 执行 setup 函数
  const setupResult = setup(setupContext)
  // 处理 setup 执行结果
  handleSetupResult(instance, setupResult)
}

function handleSetupResult(instance, setupResult) {
  if (isFunction(setupResult)) {
    instance.render = setupResult
  } else if (isObject(setupResult)) {
    // proxyRefs: isReactive(objWithRefs)
    // ? objWithRefs
    // : new Proxy(objWithRefs, shallowUnwrapHandler)
    instance.setupState = proxyRefs(setupResult)
  }

  finishComponentSetup(instance)
}

let compile // 模板编译函数
export function registerRuntimeCompiler(_compile) {
  compile = _compile
}

// 获取 render 函数
export function finishComponentSetup(instance) {
  const Component = instance.type

  if (!instance.render) {
    if (compile && !Component.render) { // 模板未编译
      const template = Component.template

      if (template) {
        Component.render = compile(template) // 编译模板
      }
    }

    instance.render = Component.render || nodeOps
  }
}
