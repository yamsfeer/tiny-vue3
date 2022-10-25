import { describe, expect, it, vi } from 'vitest'
import { reactive } from '../src/reactive'
import { watch } from '../src/watch'

describe('watch', () => {
  it('watch reactive object', () => {
    const observed = reactive({ foo: 1 })
    const spy = {
      cb() { }
    }
    const cb = vi.spyOn(spy, 'cb')

    watch(observed, cb)

    expect(cb).toHaveBeenCalledTimes(1)
    observed.foo = 2
    expect(cb).toHaveBeenCalledTimes(2)
  })
})
