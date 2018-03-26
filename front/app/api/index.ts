import { Image, Container, ApplicationRemoteDTO } from './types'

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

export async function getContainers(from: Container[]) {
  const to = await get<Container[]>('/api/containers')
  return merge(from, to, 'Id')
}

export async function getImages(from: Image[]) {
  const to = await get<Image[]>('/api/images')
  return merge(from, to, 'Id')
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
