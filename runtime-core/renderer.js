import { createAppAPI } from './apiCreateApp'
import { createPatchFn } from './patch'

export function createRenderer(options) {
  return baseCreateRenderer(options)
}

function baseCreateRenderer(options) {
  function render(vnode, container) {
    if (vnode === null) {
      // 销毁组件
      if (container._vnode) {
        unmount(container._vnode)
      }
    } else {
      // 创建或更新组件
      const patch = createPatchFn(options)
      // container._vnode 缓存的是旧 vnode
      patch(container._vnode || null, vnode, container)
    }
    // flushPreFlushCbs()
    // flushPostFlushCbs()

    // 缓存 vnode，表示已经渲染
    container._vnode = vnode
  }

  return {
    render,
    createApp: createAppAPI(render)
  }
}
