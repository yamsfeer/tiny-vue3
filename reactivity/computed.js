import { effect } from './effect.js'

export function computed(handler) {
  const run = effect(handler, { lazy: true })
  return {
    get value() {
      return run()
    }
  }
}
