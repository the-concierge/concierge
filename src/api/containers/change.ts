import removeContainer from './remove'
import createContainer from './create'
import * as codes from '../../types/codes'
import NewContainerType = codes.NewContainerType
import db from '../../data/connection'
import registryIsOnline from '../registry/isOnline'

/**
 * Change the variant of a container
 *
 * 1. Remove the old container
 * 2. Create a new container in its place
 *
 * The new container will re-use the original application data
 */
export default function change(container: Concierge.Container, newContainer: Concierge.NewContainer) {
  newContainer.host = container.host

  return registryIsOnline()
    .then(() => removeContainer(container))
    .then(() => createContainer(newContainer, NewContainerType.Change))
    .then((updated: Concierge.Container) => {
      container.port = updated.port
      container.dockerId = updated.dockerId
      container.variant = updated.variant
      return updateRecord(container)
    })
}

function updateRecord(container: Concierge.Container) {
  return db('Containers')
    .update(container)
    .where({ id: container.id })
}