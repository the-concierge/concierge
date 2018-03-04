import hasImage from './hasImage'
import * as getContainers from '../containers/get'
import * as getVariants from '../variants/get'
import getRegistry from '../registry/getRegistry'
import * as request from '../request'

/**
 * Delete an Image (variant) from the Registry
 */
export default async function remove(variant: string) {
  const registryHasImage = await hasImage(variant)
  if (!registryHasImage) {
    return true
  }

  return tryRemove(variant)
}

function tryRemove(variant: string) {
  return getContainers
    .all()
    .then((containers: Concierge.Container[]) => isBeingUsed(containers, variant))
    .then(() => getVariants.all())
    .then(isEnoughVariants)
    .then(() => deleteVariant(variant))
    .then(result => {
      let isSuccessful = result === 'true'
      if (isSuccessful) {
        return true
      }
      throw new Error('Failed to form a valid request')
    })
}

function isBeingUsed(containers: Concierge.Container[], variant: string) {
  let isUsed = containers.some(c => c.variant === variant)
  if (isUsed) {
    return Promise.reject('Variant is being used by a container')
  }
  return Promise.resolve(true)
}

function isEnoughVariants(variants: Concierge.Variant[]) {
  let isEnough = variants.length > 4
  if (!isEnough) {
    return Promise.reject('Must have always at least 4 variants')
  }
  return Promise.resolve(true)
}

function deleteVariant(variant: string) {
  return getRegistry().then(registry => {
    let deleteUrl = `${registry.url}/v2/${variant}/manifests` // V1: Was /v1/repositories/{variant}/
    return request.del(deleteUrl)
  })
}
