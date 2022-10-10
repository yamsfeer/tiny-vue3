import { createRenderer } from '../runtime-core/renderer'
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'
import { isString } from '../shared'

let renderer = null
const rendererOptions = Object.assign({ patchProp }, nodeOps)

function ensureRenderer() {
  return renderer
    ? renderer // 防止多次创建 renderer
    : renderer = createRenderer(rendererOptions)
}

export function createApp(rootComponent, rootProps) {
  const renderer = ensureRenderer()
  const app = renderer.createApp(rootComponent, rootProps)

  const { mount } = app // 缓存平台无关的 mount 函数
  app.mount = containerOrSelector => { // 重写 mount 函数 ( 平台相关 )
    const container = normalizeContainer(containerOrSelector)
    if (!container) return

    if (!isFunction(component) && !component.render && !component.template) {
      component.template = container.innerHTML
    }

    container.innerHTML = ''
    const proxy = mount(container)

    if (container instanceof Element) {
      container.removeAttribute('v-cloak')
      container.setAttribute('data-v-app', '')
    }
    return proxy
  }
  return app
}

function normalizeContainer(container) {
  if (isString(container)) {
    return document.querySelector(container)
  }
  return container
}
