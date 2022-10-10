import { ShapeFlags } from '../shared/shapeFlag'
import { Text, isSameVNodeType, normalizeVNode } from './vnode'
import { renderComponentRoot, shouldUpdateComponent } from './componentRenderUtils'

import {
  createComponentInstance,
  setupComponent
} from './component'
import { EMPTY_ARR, EMPTY_OBJ } from '../shared'

export function createPatchFn(options) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setText: hostSetText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
  } = options

  /* Text */
  function processText(n1, n2, container) {
    if (n1 === null) {
      n2.el = hostCreateText(n2.children)
      hostInsert(n2.el, container)
    } else {
      const el = n2.el = n1.el
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children)
      }
    }
  }

  /* Element */
  function processElement(n1, n2, container, parentComponent) {
    n1 === null
      ? mountElement(n2, container) // 首次渲染
      : patchElement(n1, n2, parentComponent) // 非首次渲染
  }

  function mountElement(vnode, container) {
    const { type, props, shapeFlag } = vnode

    // 创建 dom 元素节点
    let el = vnode.el = hostCreateElement(type)

    // 处理 children
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, vnode.children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(
        vnode.children,
        el,
        null,
        parentComponent,
      )
    }

    // 处理 props，为 dom 元素节点添加 class、style、event 等属性
    if (props) {
      for (const key of Object.keys(props)) {
        if (key !== 'value' && !isReservedProp(key)) {
          hostPatchProp(el, key, null, props[key])
        }
      }
    }

    // 挂载 dom 元素到 container，先子后父
    hostInsert(el, container)
  }

  function mountChildren(children, container) {
    for (const child of children) {
      // 用 patch 而不用 mountElement 是因为子节点可能有其他类型 vnode，如组件 vnode
      patch(null, normalizeVNode(child), container)
    }
  }

  function patchElement(n1, n2, parentComponent) {
    const el = n2.el = n1.el
    let { patchFlag } = n2
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ

    patchFlag = patchFlag | n1.patchFlag & PatchFlags.FULL_PROPS

    // full diff
    patchChildren(n1, n2, el, parentComponent)
  }

  function patchProps(el, vnode, oldProps, newProps, parentComponent) {
    if (oldProps === newProps) {
      return
    }

    if (oldProps !== EMPTY_OBJ) {
      for (const key in oldProps) {
        if (!isReservedProp(key) && !(key in newProps)) {
          hostPatchProp(el, key, oldProps[key])
        }
      }
    }

    for (const key in newProps) {
      // empty string is not valid prop
      if (isReservedProp(key)) continue
      const next = newProps[key]
      const prev = oldProps[key]
      // defer patching value
      if (next !== prev && key !== 'value') {
        hostPatchProp(el, key, prev, next,)
      }
    }
  }

  function patchChildren(n1, n2, container, parentComponent) {
    const c1 = n1 && c1.children
    const prevShapeFlag = n1 ? n1.shapeFlag : 0

    const c2 = n2.children
    const { patchFlag, shapeFlag } = n2

    // 如果有 patchFlag，可以快速找到要更新的地方
    if (patchFlag > 0) {
      if (patchFlag & PatchFlags.KEYED_FRAGMENT) {
        patchKeyedChildren(c1, c2, container, parentComponent)
      }
      if (patchFlag & PatchFlags.UNKEYED_FRAGMENT) {
        patchUnkeyedChildren(c1, c2, container, parentComponent)
      }
      return
    }

    // children 有三种可能：text, array, no children
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) { // new children 是文本
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) { // prev children 是数组
        unmountChildren(c1, parentComponent) // 清空 prev children
      }
      if (c2 !== c1) { // 都是文本但内容不同
        hostSetElementText(container, c2) // 直接插入文本
      }
    } else {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) { // prev children 是数组
        shapeFlag & ShapeFlags.ARRAY_CHILDREN
          ? patchKeyedChildren(c1, c2, container, parentComponent) // prev new children 都是数组，执行 diff 算法
          : unmountChildren(c1, parentComponent) // 无 new children，清空 prev children
      } else {
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(container, '')
        }
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2, container, parentComponent)
        }
      }
    }
  }
  function patchKeyedChildren(c1, c2, container, parentComponent) {
    let i = 0
    let e1 = c1.length - 1
    let e2 = c2.length - 1

    // 1.  预处理 左边
    while(i <= e1 && i <= e2) {
      const n1 = c1[i], n2 = c2[i]
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent)
      } else {
        break
      }
      i++
    }
    // 2. 预处理 右边
    while (i <= e1 && i <= e2) {
      const n1 = c1[i], n2 = c2[i]
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent)
      } else {
        break
      }
      e1--
      e2--
    }

    // 3. 最长递增子序列
    // ...
  }
  function patchUnkeyedChildren(c1, c2, container, parentComponent) {
    c1 = c1 || EMPTY_ARR
    c2 = c2 || EMPTY_ARR

    const oldLength = c1.length
    const newLength = c2.length
    const commonLength = Math.min(oldLength, newLength)
    let i
    for (i = 0; i < commonLength; i++) {
      const nextChild = normalizeVNode(c2[i])
      patch(c1[i], nextChild, container, parentComponent)
    }
    if (oldLength > newLength) {
      // remove old
      unmountChildren(c1, parentComponent, commonLength)
    } else {
      // mount new
      mountChildren(c2, container, parentComponent, commonLength)
    }
  }

  /* Component */
  function processComponent(n1, n2, container) {
    n1 === null
      ? mountComponent(n2, container) // 挂载组件
      : updateComponent(n1, n2) // 更新组件
  }

  function mountComponent(initialVNode, container, parentComponent) {
    // 创建组件实例
    const instance
      = initialVNode.component
      = createComponentInstance(initialVNode, parentComponent)
    // 设置组件实例
    setupComponent(instance)
    // 设置并运行带副作用的渲染函数
    setupRenderEffect(instance, initialVNode, container)
  }

  function setupRenderEffect(instance, initialVNode, container) {
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        const { el, props } = initialVNode
        const { bm, m, parent } = instance // hooks

        const subTree
          = instance.subTree
          = renderComponentRoot(instance)

        patch(null, subTree, container, instance)

        initialVNode.el = subTree.el
        instance.isMounted = true
      } else {
        let { next, vnode } = instance

        if (next) { // next 表示新的组件 vnode
          next.el = vnode.el
          updateComponentPreRender(instance, next)
        } else {
          next = vnode
        }

        const nextTree = renderComponentRoot(instance) // 渲染新的子树 vnode
        const prevTree = instance.subTree // 缓存旧的子树 vnode
        instance.subTree = nextTree // 更新子树 vnode

        // 组件更新
        patch(prevTree, nextTree, hostParentNode(prevTree.el), instance)
      }
    }

    const effect = instance.effect = new ReactiveEffect(componentUpdateFn, () => queueJob(update))
    const update = instance.update = () => effect.run() // SchedulerJob
    update()
  }

  function updateComponent(n1, n2) {
    const instance = n2.component = n1.component
    if (shouldUpdateComponent(n1, n2)) {
      // normal update
      instance.next = n2
      // in case the child component is also queued, remove it to avoid
      // double updating the same child component in the same flush.
      invalidateJob(instance.update)
      // instance.update is the reactive effect.
      instance.update() // 在 componentUpdateFn 中定义，instance.update = () => effect.run()
    } else {
      n2.el = n1.el
      instance.vnode = n2
    }
  }

  return function patch(n1, n2, container, parentComponent) {
    if (n1 === n2) {
      return
    }

    // 新旧 vnode 类型不同，则直接销毁旧节点，重新渲染挂载新节点
    if (n1 && !isSameVNodeType(n1, n2)) {
      unmount(n1, parentComponent)
      n1 = null // 旧 vnode 设为 null，后面都会 mount 而不是 update
    }

    /* type 判断是否为文本、注释、fragment 节点
       如果不是，则是 element 或 component vnode 对象，用 shapeflag 判断 */
    const { type, shapeFlag } = n2
    switch (type) {
      case Text:
        processText(n1, n2, container)
        break
      // case Comment:
      // case Static:
      // case Fragment:
      default:
        // shapeFlag 的 bitmap 位运算
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container)
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          processComponent(n1, n2, container)
        }
    }
  }
}
