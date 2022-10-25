const States = {
  DATA: 1,
  TAG_OPEN: 2,
  TAG_NAME: 3,
  TAG_END: 4,
  TAG_END_NAME: 5,
  TEXT: 6,
}

const LEFT_BRACKET = '<'
const RIGHT_BRACKET = '>'
const SLASH = '/'
const EQUAL = '='
const SPACE = /[\t\n\f\s]/
const ALPHABET = /[a-zA-Z]/
const SINGLE_QUOTE = '\''
const DOUBLE_QUOTE = '\"'

function isAlphabet(c) {
  return ALPHABET.test(c)
}

function isSpace(c) {
  return SPACE.test(c)
}

export function parse2(str) {

  let state = States.DATA
  const text = []
  const tokens = []

  function consume(nums = 1) {
    str = str.slice(nums)
  }

  while (str) {
    const c = str[0]
    switch (state) {
      case States.DATA:
        if (isAlphabet(c)) {
          state = States.TEXT
          text.push(c)
        }
        if (c === LEFT_BRACKET) state = States.TAG_OPEN
        consume()
        break;
      case States.TAG_OPEN:
        if (isAlphabet(c)) {
          state = States.TAG_NAME
          text.push(c)
        }
        if (c === SLASH) state = States.TAG_END
        consume()
        break;
      case States.TAG_NAME:
        if (isAlphabet(c)) {
          text.push(c)
        }
        if (c === RIGHT_BRACKET) {
          tokens.push({ type: 'tag', name: text.join('') }) // 获取一个 token
          text.length = 0
          state = States.DATA
        }
        consume()
        break;
      case States.TAG_END:
        if (isAlphabet(c)) {
          state = States.TAG_END_NAME
          text.push(c)
          consume()
        }
        break;
      case States.TAG_END_NAME:
        if (isAlphabet(c)) {
          text.push(c)
        }
        if (c === RIGHT_BRACKET) {
          state = States.DATA
          tokens.push({ type: 'tagend', name: text.join('') })
          text.length = 0
        }
        consume()
        break;
      case States.TEXT:
        if (isAlphabet(c)) {
          text.push(c)
        }
        if (c === LEFT_BRACKET) {
          state = States.TAG_OPEN
          tokens.push({ type: 'text', content: text.join('') })
          text.length = 0
        }
        consume()
        break;
      default:
        break;
    }
  }

  return tokens
}


export function parse(str) {

}
