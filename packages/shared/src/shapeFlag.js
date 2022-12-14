export const ShapeFlags = {
  ELEMENT: 1, // HTML ELEMENT
  FUNCTIONAL_COMPONENT: 1 << 1, // 函数是组件
  STATEFUL_COMPONENT: 1 << 2, // 普通组件
  TEXT_CHILDREN: 1 << 3,
  ARRAY_CHILDREN: 1 << 4,
  SLOTS_CHILDREN: 1 << 5,
  TELEPORT: 1 << 6,
  SUSPENSE: 1 << 7,
  COMPONENT_SHOULD_KEEP_ALIVE: 1 << 8,
  COMPONENT_KEPT_ALIVE: 1 << 9,
}
// Cannot access 'ShapeFlags' before initialization
ShapeFlags.COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT
