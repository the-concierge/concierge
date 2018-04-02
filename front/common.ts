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
  primary: (msg: string, duration?: number) => emitToast('toast-primary', msg, duration),
  error: (msg: string, duration?: number) => emitToast('toast-error', msg, duration),
  warn: (msg: string, duration?: number) => emitToast('toast-warning', msg, duration),
  success: (msg: string, duration?: number) => emitToast('toast-success', msg, duration)
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

export type Callback<T> = (value: T) => void
export function createEmitter<T>() {
  const listeners: Array<Callback<T>> = []
  const emitter = {
    on: (cb: Callback<T>) => listeners.push(cb),
    emit: (value: T) => listeners.forEach(cb => cb(value))
  }
  return emitter
}
