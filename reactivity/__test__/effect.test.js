import { describe, expect, it } from 'vitest'
import { effect } from '../effect'
import { reactive } from '../reactive'

describe('effect', () => {
  it('should call', () => {
    const observed = reactive({ foo: 1 })

    let dummy
    effect(() => dummy = observed.foo)

    expect(dummy).toEqual(1)
    observed.foo = 2
    expect(dummy).toEqual(2)
  })
})
