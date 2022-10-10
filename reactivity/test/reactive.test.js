import { reactive } from '../reactive.js'
import { assert } from 'chai'

describe('reactive', () => {
  it('target 为基本类型直接返回', () => {
    const p1 = reactive(1)
    const p2 = reactive(false)

    assert.equal(p1, 1)
    assert.equal(p2, false)
  })
})
