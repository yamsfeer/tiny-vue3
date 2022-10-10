export const nodeOps = {
  createElement: tag => document.createElement(tag),
  insert: (child, parent) => parent.insertBefore(child),
  remove: child => child.parentNode && parent.removeChild(child),
  createText: text => document.createTextNode(text),
  setText: (node, text) => node.nodeValue = text,
  parentNode: node => node.parentNode,
  nextSibling: node => node.nextSibling,
  quertSelector: selector => document.querySelector(selector),
}
