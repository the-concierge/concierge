type Listener = (path: string) => void
const listeners: Listener[] = []

export function listen(listener: Listener) {
  listeners.push(listener)
}

export function navigate(path: string) {
  for (const listener of listeners) {
    listener(path)
  }
}
