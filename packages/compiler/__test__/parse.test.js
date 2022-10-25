import { describe, it } from 'vitest'
import { parse } from '../parse'

describe('parse', () => {
  it('parse template', () => {
    const code = `
      <div><p>vue</p><p>template</p></div>
    `
    const tokens = parse(code)
    console.log(tokens)
  })
})
