import * as Promise from 'promise-polyfill'
if (typeof window['Promise'] !== undefined) {
  window['Promise'] = Promise
}
