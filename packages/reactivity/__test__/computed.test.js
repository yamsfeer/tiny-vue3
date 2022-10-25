import { reactive } from '../src/reactive.js'
import { ref, isRef } from '../src/ref.js'
import { computed } from '../src/computed.js'
import { describe, expect, it } from 'vitest'
import { vi } from 'vitest'

/**
 * 接受 getter 函数，返回只读的响应式 ref 对象
 *   - computed 响应
 *   _ computed 只读
 * 可写的计算属性
 * 只有访问到时才计算
 */

describe('computed', () => {
  it('should accept getter, return ref object', () => {
    const count = ref(1)
    const plusOne = computed(() => count.value + 1)

    expect(isRef(plusOne)).to.equal(true)
  })

  /* it('should be reactive', () => {
    const count = ref(1)
    const plusOne = computed(() => count.value + 1)

    expect(plusOne.value).to.equal(2)
    count.value++
    expect(plusOne.value).to.equal(3)
  }) */

  /* it('should be readonly', () => {
    const count = ref(1)
    const plusOne = computed(() => count.value + 1)

    expect.fail(plusOne.value++)
  }) */

  it('should support setter', () => {
    const count = ref(1)
    const plusOne = computed({
      get: () => count.value + 1,
      set: (val) => {
        count.value = val - 1
      }
    })

    plusOne.value = 1
    expect(count.value).to.equal(0)
    expect(plusOne.value).to.equal(1)
  })

  it('should compute lazily', () => {
    const value = reactive({})
    const spy = {
      getter: () => value.foo
    }

    const getter = vi.spyOn(spy, 'getter')
    const foo = computed(getter)

    // lazy
    expect(getter).not.toHaveBeenCalled()

    expect(foo.value).toBe(undefined)
    expect(getter).toHaveBeenCalledTimes(1)

    // should not compute again
    foo.value
    expect(getter).toHaveBeenCalledTimes(1)

    // should not compute until needed
    // value.foo = 1
    // expect(getter).toHaveBeenCalledTimes(1)

    // // now it should compute
    // expect(foo.value).toBe(1)
    // expect(getter).toHaveBeenCalledTimes(2)

    // // should not compute again
    // foo.value
    // expect(getter).toHaveBeenCalledTimes(2)
  })
})
