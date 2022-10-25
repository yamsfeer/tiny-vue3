import { describe, expect, it } from 'vitest'
import { reactive, isReactive } from '../src/reactive.js'
import { ref, isRef } from '../src/ref.js'

/**
 * 基本类型 => 返回其本身
 * 普通对象 => 将其转为响应式对象
 * reactive 对象 => 返回其本身
 * 已被响应式处理的普通对象 => 返回已有的响应式对象
 * 普通对象嵌套 => 将嵌套的对象也转为响应式
 *
 * ref 对象 或 嵌套的 ref 对象 => 解包
 */

describe('reactive', () => {
  it('target is object', () => {
    const original = { foo: 1 }
    const observed = reactive(original)

    expect(observed).not.to.equal(original)

    expect(isReactive(observed)).toBe(true)
    expect(isReactive(original)).toBe(false)

    expect(observed.foo).toBe(1) // get
    // expect('foo' in observed).toBe(true) // has
    // expect(Object.keys(observed)).toContain('foo') // ownKeys
  })

  it('target is reactive', () => {
    const original = { foo: 1 }
    const observed1 = reactive(original)
    const observed2 = reactive(observed1)

    expect(observed1).toEqual(observed2)
  })

  it('reactive one object for multi times', () => { // existing proxy
    const original = { foo: 1 }
    const observed1 = reactive(original)
    const observed2 = reactive(original)

    expect(observed1).toEqual(observed2)
  })

  it('nested reactive', () => {
    const original = {
      nested: {
        foo: 1
      },
      array: [{ bar: 2 }]
    }
    const observed = reactive(original)

    expect(isReactive(observed.nested)).toEqual(true)
    // expect(isReactive(observed.array)).toEqual(true)
    // expect(isReactive(observed.array[0])).toEqual(true)
  })

  it('unref', () => {
    const count = ref(1)
    const obj = reactive({ count })

    expect(obj.count).toEqual(count.value)

    count.value++
    expect(count.value).toEqual(2)
    expect(obj.count).toEqual(2)

    obj.count++
    expect(obj.count).toEqual(3)
    expect(count.value).toEqual(3)
  })
})
