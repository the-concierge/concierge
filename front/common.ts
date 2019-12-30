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

export function elapsedSince(date: string | Date) {
  const elapsed = Math.floor((Date.now() - new Date(date).valueOf()) / 1000)
  const suffix = elapsed > 0 ? ' ago' : ''
  if (elapsed < 60 && elapsed > -60) return `a moment${suffix}`
  return toDuration(Math.floor(elapsed)) + suffix
}

function toDuration(valueSecs: number, full?: boolean) {
  const {
    duration: [days, hours, minutes, seconds]
  } = toRawDuration(valueSecs)

  if (full) {
    return [`${days}d`, `${hours}h`, `${minutes}m`, `${seconds}s`]
      .filter(time => !time.startsWith('0'))
      .join(':')
  }

  if (days) {
    return `${days} days`
  }

  if (hours) {
    return `${hours} hours`
  }

  if (minutes) {
    return `${minutes} mins`
  }

  return `${seconds} seconds`
}

const ONE_HOUR = 3600
const ONE_DAY = 86400

type Duration = [number, number, number, number]

function toRawDuration(valueSecs: number) {
  const abs = Math.abs(valueSecs)
  const days = Math.floor(abs / ONE_DAY)
  const hours = Math.floor(abs / ONE_HOUR) % 24
  const mins = Math.floor(abs / 60) % 60
  const secs = Math.ceil(abs % 60)

  return {
    duration: [days, hours, mins, secs] as Duration,
    seconds: abs,
    text: abs <= 0 ? 'now' : `${days}d:${hours}h:${mins}m:${secs}s`.replace('0d:', '')
  }
}
