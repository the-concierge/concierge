import * as getHosts from '../hosts/db'
import docker from '../docker'

export async function getAll() {
  const hosts = await getHosts.getAll()
  const allImages = await Promise.all(hosts.map(getImages))
  const images = allImages.reduce((list, curr) => {
    list.push(...curr)
    return list
  }, [])

  return images
}

export async function getOne(hostId: number) {
  const host = await getHosts.getOne(hostId)
  return getImages(host)
}

async function getImages(host: Concierge.Host) {
  const client = docker(host)
  const images = await client.listImages()

  for (const image of images) {
    const concierge = { hostId: host.id }
    image['concierge'] = concierge
  }

  return images
}