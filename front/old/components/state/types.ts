import { ContainerInfo, ImageInfo } from 'dockerode'

export { State } from '../../../../src/api/applications/types'

type HostId = {
  concierge: {
    hostId: number
    host: {
      id: number
      hostname: string
      capacity: number
      dockerPort: number
      vanityHostname: string
    }
  }
}

export type Stats = {
  memory: string
  cpu: string
  mbIn: string
  mbOut: string
}

export interface ApplicationRemoteDTO extends Concierge.ApplicationRemote {
  image: KnockoutComputed<Image | undefined>
}

export type Container = ContainerInfo & HostId & { stats: Stats }

export type Image = ImageInfo & HostId & { name: string }

declare const _hostId: HostId
export interface ObservableContainer {
  id: KnockoutObservable<string>
  fullId: KnockoutObservable<string>
  image: KnockoutObservable<string>
  name: KnockoutObservable<string>
  restart: KnockoutObservable<string>
  status: KnockoutObservable<string>
  state: KnockoutObservable<string>
  stats: {
    mbIn: KnockoutObservable<string>
    mbOut: KnockoutObservable<string>
    cpu: KnockoutObservable<string>
    memory: KnockoutObservable<string>
  }
  ports: KnockoutObservableArray<{ url: string; private: number }>
  host: typeof _hostId.concierge.host
}
