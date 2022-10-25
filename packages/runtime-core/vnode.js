import { isString, isFunction, isObject, extend } from '../shared'
import { ShapeFlags } from '../shared/shapeFlag'

export const Text = Symbol('Text')
export const Comment = Symbol('Comment')
export const Static = Symbol('Static')
export const Fragment = Symbol('Fragment')

export function createVnode(type, props, children) {
  // normalize 参数
  // class & style normalization.

  // 对 props 做标准化处理
  if (props) {
    // for reactive or proxy objects, we need to clone it to enable mutation.
    props = guardReactiveProps(props)
    let { class: cls, style } = props
    if (cls && !isString(cls)) {
      props.class = normalizeClass(cls)
    }
    if (isObject(style)) {
      // reactive state objects need to be cloned since they are likely to be mutated
      if (isProxy(style) && !isArray(style)) {
        style = extend({}, style)
      }
      props.style = normalizeStyle(style)
    }
  }

  // 编码 vnode 类型
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
      ? ShapeFlags.STATEFUL_COMPONENT
        : isFunction(type)
          ? ShapeFlags.FUNCTIONAL_COMPONENT
          : 0

  return createBaseVNode(type, props, children, shapeFlag)
}

function createBaseVNode(type, props, children, shapeFlag) {
  const vnode = {
    type,
    props,
    children,
    shapeFlag,
    el: null,
    appContext: null,
    component: null
    // ...
  }

  // 标准化子节点
  if (children) {
    // compiled element vnode - if children is passed, only possible types are
    // string or Array.
    vnode.shapeFlag = vnode.shapeFlag | isString(children)
      ? ShapeFlags.TEXT_CHILDREN
      : ShapeFlags.ARRAY_CHILDREN
  }

  return vnode
}

export function normalizeVNode(child) {
  if (child === null || typeof child === 'boolean') {
    return createVnode(Comment)
  }

  if (isArray(child)) {
    return createVnode(Fragment, null, child.slice())
  }

  if (isObject(child)) {
    return cloneIfMounted(child)
  }

  return createVnode(Text, null, String(child))
}

export function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key
}
