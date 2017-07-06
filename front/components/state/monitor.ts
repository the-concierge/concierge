import * as ko from 'knockout'
import socket from './socket'
import { ConciergeEvent } from './types'

class Monitor<T> {
  entries = ko.observableArray<string>([])

  constructor(public event: string, public name: string) {
    socket.on(event, (event: ConciergeEvent<T>) => {
      if (event.name !== name) {
        return
      }
      this.entries.push(JSON.stringify(event.event, null, 2))
    })
  }

}

export default Monitor