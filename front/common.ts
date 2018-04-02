const navEmitter = createEmitter<string>()
export function onNavigate(cb: (path: string) => void) {
  navEmitter.on(cb)
}

export function navigate(path: string) {
  navEmitter.emit(path)
}

const toastEmitter = createEmitter<Toast>()
export function onToast(cb: (toast: Toast) => void) {
  toastEmitter.on(cb)
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

  toastEmitter.emit(toast)
}

export interface Toast {
  type: string
  msg: string
  duration: number
}

const refreshEmitter = createEmitter<Refresh>()

export function onRefresh(cb: (resource: Refresh) => void) {
  refreshEmitter.on(cb)
}

type Refresh = keyof typeof refresh
export const refresh = {
  containers: () => refreshEmitter.emit('containers'),
  hosts: () => refreshEmitter.emit('hosts'),
  images: () => refreshEmitter.emit('images'),
  applications: () => refreshEmitter.emit('applications'),
  credentials: () => refreshEmitter.emit('credentials'),
  config: () => refreshEmitter.emit('config'),
  queue: () => refreshEmitter.emit('queue')
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
