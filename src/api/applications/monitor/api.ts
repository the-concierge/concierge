import queue from './queue'
import { State } from '../types'

export function getQueue() {
  const items = queue.queue.map(q => {
    return {
      app: {
        id: q.app.id,
        name: q.app.name
      },
      ref: q.ref,
      sha: q.sha,
      state: toString(q.state),
      stateId: q.state
    }
  })
  return items
}

export function cancelItem(_appId: number, _ref: string) {
  throw new Error('Not yet supported')
}

export function forceBuild(_appId: number, _ref: string) {
  throw new Error('Not yet supported')
}

function toString(state: State) {
  switch (state) {
    case State.NotDetermined:
      return 'Not Determined'
    default:
      return State[state]
  }
}
