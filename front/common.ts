type Listener = (path: string) => void
const navListeners: Listener[] = []

export function listen(listener: Listener) {
  navListeners.push(listener)
}

export function navigate(path: string) {
  for (const listener of navListeners) {
    listener(path)
  }
}

export const toast = {
  primary: (msg: string) => emitToast('toast-primary', msg),
  error: (msg: string) => emitToast('toast-error', msg),
  warn: (msg: string) => emitToast('toast-warning', msg),
  success: (msg: string) => emitToast('toast-success', msg)
}

function emitToast(cls: string, msg: string, duration: number = 5000) {
  const toast = {
    type: cls,
    msg,
    duration
  }

  for (const cb of toastListeners) {
    cb(toast)
  }
}

export interface Toast {
  type: string
  msg: string
  duration: number
}

const toastListeners: Function[] = []
export function onToast(cb: (toast: Toast) => void) {
  toastListeners.push(cb)
}

let refreshListener: Function = () => {}
export function onRefresh(cb: (resource: Refresh) => void) {
  refreshListener = cb
}

type Refresh = keyof typeof refresh
export const refresh = {
  containers: () => refreshListener('containers'),
  hosts: () => refreshListener('hosts'),
  images: () => refreshListener('images'),
  applications: () => refreshListener('applications'),
  credentials: () => refreshListener('credentials')
}
