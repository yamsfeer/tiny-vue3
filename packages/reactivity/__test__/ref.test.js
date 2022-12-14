import { describe, expect, it } from 'vitest'
import { effect } from '../src/effect.js'
import { ref } from '../src/ref.js'

describe('ref', () => {
  it('should hold a value', () => {
    const a = ref(0)
    expect(a.value).to.equal(0)
    a.value = 2
    expect(a.value).to.equal(2)
  })

  it('should be reactive', () => {
    const a = ref(1)
    let dummy = null, calls = 0
    effect(() => {
      calls++
      dummy = a.value
    })
    expect(calls).to.equal(1)
    expect(dummy).to.equal(1)
    a.value = 2
    expect(calls).to.equal(2)
    expect(dummy).to.equal(2)
    a.value = 2 // same value should not trigger
    expect(calls).to.equal(2)
  })

  it('should make nested properties reactive', () => {
    const a = ref({ count: 1 })
    let dummy
    effect(() => dummy = a.value.count)
    expect(dummy).to.equal(1)
    a.value.count = 2
    expect(dummy).to.equal(2)
  })

  it('should work without initial value', () => {
    const a = ref()
    let dummy
    effect(() => {
      dummy = a.value
    })
    expect(dummy).to.equal(undefined)
    a.value = 2
    expect(dummy).to.equal(2)
  })

})
