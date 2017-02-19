import db from '../data/connection'
import * as states from '../types/states'
import deleteImage from '../registry/deleteImage'
import DeployedState = states.DeployedState

/**
 * Delete a Variant
 * Remove the Image from the Registry
 */
export default function del(variantName: string): Promise<Concierge.Variant[]> {
  variantName = variantName.toLocaleLowerCase()

  if (!variantName) {
    return Promise.reject('Invalid variantName supplied')
  }

  let request = deleteImage(variantName)
    .then(() => deleteVariant(variantName))

  return request
}

function deleteVariant(variantName: string) {
  return db('Variants')
    .update({ buildState: DeployedState[DeployedState.Deleted] })
    .where({ name: variantName })
}