import getDockerClient from '../dockerClient'

/**
 * Retrieve available images on a Host
 */
export default function getImages(host: Concierge.Host) {
  let client = getDockerClient(host)

  let promise = new Promise<HostImages>((resolve, reject) => {
    let imageHandler = (error, images: HostImages) => {
      if (error) {
        return reject('[LISTIMAGES] ' + error)
      }
      resolve(images as any)
    }
    client.listImages({}, imageHandler)
  })

  return promise
}

type HostImages = Array<{
  Created: number;
  Id: string;
  ParentId: string;
  RepoTags: string[]
  Size: number;
  VirtualSize: number;
}>