import createContainer from '../containers/create'
import * as request from '../request'
import * as codes from '../types/codes'
import NewContainerType = codes.NewContainerType

/**
 * Clone a container from a remote Concierge
 */
export default async function clone(cloneRequest: CloneRequest) {
  const createRequest: Concierge.NewContainer = {
    variant: cloneRequest.container.variant,
    dockerImage: cloneRequest.container.dockerImage,
    subdomain: cloneRequest.subdomain,
    label: cloneRequest.container.label,
    volume: null,
    variables: cloneRequest.container.variables || '[]'
  }

  const newType = NewContainerType.Normal

  const remoteUrl = getVolumeUrl(cloneRequest)

  // Fetch the volume archive of the remote Container
  const volume = await request.get(remoteUrl, false)

  // This is not guaranteed to be a Buffer, so we convert it to one and pass it to createContainer as an option
  createRequest.volume = new Buffer(volume)
  const result = await createContainer(createRequest, newType)
  return result
}

function getVolumeUrl(cloneRequest: CloneRequest) {
  const {hostname, port} = cloneRequest.concierge
  const containerId = cloneRequest.container.id
  const base = `http://${hostname}:${port}`
  const req = `/containers${containerId}/volume`

  return base + req
}

interface CloneRequest {
  concierge: {
    hostname: string;
    port: string;
  },
  container: Concierge.Container,
  subdomain: string
}