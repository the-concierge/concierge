import getRegistry from './getRegistry'
import * as request from '../request'

/**
 * Return a list of 'repositories' currently on the registry
 */
export default async function getImages() {
  const registry = await getRegistry()
  const url = `http://${registry.url}/v2/_catalog` // V1: Was /v1/search

  const imageJson = await request.get(url, { timeout: 5000 })
  const images: { repositories: string[] } = JSON.parse(imageJson)
  return images.repositories
}