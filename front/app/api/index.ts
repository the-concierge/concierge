import { Image, Container, ApplicationRemoteDTO } from './types'
import * as io from 'socket.io-client'

export const socket = io() as SocketIOClient.Socket

export interface AppState {
  containers: Container[]
  images: Image[]
  hosts: Concierge.Host[]
  credentials: Concierge.Credentials[]
  applications: Concierge.ApplicationDTO[]
  remotes: ApplicationRemoteDTO[]
  config: Concierge.Configuration
}

export async function getAll(state: AppState): Promise<AppState> {
  const containers = await getContainers(state.containers)
  const hosts = await getHosts(state.hosts)
  const images = await getImages(state.images)
  const credentials = await getCredentials(state.credentials)
  const applications = await getApplications(state.applications)
  const remotes = await getApplicationRemotes(state.remotes)
  const config = await getConfig()

  return {
    containers,
    hosts,
    images,
    credentials,
    applications,
    remotes,
    config
  }
}

export async function getDockerResources(state: AppState): Promise<AppState> {
  const containers = await getContainers(state.containers)
  const images = await getImages(state.images)

  return {
    ...state,
    containers,
    images
  }
}

export async function getContainers(from: Container[]) {
  const to = await get<Container[]>('/api/hosts/containers')
  for (const left of from) {
    const right = to.find(t => t.Id === left.Id)
    if (!right) {
      continue
    }

    left.State = right.State
    left.Status = right.Status
  }

  const mapped = to.map(container => ({
    ...container,
    stats: {
      mbIn: 'N/A',
      mbOut: 'N/A',
      cpu: '0%',
      memory: '0%'
    }
  }))

  return merge(from, mapped, 'Id')
}

export async function getImages(from: Image[]) {
  const to = await get<Image[]>('/api/images')
  for (const img of to) {
    const name = getTag(img.RepoTags || [])
    img.name = name
  }
  return merge(from, to.filter(t => t.name !== '<unknown>'), 'Id')
}

function getTag(tags: string[]) {
  const tag = tags.find(tag => tag !== '<none>:<none>')
  return tag || '<unknown>'
}

export async function getHosts(from: Concierge.Host[]) {
  const to = await get<Concierge.Host[]>('/api/hosts')
  return merge(from, to, 'id')
}

export async function getCredentials(from: Concierge.Credentials[]) {
  const to = await get<Concierge.Credentials[]>('/api/credentials')
  return merge(from, to, 'id')
}

export async function getApplications(from: Concierge.ApplicationDTO[]) {
  const to = await get<Concierge.ApplicationDTO[]>('/api/applications')
  return merge(from, to, 'id')
}

export async function getApplicationRemotes(from: ApplicationRemoteDTO[]) {
  const to = await get<ApplicationRemoteDTO[]>('/api/applications/branches?active')
  return merge(from, to, 'id')
}

export async function getConfig() {
  return get<Concierge.Configuration>('/api/configuration')
}

function get<T>(path: string) {
  return fetch(path).then(res => res.json()) as Promise<T>
}

function merge<T>(fromList: T[], toList: T[], idKey: keyof T) {
  const seen = new Set<any>()
  for (const to of toList) {
    seen.add(to[idKey])

    const isOld = fromList.some(from => from[idKey] === to[idKey])
    if (isOld) {
      continue
    }

    fromList.push(to)
  }

  // Remove unseen items as they're most likely deleted
  const seenList = fromList.filter(from => seen.has(from[idKey]))
  return seenList
}
