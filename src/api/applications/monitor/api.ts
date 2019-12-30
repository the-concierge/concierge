import { queue, BuildQueueItem } from './queue'
import { State } from '../types'

export function getQueue() {
  const items = queue.queue
  const progress = items
    .filter(i => i.state === State.Waiting || i.state === State.Building)
    .map(toQueueItem)
  const done = items
    .filter(i => i.state === State.Failed || i.state === State.Successful)
    .map(toQueueItem)
  return {
    progress,
    done
  }
}

function toQueueItem(item: BuildQueueItem): Concierge.QueueItem {
  return {
    app: {
      id: item.app.id,
      name: item.app.name
    },
    age: item.age.toISOString(),
    ref: item.ref,
    sha: item.sha,
    state: toString(item.state),
    stateId: item.state
  }
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
