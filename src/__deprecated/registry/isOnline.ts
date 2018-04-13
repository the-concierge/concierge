import getRegistry from './getRegistry'

/**
 * Will resolve if the registry is contactable, else reject
 * Satisfies /v1 and /v2 versions of registry API
 */
export default async function isOnline() {
  try {
    const registry = await getRegistry()
    return !!registry
  } catch (ex) {
    return false
  }
}
