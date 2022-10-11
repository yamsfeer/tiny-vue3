import { createVNode } from './vnode'

/* render 由 baseCreateRenderer 创建并传入
   柯里化保存 render 函数，使 createApp 与平台无关 */
export function createAppAPI(render) {
  /* 真正的 createAPP */
  return function createApp(rootComponent, rootProps = null) {
    let isMounted = false
    const context = createAppContext()

    const app = context.app = {
      get config() { },
      set config(v) { },
      use() { },
      mixin() { },
      component() { },
      directive() { },
      // ...

      // 平台无关的 mount 函数，将在 runtime-dom 中被重写
      mount(rootContainer) {
        if (isMounted) {
          return
        }
        // 创建 vnode
        const vnode = createVNode(rootComponent, rootProps)

        vnode.appContext = context
        // 渲染 vnode
        render(vnode, rootContainer)
        isMounted = true
        app._container = rootContainer

        return vnode.component.proxy
      },
      unmount() {},
      provide() {}
    }

    return app
  }
}

export function createAppContext() {
  return {
    app: null,
    config: {
      compileOptions: {}
    },
    mixins: [],
    directives: [],
    components: {}
    // ...
  }
}
