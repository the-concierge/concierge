import { ContainerInfo, ImageInfo } from 'dockerode'

export { State } from '../../../src/api/applications/types'

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

export interface ApplicationRemoteDTO extends Concierge.ApplicationRemote {}

export type Container = ContainerInfo & HostId & { stats: Stats }

export type Image = ImageInfo & HostId & { name: string }
