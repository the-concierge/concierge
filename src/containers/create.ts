import * as log from '../logger'
import db from '../data/connection'
import makeDirectory from '../ssh/makeDirectory'
import * as getHost from '../hosts/get'
import getLeastLoadedHost from '../hosts/getLeastLoaded'
import canCreate from './canCreate'
import runContainer from './run'
import getContainerPort from './getPort'
import validSubdomain from './validSubdomain'
import * as codes from '../types/codes'
import NewContainerType = codes.NewContainerType
import registryIsOnline from '../registry/isOnline'
import getRegistry from '../registry/getRegistry'
import { watchContainer } from '../events/containers'
import * as getApplications from '../applications/get'
import isVariantValid from '../variants/isValid'

/**
 Create a new container
 * Returns a promise that resolves with the docker id of the new container
 */
export default async function create(request: Concierge.NewContainer, newContainerType: NewContainerType) {
  newContainerType = newContainerType || NewContainerType.Normal
  let dockerId = ''

  if (!isValidRequest(request)) {
    throw new Error('Required fields missing. [variant / subdomain / label]')
  }

  const isValidSubdomain = await validSubdomain(request.subdomain)
  if (!isValidSubdomain) {
    throw new Error('Invalid subdomain: Invalid format or blacklisted. See Configuration for blacklist')
  }

  if (!isVariantValid(request.applicationId, request.variant)) {
    throw new Error('Invalid application/variant combination')
  }

  let newContainer = toContainer(request)
  let isRegistryOnline = await registryIsOnline()
  if (!isRegistryOnline) {
    throw new Error('Registry is unavailable')
  }

  let isCreatable = await canCreate(newContainer.subdomain, newContainerType)
  if (!isCreatable) {
    throw new Error('Unable to create container: Subdomain is not available')
  }

  // Find a home for the new container
  let newContainerHost = await (getContainerHost(newContainer))
  newContainer.host = newContainerHost.hostname

  // If the new container appdata needs a home, create one.
  // Only brand new containers or forked containers require a new directory
  if (newContainerType !== NewContainerType.Change) {
    newContainer.dockerImage = await (getDockerImageFor(request))
  }

  // A Normal request will use an applicationId and have no dockerImage property.
  if (newContainerType === NewContainerType.Normal) {
    await (makeDirectory(newContainerHost, newContainer.subdomain))
    newContainer.dockerImage = await (getDockerImageFor(request))
  }

  // Create the new container, learn its HTTP port and save the container record in the database
  const newContainerId = await (runContainer(newContainer, newContainerHost))
  dockerId = newContainerId
  newContainer.dockerId = newContainerId

  try {
    newContainer.port = await (getContainerPort(newContainer))
  } catch (ex) {
    log.warn('Container does not have any exposed ports')
  }

  // Let's cheekily tell our events to keep an eye on the new container
  const result = await saveContainer(newContainer, newContainerType)
  watchContainer(result)

  return result
}

async function getDockerImageFor(request: Concierge.NewContainer) {
  if (!request.applicationId || request.applicationId === 0) {
    return request.dockerImage
  }

  const application = await getApplications.one(request.applicationId)
  const registry = await getRegistry()
  return registry.getTaggedImage(application, request.variant)
}

// function makeContainerVolume(host: Concierge.Host, subdomain: string) {
//   return makeDirectory(host, subdomain)
// }

function getContainerHost(request: Concierge.NewContainer) {
  if (request.host) {
    return getHost.one(request.host)
  }
  return getLeastLoadedHost()
}

function saveContainer(container: Concierge.Container, containerType: NewContainerType) {
  let isChange = containerType === NewContainerType.Change
  if (isChange) {
    return Promise.resolve(container)
  }

  return db('containers')
    .insert(container)
    .then((ids: number[]) => {
      container.id = ids[0]
      return container as Concierge.Container
    })
}

function toContainer(request: Concierge.NewContainer): Concierge.Container {
  let container: Concierge.Container = {
    variant: request.variant,
    subdomain: request.subdomain.toLocaleLowerCase(),
    host: request.host || '',
    port: 0,
    isProxying: 0,
    dockerId: '',
    label: request.label,
    variables: request.variables,
    applicationId: request.applicationId || 0,
    dockerImage: request.dockerImage || ''
  }
  return container
}

function isValidRequest(request: Concierge.NewContainer) {
  if (request.subdomain && typeof request.subdomain === 'string' && request.subdomain.length > 0) {
    request.subdomain = request.subdomain.toLowerCase()
  }

  const isValidVariant = !!request.variant
  const isValidLabel = !!request.label && request.label.length > 0
  const isValid = isValidVariant && isValidLabel

  return isValid
}