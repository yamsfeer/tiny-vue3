export const PatchFlags = {
  TEXT: 1, // 动态 textContent <div>{{ msg }}</div>
  CLASS: 1 << 1, // 动态 class <div :class="classname"></div>
  STYLE: 1 << 2, // 动态 style <div :style="styleobj"></div>
  PROPS: 1 << 3, // 动态 props <img :width="width" />
  FULL_PROPS: 1 << 4, // <h1 :[dynamicKey]="msg" >{{ msg }}</h1>
  HYDRATE_EVENTS: 1 << 5,
  STABLE_FRAGMENT: 1 << 6, // <template>标签中有多个根标签，会创建一个Fragment类型的vnode
  KEYED_FRAGMENT: 1 << 7, // <li v-for="item in items" :key="item"></li>
  UNKEYED_FRAGMENT: 1 << 8, // <template><span v-for="item in data"></span ></template>
  NEED_PATCH: 1 << 9,

  /* <Select>
      <template v-for="name in list" #[name]>{{ name }}</template>
     </Select> */
  DYNAMIC_SLOTS: 1 << 10,
  DEV_ROOT_FRAGMENT: 1 << 11, // <template>的根级存在注释，同时有多个标签，便签顺序不会变化

  /**
   * Indicates a hoisted static vnode. This is a hint for hydration to skip
   * the entire sub tree since static content never needs to be updated.
   */
  HOISTED: -1, // 静态标签
  /**
   * A special flag that indicates that the diffing algorithm should bail out
   * of optimized mode. For example, on block fragments created by renderSlot()
   * when encountering non-compiler generated slots (i.e. manually written
   * render functions, which should always be fully diffed)
   * OR manually cloneVNodes
   */
  BAIL: -2
}
