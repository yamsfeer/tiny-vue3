export function shouldUpdateComponent(prevVnode, nextVnode) {
  const { props: prevProps, children: prevChildren } = prevVnode
  const { props: nextProps, children: nextChildren, patchFlag } = nextVnode

  if (prevChildren || nextChildren) {
    if (!nextChildren || !nextChildren.$stable) {
      return true
    }
  }
  if (prevProps === nextProps) return false
  if (!prevProps) return !!nextProps
  if (!nextProps) return true

  return hasPropsChanged(prevProps, nextProps)
}

function hasPropsChanged(prevProps, nextProps) {
  const nextKeys = Object.keys(nextProps)
  const prevKeys = Object.keys(nextProps)

  return nextKeys.length !== prevKeys.length // props 数量不同
    || nextKeys.some(key => nextProps[key] !== prevProps[key]) // props 值不同
}

// 调用组件的 render 函数，获得组件 subTree
export function renderComponentRoot(instance) {
  const {
    type,
    props,
    render,
    withProxy,
    proxy,
    vnode,
    setupState
  } = instance

  let result
  // const prev = setCurrentRenderingInstance(instance)

  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    const proxyToUse = withProxy || proxy
    const rootVnode = render.call(proxyToUse, props, setupState)

    result = normalizeVNode(rootVnode) // instance.subTree
  }

  // setCurrentRenderingInstance(prev)
  return result
}
